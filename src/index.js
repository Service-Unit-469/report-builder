#!/usr/bin/env node

const converter = require("./converter");
const { filter } = require("./filter");
const fs = require("fs");
const LookerDownload = require("@service-unit-469/looker-downloader");
const merge = require("./merge");
const path = require("path");
const YAML = require("yaml");

function getLog(argv) {
  return require("./log")(argv.debug ? "silly" : "info");
}

function convert(argv) {
  const log = getLog(argv);
  const { input, output } = argv;
  log.info(`Converting ${input} to ${output}`);
  converter(input, output);
  log.info("File converted successfully!");
}
module.exports.convert = convert;

function mergecmd(argv) {
  const log = getLog(argv);
  const { input, output, mapping, pretty } = argv;
  log.info(`Mapping ${input} to ${output} using: ${mapping}`);

  if (!fs.existsSync(input)) {
    throw new Error(`Input file not found!`);
  }
  const records = JSON.parse(fs.readFileSync(input));

  if (!fs.existsSync(mapping)) {
    throw new Error(`Mapping config file not found!`);
  }
  const config = JSON.parse(fs.readFileSync(mapping));
  const merged = merge(records, config, log);

  if (!fs.existsSync(path.dirname(output))) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
  }
  if (pretty) {
    fs.writeFileSync(output, JSON.stringify(merged, null, 2));
  } else {
    fs.writeFileSync(output, JSON.stringify(merged));
  }
  log.info("File merged successfully!");
}
module.exports.mergecmd = mergecmd;

function filtercmd(argv) {
  const log = getLog(argv);
  const { input, output, pretty } = argv;

  log.info(`Filtering ${input} to ${output} with expression: ${argv.filter}`);

  if (!fs.existsSync(input)) {
    throw new Error(`Input file not found!`);
  }
  const records = JSON.parse(fs.readFileSync(input));
  const filtered = filter(records, argv.filter);

  if (output === "text") {
    log.info(`Result: \n\n${YAML.stringify(filtered)}`);
  } else {
    if (pretty) {
      fs.writeFileSync(output, JSON.stringify(filtered, null, 2));
    } else {
      fs.writeFileSync(output, JSON.stringify(filtered));
    }
  }
  log.info("File filtered successfully!");
}
module.exports.filtercmd = filtercmd;

require("yargs")
  .scriptName("report-builder")
  .usage("$0 <cmd> [args]")

  .option("debug", {
    alias: ["X"],
    description: "debug / silly logging",
    type: "boolean",
    default: false,
  })
  .command(
    "download",
    "Downloads a report from either the current or previous year",
    (yargs) => {
      yargs.options({
        year: {
          alias: "y",
          demandOption: false,
          describe: "the year to download, either 'Current' or 'Last'",
          default: "Current",
          type: "string",
        },
        user: {
          alias: "u",
          demandOption: true,
          describe: "your looker username",
          type: "string",
        },
        password: {
          alias: "p",
          demandOption: true,
          describe: "your looker password",
          type: "string",
        },
        destination: {
          alias: "d",
          demandOption: true,
          describe: "the file to which to save the downloaded report",
          type: "string",
          default: "report.csv",
        },
        report: {
          alias: "r",
          describe: "the looker report id to run",
          type: "string",
          default: "1077",
        },
        headful: {
          describe:
            "launch browser in headful mode instead of headless (useful for debugging issues)",
          type: "boolean",
          default: false,
        },
      });
    },
    async function (argv) {
      const log = getLog(argv);
      const downloader = new LookerDownload(
        "https://girlscouts.looker.com",
        argv.user,
        argv.password,
        !argv.headful,
        log
      );
      await downloader.startup();
      await downloader.downloadReport(argv.report, argv.destination);
      await downloader.shutdown();
    }
  )
  .command(
    "convert",
    "Converts reports between JSON and CSV",
    (yargs) => {
      yargs.options({
        input: {
          alias: "i",
          describe: "the input file",
          type: "string",
          demandOption: true,
        },
        output: {
          alias: "o",
          describe: "the output file",
          type: "string",
          demandOption: true,
        },
      });
    },
    convert
  )
  .command(
    "merge",
    "Merges a normalized array of JSON records to a consolidated array of records",
    (yargs) => {
      yargs.options({
        input: {
          alias: "i",
          describe: "the input file",
          type: "string",
          demandOption: true,
        },
        output: {
          alias: "o",
          describe: "the outpuf file",
          type: "string",
          demandOption: true,
        },
        mapping: {
          alias: "m",
          describe: "the mapping config file",
          type: "string",
          demandOption: true,
        },
        pretty: {
          alias: "p",
          describe: "pretty print the output",
          type: "boolean",
          default: false,
        },
      });
    },
    mergecmd
  )
  .command(
    "filter",
    "Filters an array of records based on expressions",
    (yargs) => {
      yargs.options({
        input: {
          alias: "i",
          describe: "the input file",
          type: "string",
          demandOption: true,
        },
        output: {
          alias: "o",
          describe: "the output file (or 'text' to write to the console)",
          type: "string",
          default: "text",
        },
        filter: {
          alias: "f",
          describe: "the filter to execute",
          type: "string",
          demandOption: true,
        },
        pretty: {
          alias: "p",
          describe: "pretty print the output",
          type: "boolean",
          default: false,
        },
      });
    },
    filtercmd
  )
  .demandCommand(1, "You must specify a command")
  .help().argv;
