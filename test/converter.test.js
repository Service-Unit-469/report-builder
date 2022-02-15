const { convert } = require("../src/index");
const { expect } = require("chai");
const fs = require("fs");

const chai = require("chai");
const like = require("chai-like");
chai.use(like);

before(() => {
  if (fs.existsSync("./dist")) {
    fs.rmSync("./dist", { recursive: true });
  }
  fs.mkdirSync("./dist");
});

describe("Converter - happy path tests", () => {
  it("csv to json", () => {
    convert({
      input: "./test/report.csv",
      output: "./dist/report.json",
    });

    expect(fs.existsSync("./dist/report.json")).to.be.true;
    expect(JSON.parse(fs.readFileSync("./dist/report.json"))).like(
      JSON.parse(fs.readFileSync("./test/expected.json"))
    );
  });
  it("json to csv", () => {
    convert({
      input: "./dist/report.json",
      output: "./dist/report.csv",
    });

    expect(fs.existsSync("./dist/report.csv")).to.be.true;

    expect(fs.readFileSync("./dist/report.csv").toString()).to.equal(
      fs.readFileSync("./test/report.csv").toString()
    );
  });
});

describe("Converter - sad path tests", () => {
  it("Fails with missing input", () => {
    expect(() => {
      convert({
        input: "./test/dne.csv",
        output: "./dist/report.json",
      });
    }).to.throw(Error);
  });
  it("Fails with invalid input", () => {
    expect(() => {
      convert({
        input: "./test/converter.test.js",
        output: "./dist/report.json",
      });
    }).to.throw(Error);
  });
  it("Fails with invalid output", () => {
    expect(() => {
      convert({
        input: "./test/report.csv",
        output: "./dist/report.xls",
      });
    }).to.throw(Error);
  });
});
