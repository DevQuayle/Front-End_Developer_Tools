const {Sparky} = require("fuse-box");
const Log = require('../log');
const CONFIG = require('../config');

let images = Sparky.task('images', () => {
    return Sparky.watch(CONFIG.sparks.images.watch, {base: CONFIG.sparks.images.base})
        .clean(CONFIG.sparks.images.dest)
        .dest(CONFIG.sparks.images.dest)
        .completed(()=>{
            Log.success('Coppied images');
        });
});

module.exports = images;