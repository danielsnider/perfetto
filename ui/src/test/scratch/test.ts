// Usage:
// node_modules/typescript/bin/tsc --outDir src/test/scratch/build src/test/scratch/test.ts && node src/test/scratch/build/test.js

import * as fs from 'fs';

console.log('test1');
try {
    var arrayOfFiles = fs.readdirSync(".");
    console.log(arrayOfFiles);
}
catch (e) {
    console.log(e);
}
