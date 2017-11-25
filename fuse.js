const {FuseBox, CSSPlugin, SassPlugin, BannerPlugin, WebIndexPlugin, UglifyJSPlugin, Sparky, QuantumPlugin} = require("fuse-box");
const bs = require("browser-sync");
const Helpers = require('./fuse/helpers');
const CONFIG = require('./fuse/config');

var PORT = CONFIG.startPort;

//tasks
const RenderHtmlSpark = require('./fuse/sparks/renderHtml');
const ImagesSpark = require('./fuse/sparks/images');
const IconsSpark = require('./fuse/sparks/icons');
const DoneSpark = require('./fuse/sparks/done');
const ClearSpark = require('./fuse/sparks/clear');

Helpers.getPort(CONFIG.startPort, (port) => {
    PORT = port;
});

let fuse, app, vendor, isProduction = false;

Sparky.task("config", () => {
    fuse = FuseBox.init({
        hmr: true,
        cache: CONFIG.cache,
        homeDir: CONFIG.root.src,
        output: CONFIG.root.dest + "/$name.js",
        hash: isProduction,
        sourceMaps: !isProduction,
        log: !isProduction && CONFIG.log,
        debug: !isProduction && CONFIG.debug,
        plugins: [
            [SassPlugin(), CSSPlugin()],
            CSSPlugin(),
            BannerPlugin('// Front-End Developer Tool Created By Sławek Krol < krol.slawek1@gmail.com > (c) Copyright 2017!'),
            WebIndexPlugin({
                templateString: `$bundles`,
                target: CONFIG.root.targetTail
            }),
            isProduction && UglifyJSPlugin(),
            isProduction && QuantumPlugin({
                polyfills: ["Promise"],
                manifest: true
            }),
        ],
        /* shim: {
             jquery: {
                 source: "node_modules/jquery/dist/jquery.js",
                 exports: "$",
             },
         }*/
    });

    /* vendor = fuse.bundle("vendor").instructions("~ index.ts"); */

    app = fuse.bundle("app")
        .instructions(`> index.ts`);
    // .instructions(`!> [index.ts]`);

    if (!isProduction) {
        bs.init({
            port: PORT + 1,
            directory: true,
            server: CONFIG.browserSync.server,
            startPath: CONFIG.browserSync.srartPath,
        });
    }

    if (!isProduction) {
        fuse.dev({
            httpServer: true,
            port: PORT
        });
    }

});


// TASKS
new RenderHtmlSpark();
new ImagesSpark();
new IconsSpark();
new DoneSpark();
new ClearSpark();


// development mode
Sparky.task("default", ["clear", "config", "fonts", "images", "renderTemplate"], () => {
    // vendor.hmr().watch();
    app.hmr().watch();
    return fuse.run();
});


// production mode
Sparky.task("dist", ["clear", "set-production", "config", "fonts", "images"], () => {
    return fuse.run().then(() => {
        Sparky.start('exit');
    });
});


Sparky.task("set-production", () => {
    isProduction = true;
});



