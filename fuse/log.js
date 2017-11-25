const chalk = require('chalk');
const log = console.log;
const err = chalk.bold.white.bgRed;
const warning = chalk.bold.yellow;
const info = chalk.bold.white.bgBlue;
const success = chalk.bold.white.bgGreen;

module.exports = {
    error(text) {
        log(err(text));
    },
    warn(text) {
        log(warning(text));
    },
    info(text) {
        log(info(text));
    },
    success(text) {
        log(success(text));
    }
}