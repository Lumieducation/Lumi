/**
 * @lumieducation/h5p-server 9.3.3 does not export PackageValidator,
 * PackageImporter or ContentScanner from its public entry point, but all
 * three are needed to build `validate`: PackageImporter.extractPackage to
 * get an extracted-package directory (structurally the same input
 * PackageValidator and the GUI's own import path expect), PackageValidator
 * for structural checks, and ContentScanner to walk content.json against
 * semantics.json for a custom semantics-conformance report (see
 * validate.ts for why the library's own SemanticsEnforcer can't be reused --
 * it silently repairs instead of reporting).
 *
 * These are deep imports into the package's compiled internals and are
 * pinned to 9.3.3's internal file layout. Isolated here so an upgrade only
 * requires touching one file.
 */
// eslint-disable-next-line import/no-internal-modules
import PackageImporter from '@lumieducation/h5p-server/build/src/PackageImporter';
// eslint-disable-next-line import/no-internal-modules
import PackageValidator from '@lumieducation/h5p-server/build/src/PackageValidator';
// eslint-disable-next-line import/no-internal-modules
import { ContentScanner } from '@lumieducation/h5p-server/build/src/ContentScanner';
// ISemanticsEntry describes a semantics.json field. It is part of the
// package's public type surface but, unlike most of `types`, is not
// re-exported from the index.
// eslint-disable-next-line import/no-internal-modules
import type { ISemanticsEntry } from '@lumieducation/h5p-server/build/src/types';

export { ContentScanner, PackageImporter, PackageValidator };
export type { ISemanticsEntry };
