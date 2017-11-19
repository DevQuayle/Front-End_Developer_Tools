const {FuseBox, CSSPlugin, SassPlugin, BannerPlugin,WebIndexPlugin, UglifyJSPlugin, Sparky} = require("fuse-box");
const templateRender = require('nunjucks');
const bs = require("browser-sync");
const chalk = require('chalk');
const log = console.log;
var net = require('net');
const iconfontMaker = require('iconfont-maker');


const err = chalk.bold.white.bgRed;
const warning = chalk.bold.yellow;
const info = chalk.bold.white.bgBlue;
const success = chalk.bold.white.bgGreen;

var PORT = 3000;

function getPort(from, cb) {
    var port = from
    from += 1

    var server = net.createServer()
    server.listen(port, function (err) {
        server.once('close', function () {
            cb(port)
        })
        server.close()
    })
    server.on('error', function (err) {
        getPort(from, cb)
    })
}

getPort(3000, (port) => {
    PORT = port;
});

let fuse, app, vendor, isProduction = false;

Sparky.task("config", () => {
    fuse = FuseBox.init({
        cache: true,
        homeDir: "src",
        output: "dist/$name.js",
        hash: true,//isProduction,
        sourceMaps: !isProduction,
        log: !isProduction,
        // debug: !isProduction,
        plugins: [
            [SassPlugin(), CSSPlugin()],
            CSSPlugin(),
            BannerPlugin('// Front-End Developer Tool Created By Sławek Krol < krol.slawek1@gmail.com > (c) Copyright 2017!'),
            WebIndexPlugin({
                templateString: `$bundles`,
                target:"../src/tpl/components/tail.twig"

            }),
            isProduction && UglifyJSPlugin(),
        ],
       /* shim: {
            jquery: {
                source: "node_modules/jquery/dist/jquery.js",
                exports: "$",
            },
        }*/
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
        directory: true,
        startPath: "/tpl"
    });


    if (!isProduction) {
        fuse.dev({
            httpServer: true,
            port: PORT
        });
    }

});


// development task "node fuse""
Sparky.task("default", ["config", "fonts", "images", "renderTremplate"], () => {
    vendor.hmr().watch();
    app.watch();
    return fuse.run();
});

//Obrazki
Sparky.task('images', () => {
    return Sparky.watch('**/*.+(jpg|png|jpeg|gif)', {base: "./src/assets/img"}).clean('./dist/assets/img').dest('./dist/assets/img');
});

//Ikony
Sparky.task('fonts', () => {
    return Sparky.watch('*.+(svg)', {base: "./src/assets/icons"}).clean('./dist/assets/fonts').completed(() => {
        iconfontMaker({
            files: [
                'src/assets/icons/*.svg',
            ],
            dest: 'dist/assets/fonts/',
            fontName: "icons",
            html: true,
            templateOptions: {
                classPrefix: 'icon-',
                baseSelector: '.icon',
                baseIconSelector: 'icon'
            },
            htmlTemplate: "./fuse/iconHtml.hbs",
            fontHeight: "64",
            cssDest: "src/assets/scss/components/icons.css",
            cssFontsUrl: "../assets/fonts"
        }, function (error) {
            if (error) {
                log(info("You don't have icons in src/assets/icons"), error);
            } else {
                log(success('               Generate icon successful!                '));
            }
        })
    });
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
// -dorobic global config
