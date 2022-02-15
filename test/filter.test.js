const { filtercmd } = require("../src/index");
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

describe("Filter - happy path tests", () => {
  it("simple filter", () => {
    filtercmd({
      input: "./test/expected.json",
      output: "./dist/filtered.json",
      filter: 'First_Name == "First"',
    });

    expect(fs.existsSync("./dist/filtered.json")).to.be.true;

    const filteredJson = JSON.parse(fs.readFileSync("./dist/filtered.json"));
    expect(filteredJson.length).to.equal(1);
    expect(filteredJson[0]["First Name"]).to.equal("First");
  });
  it("filter all", () => {
    filtercmd({
      input: "./test/expected.json",
      output: "./dist/filtered.json",
      filter: 'City != "Cincinnati"',
    });

    expect(fs.existsSync("./dist/filtered.json")).to.be.true;

    const filteredJson = JSON.parse(fs.readFileSync("./dist/filtered.json"));
    expect(filteredJson.length).to.equal(0);
  });
});

describe("Filter - sad path tests", () => {
  it("fails on bad filter expression", () => {
    expect(() =>
      filtercmd({
        input: "./test/expected.json",
        output: "./dist/filtered.json",
        filter: 'First_Name = "First"',
      })
    ).to.throw(Error);
  });
  it("fails on missing input", () => {
    expect(() =>
      filtercmd({
        input: "./test/notafile.json",
        output: "./dist/filtered.json",
        filter: 'First_Name == "First"',
      })
    ).to.throw(Error);
  });
});
