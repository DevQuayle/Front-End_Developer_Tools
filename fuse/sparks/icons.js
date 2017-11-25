const {Sparky} = require("fuse-box");
const iconfontMaker = require('iconfont-maker');
const Log = require('../log');
const CONFIG = require('../config');

let icons = Sparky.task('fonts', () => {
    return Sparky.watch(CONFIG.sparks.iconFont.watch, {base: CONFIG.sparks.iconFont.base})
        .clean(CONFIG.sparks.iconFont.dest)
        .completed(() => {
            iconfontMaker({
                files: [
                    CONFIG.sparks.iconFont.base + '/' + CONFIG.sparks.iconFont.watch,
                ],
                dest: CONFIG.sparks.iconFont.dest,
                fontName: CONFIG.sparks.iconFont.fontName,
                html: true,
                templateOptions: {
                    classPrefix: 'icon-',
                    baseSelector: '.icon',
                    baseIconSelector: 'icon'
                },
                htmlTemplate: "./fuse/iconHtml.hbs",
                fontHeight: "64",
                cssDest: CONFIG.sparks.iconFont.cssDest,
                cssFontsUrl: "../assets/fonts"
            }, function (error) {
                if (error) {
                    Log.info("You don't have icons in src/assets/icons");
                } else {
                    Log.success('Generate icon successful!');
                }
            })
        });
});

module.exports = icons;