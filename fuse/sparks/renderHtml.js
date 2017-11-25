const {Sparky} = require("fuse-box");
const bs = require("browser-sync");
const templateRender = require('nunjucks');

const CONFIG = require('../config');


Sparky.task('render', () => {
    return Sparky.src(CONFIG.sparks.html.watch, {base: CONFIG.sparks.html.base})
        .file('*.*', file => {
            templateRender.configure(CONFIG.sparks.html.base);
            templateRender.render(file.homePath, (err, res) => {
                if (err) log(error(err));
                if (res) file.setContent(res);
            });
            file.extension = 'html';
        })
        .dest(CONFIG.sparks.html.dest)
        .completed(() => {
            bs.reload();
        });
});


var renderTemplate = Sparky.task("renderTemplate", () => {
    return Sparky.watch(CONFIG.sparks.html.watch, {base: CONFIG.sparks.html.base})
        .completed(() => {
            Sparky.start('render');
        });
});


module.exports = renderTemplate;