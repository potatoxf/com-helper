export default [{
    input: 'index.js',
    output: [{
        file: './dist/com-helper.js',
        format: "umd",
        name: 'com_helper'
    }, {
        file: './dist/browser/com-helper.js',
        format: "iife",
        name: 'com_helper'
    }, {
        file: './dist/node/com-helper.cjs',
        format: "cjs"
    }, {
        file: './dist/esm/com-helper.js',
        format: "es"
    }]
}];
