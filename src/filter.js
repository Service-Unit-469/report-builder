const { compileExpression } = require("filtrex");

/**
 * Filters the specified records using filtrex expressons.
 * To ensure that keys are accessible the follwing characters will be replaced with '_': ' /().'
 *
 *
 * @param {array<any>} records the records to filter
 * @param {string} filter the filter expression
 * @returns the filtered records
 */
module.exports = function (records, filter) {
  const filterfn = compileExpression(filter);
  const toFilter = [];
  records.forEach((original) => {
    const safe = {};
    Object.keys(original).forEach((key) => {
      safe[key.replace(/[ \/\(\)\.]/g, "_")] = original[key];
    });
    toFilter.push({
      safe,
      original,
    });
  });
  return toFilter.filter((f) => filterfn(f.safe)).map((f) => f.original);
};
