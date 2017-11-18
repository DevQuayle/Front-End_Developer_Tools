const {FuseBox, CSSPlugin, SassPlugin, WebIndexPlugin, UglifyJSPlugin, Sparky} = require("fuse-box");
const templateRender = require('nunjucks');
const bs = require("browser-sync");

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

    if (!isProduction) {
        fuse.dev({
            root: 'dist',
            open: false, // Boolean (false is default) | String: open specifc url like 'http://dev-server:8080'
            port: 3005
        });
    }
});


// Inicializacja browserSynca
Sparky.task('browserSyncInit', () => {
    bs.init({
        server: "./dist/tpl/"
    });
});

// development task "node fuse""
Sparky.task("default", ["config", "browserSyncInit", "renderTremplate", 'reload'], () => {
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

// przeładowuje stronę po wygenerowaniu html
Sparky.task('reload', () => {
    return Sparky.watch("**/*.html", {base: './dist'})
        .file('*.*', file => {
            bs.reload();
        })
});

//budowanie szablony HTML
Sparky.task("renderTremplate", () => {
    return Sparky.watch("**/*.+(html|twig|json) - assets/components/**", {base: "./src"})
        .file('*.twig', file => {

            //TODO excludować nie potrzebne katalogi
            templateRender.configure('./src/tpl/');
            if(file.name === 'app.twig'){
               file.setContent(templateRender.render(file.name));
               file.extension = 'html';
            }
        })
        .dest("./dist");
});



//TODO
// -obrazki
// -czcionki
// -dorobic global config