const csvStringifier = require("csv-writer").createObjectCsvStringifier;
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const path = require("path");

module.exports = function (input = "report.csv", output = "report.json") {
  // fail if the input file doesn't exist
  if (!fs.existsSync(input)) {
    throw new Error(`Input file not found: ${input}`);
  }

  // read the data
  let data = [];
  if (input.toLowerCase().endsWith("json")) {
    data = JSON.parse(fs.readFileSync(input));
  } else if (input.toLowerCase().endsWith("csv")) {
    data = parse(fs.readFileSync(input), {
      columns: true,
      skipEmptyLines: true,
    });
  } else {
    throw new Error(`Unsupported input file type: ${input}`);
  }

  // create the output if it doesn't exist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
  }

  // write out the data
  if (output.toLowerCase().endsWith("json")) {
    fs.writeFileSync(output, JSON.stringify(data, null, 2));
  } else if (output.toLowerCase().endsWith("csv")) {
    let csvData = "";
    if (data.length !== 0) {
      const stringifier = csvStringifier({
        header: Object.keys(data[0] || {}).map((k) => {
          return {
            id: k,
            title: k,
          };
        }),
      });
      csvData =
        stringifier.getHeaderString() + stringifier.stringifyRecords(data);
    }
    fs.writeFileSync(output, csvData);
  } else {
    throw new Error(`Unsupported input file type: ${input}`);
  }
};
