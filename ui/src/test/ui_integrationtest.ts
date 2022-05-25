// Copyright (C) 2021 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Usage:
// PERFETTO_UI_TESTS_REBASELINE=1 ./ui/run-integrationtests

import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

import {assertExists} from '../base/logging';

import {
  compareScreenshots,
  failIfTraceProcessorHttpdIsActive,
  waitForPerfettoIdle
} from './perfetto_ui_test_helper';

const inputFolder = '/home/dans/perfetto/test/data/cpath_traces/';

const files = fs.readdirSync(inputFolder, { withFileTypes: true });
// get folders only. each folder is a model.
const models = files.filter(de => de.isDirectory()).map(de => de.name);

declare var global: {__BROWSER__: puppeteer.Browser;};
const browser = assertExists(global.__BROWSER__);
const expectedScreenshotPath = path.join('test', 'data', 'ui-screenshots', 'traces');

async function getPage(): Promise<puppeteer.Page> {
  const pages = (await browser.pages());
  expect(pages.length).toBe(1);
  return pages[pages.length - 1];
}

// Executed once at the beginning of the test. Navigates to the UI.
beforeAll(async () => {
  await failIfTraceProcessorHttpdIsActive();
  jest.setTimeout(60000);
  const page = await getPage();
  await page.setViewport({width: 1920, height: 1080});
});

// After each test (regardless of nesting) capture a screenshot named after the
// test('') name and compare the screenshot with the expected one in
// /test/data/ui-screenshots.
afterEach(async () => {
  let testName = expect.getState().currentTestName;
  testName = testName.replace(/[^a-z0-9-]/gmi, '_').toLowerCase();
  const page = await getPage();

  // cwd() is set to //out/ui when running tests, just create a subdir in there.
  // The CI picks up this directory and uploads to GCS after every failed run.
  const tmpDir = path.resolve('./ui-test-artifacts/traces');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const screenshotName = `ui-${testName}.png`;
  const actualFilename = path.join(tmpDir, screenshotName);
  const expectedFilename = path.join(expectedScreenshotPath, screenshotName);
  await page.screenshot({path: actualFilename});
  const rebaseline = process.env['PERFETTO_UI_TESTS_REBASELINE'] === '1';
  if (rebaseline) {
    console.log('Saving reference screenshot into', expectedFilename);
    fs.copyFileSync(actualFilename, expectedFilename);
  } else {
    await compareScreenshots(actualFilename, expectedFilename);
  }
});


models.forEach((model) => {
  const traceList = fs.readdirSync(path.join(inputFolder, model));
  describe(model, () => {
    let page: puppeteer.Page;

    beforeAll(async () => {
      page = await getPage();
      await page.goto('http://localhost:10000/?testing=1');
      await waitForPerfettoIdle(page);
    });

    traceList.forEach((trace) => {
      const tracePath = path.join(inputFolder, model, trace)
      console.log(tracePath);
      test(trace + '_load', async () => {
        const page = await getPage();
        const file = await page.waitForSelector('input.trace_file');
        // const tracePath = getTestTracePath('chrome_rendering_desktop.pftrace'); // ./test/data/chrome_rendering_desktop.pftrace
        // const tracePath = /home/dans/perfetto/test/data/cpath_traces/rnn/sub_ops_with_gpu_forward.pt.trace.json
        // const tracePath = getTestTracePath(trace_path); // DELETE ME
        assertExists(file).uploadFile(tracePath);
        await waitForPerfettoIdle(page);
      });

      test(trace + '_expand', async () => {
        const page = await getPage();
        await page.click('.main-canvas');
        await waitForPerfettoIdle(page);
        await new Promise(r => setTimeout(r, 500));
        if (model === 'resnet50') {
          if (await page.$('h1[title="Process 4054772"]') !== null) {
            await page.click('h1[title="Process 4054772"]');
          }
          if (await page.$('h1[title="Process 0"]') !== null) {
            await page.click('h1[title="Process 0"]');
          }
        }
        else if (model === 'rnn') {
          await page.click('h1[title="Process 206975"]');
          await page.click('h1[title="Process 0"]');
          await page.click('h1[title="Process 1"]');
          await page.click('h1[title="Process 2"]');
          await page.click('h1[title="Process 3"]');
        }
        // await page.evaluate(() => {
        //   document.querySelector('.scrolling-panel-container')!.scrollTo(0, 400);
        // });
        await new Promise(r => setTimeout(r, 500));
        await waitForPerfettoIdle(page);
      });

      // test('select_slice_with_flows', async () => {
      //   const page = await getPage();
      //   const searchInput = '.omnibox input';
      //   await page.focus(searchInput);
      //   await page.keyboard.type('GenerateRenderPass');
      //   await waitForPerfettoIdle(page);
      //   for (let i = 0; i < 3; i++) {
      //     await page.keyboard.type('\n');
      //   }
      //   await waitForPerfettoIdle(page);
      //   await page.focus('canvas');
      //   await page.keyboard.type('f');  // Zoom to selection
      //   await waitForPerfettoIdle(page);
      // });
    });
  });
});