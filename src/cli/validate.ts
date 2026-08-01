import fs from 'fs';
import os from 'os';
import path from 'path';
import * as H5P from '@lumieducation/h5p-server';

import { HeadlessContext } from './boot-headless';
import {
  ContentScanner,
  ISemanticsEntry,
  PackageImporter,
  PackageValidator
} from './h5p-internals';

export interface Finding {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  path?: string;
  library?: string;
}

/**
 * Tags SemanticsEnforcer strips unconditionally, even when a field's
 * semantics list them.
 */
const NEVER_ALLOWED_HTML_TAGS = ['script', 'style', 'textarea', 'option'];

/**
 * Reproduces the allowlist SemanticsEnforcer builds before handing text to
 * sanitize-html (see SemanticsEnforcer.js, "Filter out disallowed HTML
 * tags"). A field's `tags` list is only the starting point: H5P then adds
 * the structural or paired tags that would otherwise be unusable -- `li`
 * for a field allowing `ul`/`ol`, the row/cell tags for `table`, and the
 * b/strong and i/em synonyms. Missing that expansion is what made an
 * ordinary bulleted list look like a defect.
 *
 * Returns null when the field declares no `tags` at all. H5P then falls
 * back to sanitize-html's own defaults rather than this allowlist, and
 * guessing at those would produce exactly the kind of false positive this
 * function exists to avoid -- so callers should skip the check instead.
 */
function allowedHtmlTagsFor(semantics: ISemanticsEntry): Set<string> | null {
  if (!semantics.tags) {
    return null;
  }

  const tags = ['div', 'span', 'p', 'br', ...semantics.tags];

  if (tags.includes('table')) {
    tags.push(
      'tr',
      'td',
      'th',
      'colgroup',
      'thead',
      'tbody',
      'tfoot',
      'caption'
    );
  }
  if (tags.includes('strong')) {
    tags.push('b');
  } else if (tags.includes('b')) {
    tags.push('strong');
  }
  if (tags.includes('em')) {
    tags.push('i');
  } else if (tags.includes('i')) {
    tags.push('em');
  }
  if (tags.includes('ul') || tags.includes('ol')) {
    tags.push('li');
  }
  if (tags.includes('del') || tags.includes('strike')) {
    tags.push('s');
  }

  const allowed = new Set(tags.map((tag) => tag.toLowerCase()));
  NEVER_ALLOWED_HTML_TAGS.forEach((tag) => allowed.delete(tag));
  return allowed;
}

function findMainLibrary(
  metadata: H5P.IContentMetadata
): H5P.ILibraryName | undefined {
  return metadata.preloadedDependencies.find(
    (dependency) => dependency.machineName === metadata.mainLibrary
  );
}

function libraryUbername(library: H5P.ILibraryName): string {
  return `${library.machineName}-${library.majorVersion}.${library.minorVersion}`;
}

/**
 * Checks h5p.json's declared dependencies (preloaded + editor) against the
 * installed library cache. This is what would have caught, for example, a
 * package built against a library version the shared cache no longer has.
 */
async function checkLibraryPresence(
  ctx: HeadlessContext,
  metadata: H5P.IContentMetadata
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const dependencies = [
    ...(metadata.preloadedDependencies ?? []),
    ...(metadata.editorDependencies ?? [])
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const dependency of dependencies) {
    const libraryName = new H5P.LibraryName(
      dependency.machineName,
      dependency.majorVersion,
      dependency.minorVersion
    );
    // eslint-disable-next-line no-await-in-loop
    const exists =
      await ctx.h5pEditor.libraryManager.libraryExists(libraryName);
    if (!exists) {
      findings.push({
        code: 'missing-library',
        severity: 'error',
        library: libraryUbername(dependency),
        message: `Library "${libraryUbername(
          dependency
        )}" is declared by the package but is not installed in the library cache.`
      });
    }
  }

  return findings;
}

/**
 * Walks content.json against each library's semantics.json and reports
 * conformance problems instead of silently repairing them the way Lumi's
 * SemanticsEnforcer does on import. This is what catches things like an
 * HTML tag a text field's semantics forbid (e.g. a <table> inside an
 * H5P.Blanks question text, which is exactly what flattened the
 * place-value table in the 2026-08-01 review).
 *
 * Only runs for libraries that are actually installed -- semantics.json
 * can't be loaded for a library that isn't. Packages with missing libraries
 * already get a `missing-library` finding from checkLibraryPresence; this
 * function additionally emits `semantics-not-checked` so it's clear the
 * content of that library was never inspected.
 */
