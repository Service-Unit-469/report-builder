const { mergecmd } = require("../src/index");
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

describe("Merge - happy path tests", () => {
  it("simple merge", () => {
    mergecmd({
      input: "./test/expected.json",
      output: "./dist/merged.json",
      mapping: "./test/merge-config.json",
    });

    expect(fs.existsSync("./dist/merged.json")).to.be.true;
    expect(JSON.parse(fs.readFileSync("./dist/merged.json"))).like(
      JSON.parse(fs.readFileSync("./test/merged-expected.json"))
    );
  });
});
