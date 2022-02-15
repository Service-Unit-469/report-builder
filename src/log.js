const winston = require("winston");

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.align(),
  winston.format.printf((info) => {
    if (info.meta && info.meta instanceof Error) {
      info.message = `${info.message} ${info.meta.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

module.exports = function (level = "info") {
  return winston.createLogger({
    format,
    transports: [new winston.transports.Console()],
    level,
  });
};
