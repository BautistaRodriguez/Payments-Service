const { log } = require("../config");
const winston = require("winston");

const logConfiguration = {
    "transports": [
        new winston.transports.File({
            filename: "logs/api_gateway.log",
        }),
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.timestamp({
           format: "MMM-DD-YYYY HH:mm:ss"
       }),
        winston.format.printf(info => `${info.level}: | ${[info.timestamp]} | ${info.message}`),
    )
};

const logger = winston.createLogger(logConfiguration);

const logInfo = function(message){
    if (log.info){
        logger.info(message);
    }
};

const logDebug = function(message){
    if (log.debug){
        logger.debug(message);
    }
};

const logWarn = function(message){
    if (log.warn){
        logger.warn(message);
    }
};

const logError = function(message){
    if (log.error){
        logger.error(message);
    }
};

module.exports = {
  logInfo,
  logDebug,
  logWarn,
  logError,
};
