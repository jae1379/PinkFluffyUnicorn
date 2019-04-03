const path = require('path');
const ConcatPlugin = require('webpack-concat-plugin');

module.exports = {
    "mode": "development",
    "entry": "./src/index.js",
    "output": {
        "path": __dirname+'/dist',
        "filename": "ignorethis.js"
    },
    "devtool": "source-map",
    plugins: [
        new ConcatPlugin({
            uglify: true,
            sourceMap: true,
            name: 'pinkfluffyunicorn',
            fileName: 'pinkfluffyunicorn.min.js',
            filesToConcat: ['./src/lib/matter.min.js','./src/lib/pixi.min.js','./src/lib/pixi-sound.js','./src/lib/comfy.min.js','./src/engine.js' ]
        })
    ]
};
