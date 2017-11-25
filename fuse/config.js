module.exports = {
    startPort: 3000,
    cache: true,
    log: true,
    debug: true,
    root: {
        src: 'src',
        dest: 'dist',
        targetTail: '../src/tpl/components/tail.twig',
    },
    browserSync: {
        server: './dist/',
        srartPath: "/tpl",
    },
    sparks: {
        images: {
            watch: '**/*.+(jpg|png|jpeg|gif)',
            base: './src/assets/img',
            dest: './dist/assets/img',
        },
        iconFont: {
            watch: '*.svg',
            base: './src/assets/icons',
            dest: './dist/assets/fonts',
            fontName: 'icons',
            cssDest: 'src/assets/scss/components/icons.css'
        },
        html: {
            watch: "**/*.+(html|twig|json)",
            base: './src',
            dest: './dist'
        }
    }
};