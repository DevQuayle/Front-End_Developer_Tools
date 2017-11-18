const {FuseBox, CSSPlugin, SassPlugin, WebIndexPlugin, BannerPlugin, UglifyJSPlugin, Sparky} = require("fuse-box");
const templateRender = require('nunjucks');
const bs = require("browser-sync");
const chalk = require('chalk');
const log = console.log;
var net = require('net');

const error = chalk.bold.white.bgRed;
const warning = chalk.bold.white.bgYellow;
const info = chalk.bold.white.bgBlue;
var portrange = 3000
var PORT = 3000;


function getPort(cb) {
    var port = portrange
    portrange += 1

    var server = net.createServer()
    server.listen(port, function (err) {
        server.once('close', function () {
            cb(port)
        })
        server.close()
    })
    server.on('error', function (err) {
        getPort(cb)
    })
}

getPort((port) => {
    PORT = port;
});

let fuse, app, vendor, isProduction = false;

Sparky.task("config", () => {
    fuse = FuseBox.init({
        cache: true,
        homeDir: "src",
        output: "dist/$name.js",
        hash: isProduction,
        sourceMaps: !isProduction,
        log: !isProduction,
        // debug: !isProduction,
        plugins: [
            [SassPlugin(), CSSPlugin()],
            CSSPlugin(),
            BannerPlugin('// Hey this is my Front launcher! Copyright 2017!'),
            // WebIndexPlugin(),
            isProduction && UglifyJSPlugin()
        ]
    });


    // zaleznosci zewnętrzne
    vendor = fuse.bundle("vendor")
        .instructions("~ index.ts");

    // moje zaleznosci
    app = fuse.bundle("app")
        .instructions(`!> [index.ts]`);

    bs.init({
        server: "./dist/",
        port: PORT + 1,
    }, (er, bs) => {

    });
    if (!isProduction) {
        // console.log(bs.options.get('port'));
        fuse.dev({
            httpServer: true,
            port: PORT
        });

    }

});


// development task "node fuse""
Sparky.task("default", ["config", "renderTremplate"], () => {
    vendor.hmr().watch();
    app.watch();
    return fuse.run();
});

// produkcja "node fuse dist"
Sparky.task("dist", ["set-production", "config"], () => {
    return fuse.run();
});

//ustawia producje
Sparky.task("set-production", () => {
    isProduction = true;
    return Sparky.src("dist/").clean("dist/");
});


Sparky.task('render', () => {
    return Sparky.src("**/*.+(html|twig|json)", {base: './src'})
        .file('*.*', file => {
            templateRender.configure('./src/');
            templateRender.render(file.homePath, (err, res) => {
                if (err) log(error(err));
                if (res) file.setContent(res);
            });
            file.extension = 'html';
        })
        .dest("./dist")
        .completed(() => {
            bs.reload();
        });
});

//budowanie szablony HTML
Sparky.task("renderTremplate", () => {
    return Sparky.watch("**/*.+(html|twig|json)", {base: "./src"})
        .completed(() => {
            Sparky.start('render');
        });

});


//TODO
// -obrazki
// -czcionki
// -dorobic global config
// -dynamiczny port