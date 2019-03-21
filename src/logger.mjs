import winston from "winston"

const format = winston.format

export const logger = winston.createLogger({
  format: format.combine(
            format.colorize(),
            format.printf(function(info) {
              return `${info.message}`
            })),
  transports: [
    new winston.transports.Console()
  ]
})
