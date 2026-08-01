/* eslint-disable no-console */
import exportPackage from './export';
import validatePackage, { Finding } from './validate';
import bootHeadless, { CliEnvironmentError } from './boot-headless';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../../package.json');

const EXIT_OK = 0;
const EXIT_FINDINGS_OR_FAILURE = 1;
const EXIT_USAGE_ERROR = 2;
const EXIT_ENVIRONMENT_ERROR = 3;

interface ParsedArgs {
  command?: 'validate' | 'export';
  positional: string[];
  json: boolean;
  librariesDir?: string;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    positional: [],
    json: false,
    help: false,
    version: false
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--version' || arg === '-v') {
      result.version = true;
    } else if (arg === '--json') {
      result.json = true;
    } else if (arg === '--libraries') {
      i += 1;
      result.librariesDir = argv[i];
    } else if (!result.command && (arg === 'validate' || arg === 'export')) {
      result.command = arg;
    } else {
      result.positional.push(arg);
    }
    i += 1;
  }

  return result;
}

function printHelp(): void {
  console.error(`lumi-cli - headless export/validate for Lumi .h5p packages

Usage:
  lumi-cli validate <input.h5p> [--json] [--libraries <dir>]
  lumi-cli export   <input.h5p> <output.html> [--json] [--libraries <dir>]

Exit codes:
  0  success, no findings
  1  validate reported findings, or export failed
  2  usage error
  3  environment error (e.g. library cache not found)
`);
}

function printFindings(
  command: string,
  input: string,
  findings: Finding[],
  json: boolean
): void {
  if (json) {
    console.log(
      JSON.stringify({
        ok: findings.every((f) => f.severity !== 'error'),
        command,
        input,
        findings
      })
    );
    return;
  }

  if (findings.length === 0) {
    console.log(`OK: no findings for "${input}"`);
    return;
  }

  findings.forEach((finding) => {
    const location = finding.path ?? finding.library ?? '';
    console.log(
      `${finding.severity.toUpperCase()} ${finding.code}${
        location ? ` ${location}` : ''
      }: ${finding.message}`
    );
  });
}

export async function main(
  argv: string[] = process.argv.slice(2)
): Promise<void> {
  const args = parseArgs(argv);

  if (args.version) {
    console.log(packageJson.version);
    process.exit(EXIT_OK);
  }

  if (args.help) {
    printHelp();
    process.exit(EXIT_OK);
  }

  if (!args.command) {
    printHelp();
    process.exit(EXIT_USAGE_ERROR);
  }

  if (args.command === 'validate' && args.positional.length !== 1) {
    console.error('validate requires exactly one argument: <input.h5p>');
    printHelp();
    process.exit(EXIT_USAGE_ERROR);
  }

  if (args.command === 'export' && args.positional.length !== 2) {
    console.error(
      'export requires exactly two arguments: <input.h5p> <output.html>'
    );
    printHelp();
    process.exit(EXIT_USAGE_ERROR);
  }

  let ctx;
  try {
    ctx = await bootHeadless({ librariesDir: args.librariesDir });
  } catch (error) {
    if (error instanceof CliEnvironmentError) {
      console.error(`Environment error: ${error.message}`);
      process.exit(EXIT_ENVIRONMENT_ERROR);
    }
    console.error(`Failed to start: ${(error as Error)?.message ?? error}`);
    process.exit(EXIT_ENVIRONMENT_ERROR);
    return;
  }

  try {
    if (args.command === 'validate') {
      const [input] = args.positional;
      const findings = await validatePackage(ctx, input);
      printFindings('validate', input, findings, args.json);
      const hasErrors = findings.some((f) => f.severity === 'error');
      process.exitCode = hasErrors ? EXIT_FINDINGS_OR_FAILURE : EXIT_OK;
    } else {
      const [input, output] = args.positional;
      await exportPackage(ctx, input, output);
      if (args.json) {
        console.log(
          JSON.stringify({ ok: true, command: 'export', input, output })
        );
      } else {
        console.log(output);
      }
      process.exitCode = EXIT_OK;
    }
  } catch (error) {
    console.error(
      `${args.command} failed: ${(error as Error)?.message ?? error}`
    );
    process.exitCode = EXIT_FINDINGS_OR_FAILURE;
  } finally {
    await ctx.cleanup();
  }
}

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled rejection: ${(reason as Error)?.message ?? reason}`);
  process.exit(EXIT_ENVIRONMENT_ERROR);
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error?.message ?? error}`);
  process.exit(EXIT_ENVIRONMENT_ERROR);
});

if (require.main === module) {
  main();
}
