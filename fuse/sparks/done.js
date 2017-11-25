const {Sparky} = require("fuse-box");
const Log = require('../log');

let done =Sparky.task('exit',()=>{
    Log.success('          Done          ');
    process.kill(process.pid);
});

module.exports = done;