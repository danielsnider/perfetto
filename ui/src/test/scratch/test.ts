#!/usr/bin/node
// Usage:
// node_modules/typescript/bin/tsc --outDir src/test/scratch/build src/test/scratch/test.ts && node src/test/scratch/build/test.js
//
// REPL:
// # in terminal 1
// cd /home/dans/perfetto/ui
// node_modules/typescript/bin/tsc --outDir src/test/scratch/build --watch src/test/scratch/test.ts  # watch for changes then compile
// # in terminal 2
// cd /home/dans/perfetto/ui/src/test/scratch/build
// ls | entr -rc ./test.js  # watch for changes in results of compile

import * as fs from 'fs';
import * as path from 'path';

const input_folder = '/home/dans/perfetto/test/data/cpath_traces/';

const fileList = fs.readdirSync(input_folder, { withFileTypes: true });
const modelList = fileList.filter(de => de.isDirectory()).map(de => de.name);

modelList.forEach((model) => {
    const traceList = fs.readdirSync(path.join(input_folder, model));
    traceList.forEach((trace) => {
        const trace_path = path.join(input_folder, model, trace)
        console.log(trace_path);
    });
});