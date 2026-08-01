# `lumi-cli` — headless export and validation

A non-GUI entry point for checking and exporting `.h5p` packages, intended for
programmatic producers of H5P content (e.g. a generator that builds packages and
needs to verify them in CI without a human opening Lumi).

It reuses Lumi's own export pipeline, so `export` produces the same all-in-one
HTML as the GUI's **Export as HTML**, including the `patch-package` fixes in
`patches/`.

## Setup

```bash
npm install     # runs patch-package via postinstall — required
npm run build   # compiles to build/
```

Then invoke it directly (the package is `private`, so there is no global install):

```bash
node E:\GithubRepos\Lumi\bin\lumi-cli.js <command> ...
```

`npm run cli -- <command> ...` works too, from inside the repo.

## Commands

```
lumi-cli validate <input.h5p>              [--json] [--libraries <dir>]
lumi-cli export   <input.h5p> <out.html>   [--json] [--libraries <dir>]
lumi-cli --help
lumi-cli --version
```

| Flag | Meaning |
|---|---|
| `--json` | Emit a single JSON object on stdout instead of human-readable lines. |
| `--libraries <dir>` | Use a different library cache. Defaults to `%APPDATA%\Lumi\libraries`. |

`LUMI_CLI_LOG_LEVEL` (default `warn`) controls diagnostic verbosity. All logs go
to **stderr**; stdout carries only the result, so it is safe to pipe.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success — export written, or validate found no errors. |
| `1` | `validate` found at least one error-severity finding, or `export` failed. |
| `2` | Usage error (bad arguments). |
| `3` | Environment error — e.g. the library cache does not exist, input unreadable. |

Exit `3` means *the tool could not run*, not *the package is bad*. Treat it
differently from `1` in a build script.

## Output

`validate --json`:

```json
{
  "ok": false,
  "command": "validate",
  "input": "w2-b1-classwork.h5p",
  "findings": [
    {
      "code": "disallowed-html",
      "severity": "error",
      "message": "Field \"$.question\" (question) contains a <table> tag, ...",
      "path": "$.question",
      "library": "H5P.Blanks-1.14"
    }
  ]
}
```

`path` and `library` are optional and appear only where meaningful. `severity` is
`error` or `warning`; **only `error` affects the exit code**.

`export --json` emits `{"ok": true, "command": "export", "input": ..., "output": ...}`.
Without `--json`, `export` prints just the output path.

## Finding codes

| Code | Severity | Meaning |
|---|---|---|
| `structural-validation-error` | error | The package is malformed: bad zip layout, `h5p.json`/`library.json` failing schema, unparseable `content.json`, disallowed file extension. |
| `missing-library` | error | A library declared in `h5p.json` is not installed in the cache at that exact `major.minor`. |
| `main-library-not-declared` | error | `mainLibrary` is not listed in `preloadedDependencies`. |
| `missing-required-field` | error | A non-optional semantics field has no value. |
| `disallowed-sub-library` | error | A `library` field uses a library outside its semantics `options`. |
| `disallowed-html` | error | A text field contains an HTML tag its semantics forbid. **This is the important one** — see below. |
| `missing-media-file` | error | `content.json` references a file that is not in the archive. |
| `semantics-not-checked` | warning | Semantics were skipped because the library is not installed. Always accompanied by `missing-library`. |

### Why `disallowed-html` matters

When Lumi imports a package, `SemanticsEnforcer` **silently strips** tags a field
does not allow — it repairs rather than reports. A `<table>` inside a field that
permits only inline markup does not error; it is quietly flattened to its text,
which is why this class of defect was historically only discovered by a human
looking at the finished export. `validate` reports what the importer would
silently remove, before it happens.

The allowlist mirrors H5P's own expansion: a field permitting `ul`/`ol` also
permits `li`, `table` also permits `tr`/`td`/`th`/etc., and `strong`/`b` and
`em`/`i` imply each other. `script`, `style`, `textarea` and `option` are never
allowed, even if the semantics list them.

## Using it from a build script

```python
import json, subprocess

LUMI_CLI = r"E:\GithubRepos\Lumi\bin\lumi-cli.js"

def validate(h5p_path):
    proc = subprocess.run(
        ["node", LUMI_CLI, "validate", str(h5p_path), "--json"],
        capture_output=True, text=True,
    )
    if proc.returncode == 3:                      # tool could not run
        raise RuntimeError(f"lumi-cli environment error: {proc.stderr.strip()}")
    if proc.returncode == 2:
        raise RuntimeError(f"lumi-cli usage error: {proc.stderr.strip()}")

    report = json.loads(proc.stdout)              # stdout is always clean JSON
    errors = [f for f in report["findings"] if f["severity"] == "error"]
    for f in errors:
        print(f"  {f['code']} {f.get('path', '')}: {f['message']}")
    return errors                                 # empty == package is sound
```

Exit code and `findings` agree, so either may be used as the gate. Prefer
`returncode == 0` for a simple pass/fail and the `findings` list for reporting.

## Things worth knowing

- **The library cache is shared with the GUI.** By default the CLI reads
  `%APPDATA%\Lumi\libraries`, the same cache Lumi uses, so both agree on which
  library versions exist. Point a generator at that same path.
- **`export` installs libraries into that shared cache.** If the package bundles a
  library version not yet present, it is installed — exactly as the GUI does on
  import. This mutates the shared cache.
- **CLI runs never appear in the GUI's content list.** Content and temporary files
  go to a per-run temporary directory that is deleted on exit.
- **Semantics are only checked for installed libraries.** A package depending on a
  missing library gets `missing-library` plus `semantics-not-checked`; its content
  is not inspected.
- **Fields that declare no `tags` are not HTML-checked at all.** H5P falls back to
  sanitize-html's defaults there, which this tool does not attempt to reproduce —
  a deliberate choice to avoid false positives.
- **`validate` checks H5P structure only.** Language, pedagogy and house style are
  out of scope and belong in the content project's own tests.
