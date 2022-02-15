function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

/**
 * Gets the first value
 * @param {String} values
 */
function anyY(values) {
  return values.filter((v) => !isBlank(v)).some((v) => v === "Y") ? "Y" : "N";
}

/**
 * Gets the first value
 * @param {String} values
 */
function first(values) {
  return values.filter((v) => !isBlank(v))[0];
}

/**
 * Gets the lowest value by natural sort
 *
 * @param {Array} values
 */
function lowest(values) {
  return values.filter((v) => !isBlank(v)).sort()[0];
}

/**
 * Gets the highest value by natural sort
 *
 * @param {Array} values
 */
function highest(values) {
  return values.filter((v) => !isBlank(v)).sort()[values.length - 1];
}

/**
 * Gets the unique values
 *
 * @param {Array} values
 */
function unique(values) {
  const un = new Set();
  values
    .filter((v) => !isBlank(v))
    .filter((v) => v.toLowerCase() !== "not applicable")
    .forEach((v) => un.add(v));
  return Array.from(un).sort();
}

const mappers = { anyY, first, highest, lowest, unique };

/**
 * Merges denormalized records into consolidated records by a primary key.
 * @param {array<any>} records the records to merge
 * @param {*} config the configuration for performing the merge
 * @param {string} config.primaryKey the primary key for performing the merging
 * @param {array<string>} config.primarySources the sources to retrieve the parimary key
 * @param {array.<{field: string, find: string, replace: string}>} config.replacements the replacements to perform
 * @param {*} config.fieldRules the field rules. Each entry should have a mapper and a key
 * @param {*} log the logger
 * @returns the merged records
 */
function mergeRecords(records = [], config = {}, log = {}) {
  log.info(`Denormalized record count: ${records.length}`);
  // first we need to define and set the primary key
  log.info(
    `Identifing primary key ${config.primaryKey} from ${JSON.stringify(
      config.primarySources
    )}`
  );
  records.forEach((record) => {
    const primarySources = config.primarySources.filter(
      (v) => record[v] && record[v] != ""
    );
    if (primarySources.length === 0) {
      return;
    }
    record[config.primaryKey] = record[primarySources[0]];
    for (const replacement of config.replacements) {
      const value = record[replacement.field];
      if (value && value.indexOf(replacement.find) !== -1) {
        record[replacement.field] = value.replace(
          replacement.find,
          replacement.replace
        );
      }
    }
  });

  // Add the unique primary keys to a set
  const keys = new Set();
  records
    .filter((r) => r[config.primaryKey] && r[config.primaryKey] !== "")
    .map((r) => r[config.primaryKey])
    .forEach((e) => keys.add(e));
  log.silly(
    `Skipping records missing primary key ${
      config.primaryKey
    }: ${JSON.stringify(
      records.filter(
        (r) => !r[config.primaryKey] || r[config.primaryKey] === ""
      ),
      null,
      2
    )}`
  );

  // loop through each primary key value
  const merged = [];
  keys.forEach((key) => {
    // get the duplicate records
    const duplicatedRecords = records.filter(
      (l) => l[config.primaryKey] === key
    );
    log.debug(
      `Merging record for ${key} from: ${JSON.stringify(
        duplicatedRecords,
        null,
        2
      )}`
    );

    // create a merged record by looping through each field and calling the merge operation
    const mergedRecord = {};
    Object.keys(records[0]).forEach((field) => {
      if (config.fieldRules[field]) {
        const rule = config.fieldRules[field];
        const values = duplicatedRecords.map((r) => {
          if (rule.adultField && r.Position !== "GIRL") {
            return r[rule.adultField];
          } else {
            return r[field];
          }
        });
        log.silly(
          `Merging field ${field} with rule ${
            rule.mapper
          } to value: ${JSON.stringify(values)}`
        );
        mergedRecord[rule.key] = mappers[rule.mapper](values);
      }
    });
    merged.push(mergedRecord);
  });
  log.info(`Merged record count: ${merged.length}`);
  return merged;
}

module.exports = mergeRecords;
