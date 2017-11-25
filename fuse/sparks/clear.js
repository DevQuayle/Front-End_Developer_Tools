const {Sparky} = require("fuse-box");
const CONFIG = require('../config');
const Log = require('../log');

let clear = Sparky.task('clear', () => {
    return Sparky.src(CONFIG.root.dest)
        .clean(CONFIG.root.dest)
        .completed(() => {
            Log.success('Clear dist folder');
        });
})

module.exports = clear;