async function checkSemanticsConformance(
  ctx: HeadlessContext,
  metadata: H5P.IContentMetadata,
  parameters: any
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const mainLibrary = findMainLibrary(metadata);

  if (!mainLibrary) {
    findings.push({
      code: 'main-library-not-declared',
      severity: 'error',
      message: `mainLibrary "${metadata.mainLibrary}" is not listed among preloadedDependencies; cannot check semantics.`
    });
    return findings;
  }

  const mainLibraryName = new H5P.LibraryName(
    mainLibrary.machineName,
    mainLibrary.majorVersion,
    mainLibrary.minorVersion
  );

  const exists =
    await ctx.h5pEditor.libraryManager.libraryExists(mainLibraryName);
  if (!exists) {
    findings.push({
      code: 'semantics-not-checked',
      severity: 'warning',
      library: libraryUbername(mainLibrary),
      message: `Skipped semantics conformance check: "${libraryUbername(
        mainLibrary
      )}" is not installed.`
    });
    return findings;
  }

  const scanner = new ContentScanner(ctx.h5pEditor.libraryManager);

  await scanner.scanContent(
    parameters,
    mainLibraryName,
    (semantics, params, jsonPath) => {
      if (!semantics) {
        return false;
      }

      // `common` fields (mostly UI text like "a11yCheck") are shared across
      // all instances of the library and are populated from the library's
      // own translation/defaults mechanism, not from this instance's
      // params -- their absence here is normal, not a defect.
      if (
        semantics.optional !== true &&
        semantics.common !== true &&
        (params === undefined || params === null || params === '')
      ) {
        findings.push({
          code: 'missing-required-field',
          severity: 'error',
          path: jsonPath,
          message: `Required field "${jsonPath}" (${semantics.name}) has no value.`
        });
      }

      if (semantics.type === 'library' && params?.library) {
        const allowedOptions = semantics.options ?? [];
        if (!allowedOptions.includes(params.library)) {
          findings.push({
            code: 'disallowed-sub-library',
            severity: 'error',
            path: jsonPath,
            library: params.library,
            message: `Field "${jsonPath}" uses library "${
              params.library
            }", which is not among the allowed options [${allowedOptions.join(', ')}].`
          });
        }
      }

      if (semantics.type === 'text' && typeof params === 'string') {
        const allowedTags = allowedHtmlTagsFor(semantics);
        if (allowedTags) {
          const reported = new Set<string>();
          const tagMatches = params.matchAll(/<\s*([a-zA-Z0-9]+)/g);
          // eslint-disable-next-line no-restricted-syntax
          for (const match of tagMatches) {
            const tag = match[1].toLowerCase();
            // One finding per tag per field: repeating it for every
            // occurrence buries the signal without adding information.
            if (!allowedTags.has(tag) && !reported.has(tag)) {
              reported.add(tag);
              findings.push({
                code: 'disallowed-html',
                severity: 'error',
                path: jsonPath,
                message:
                  `Field "${jsonPath}" (${
                    semantics.name
                  }) contains a <${tag}> tag, which its semantics do not allow ` +
                  `(allowed: ${[...allowedTags].sort().join(', ')}). Lumi's importer ` +
                  `strips this silently instead of rendering it -- this is why ` +
                  `content using it can look flattened or broken once exported.`
              });
            }
          }
        }
      }

      return false;
    }
  );

  return findings;
}

/**
 * Every media path content.json references (images, audio, video, generic
 * files) must actually exist inside the archive. This catches the "tree
 * diagram entirely absent" class of defect: the reference is there, the
 * file backing it never made it into the package.
 */
async function checkMediaFilesExist(
  ctx: HeadlessContext,
  metadata: H5P.IContentMetadata,
  parameters: any,
  extractedContentDir: string
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const mainLibrary = findMainLibrary(metadata);
  if (!mainLibrary) {
    return findings;
  }

  const mainLibraryName = new H5P.LibraryName(
    mainLibrary.machineName,
    mainLibrary.majorVersion,
    mainLibrary.minorVersion
  );

  const exists =
    await ctx.h5pEditor.libraryManager.libraryExists(mainLibraryName);
  if (!exists) {
    // Already reported as missing-library / semantics-not-checked.
    return findings;
  }

  const fileScanner = new H5P.ContentFileScanner(ctx.h5pEditor.libraryManager);
  const references = await fileScanner.scanForFiles(
    parameters,
    mainLibraryName
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const reference of references) {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(reference.filePath)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const absolutePath = path.join(extractedContentDir, reference.filePath);
    // eslint-disable-next-line no-await-in-loop
    const fileExists = await fs.promises
      .access(absolutePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      findings.push({
        code: 'missing-media-file',
        severity: 'error',
        path: reference.context.jsonPath,
        message: `Field "${reference.context.jsonPath}" references file "${reference.filePath}", which does not exist in the package.`
      });
    }
  }

  return findings;
}

export default async function validatePackage(
  ctx: HeadlessContext,
  h5pPath: string
): Promise<Finding[]> {
  const findings: Finding[] = [];

  const extractDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'lumi-cli-validate-')
  );
  try {
    await PackageImporter.extractPackage(h5pPath, extractDir, {
      includeLibraries: false,
      includeContent: true,
      includeMetadata: true
    });

    // Structural checks: zip contents, h5p.json/library.json/semantics.json
    // schema validity, core API version, file extension whitelists.
    const packageValidator = new PackageValidator(
      ctx.h5pEditor.config,
      ctx.h5pEditor.libraryManager
    );
    try {
      await packageValidator.validateExtractedPackage(
        extractDir,
        true,
        true,
        true
      );
    } catch (error: any) {
      const nestedErrors: Array<{ message: string }> =
        typeof error?.getErrors === 'function' ? error.getErrors() : [error];
      nestedErrors.forEach((nested) => {
        findings.push({
          code: 'structural-validation-error',
          severity: 'error',
          message: nested?.message ?? String(nested)
        });
      });
    }

    const h5pJsonPath = path.join(extractDir, 'h5p.json');
    const contentJsonPath = path.join(extractDir, 'content', 'content.json');

    if (!fs.existsSync(h5pJsonPath) || !fs.existsSync(contentJsonPath)) {
      // Structural check above will already have reported this; nothing
      // further can be checked without both files.
      return findings;
    }

    const metadata: H5P.IContentMetadata = JSON.parse(
      await fs.promises.readFile(h5pJsonPath, 'utf-8')
    );
    const parameters = JSON.parse(
      await fs.promises.readFile(contentJsonPath, 'utf-8')
    );

    findings.push(...(await checkLibraryPresence(ctx, metadata)));
    findings.push(
      ...(await checkSemanticsConformance(ctx, metadata, parameters))
    );
    findings.push(
      ...(await checkMediaFilesExist(
        ctx,
        metadata,
        parameters,
        path.join(extractDir, 'content')
      ))
    );

    return findings;
  } finally {
    await fs.promises.rm(extractDir, { recursive: true, force: true });
  }
}
