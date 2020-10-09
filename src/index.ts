import * as path from 'path';
import {mountToReactRoot, getAllSlowComponentRenders, getTotalCommitCount} from './utils/utils';

async function record(page, url: string, rootIdString: string, projectID?: string) {
  // Mock devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(() => {
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] = {};
  });

  // Load url and inject code to page
  await page.goto(url);
  await page.addScriptTag({
    path: path.join(__dirname, './bundle.puppeteer.js'),
    type: 'module',
  });

  // Start recording changes
  await page.evaluate(
    (rootIdString, projectID) => {
      const root = document.querySelector(rootIdString);
      mountToReactRoot(root, projectID);
    },
    rootIdString,
    projectID ? projectID : null,
  );

  return page;
}

declare const changes; // workaround since we're eval-ing this in browser context
async function report(page, threshold = 0) {
  // Return results of local state that exceeds threshold
  const slowRenders = await page.evaluate(async threshold => {
    const result = getAllSlowComponentRenders(changes, threshold);
    return JSON.stringify(result);
  }, threshold);

  return JSON.parse(slowRenders);
}

async function reportAll() {
  // Return global state
}

export {report, mountToReactRoot, getAllSlowComponentRenders, getTotalCommitCount};
