import * as path from 'path';

async function record(page, url, rootIdString) {
  // Mock devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(() => {
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] = {};
  });

  // Load url and inject code to page
  await page.goto(url);
  await page.addScriptTag({
    path: path.join(__dirname, 'utils.js'),
  });

  // Start recording changes
  await page.evaluate(rootIdString => {
    const root = document.querySelector(rootIdString);
    mountToReactRoot(root);
  }, rootIdString);

  return page;
}

async function report(page, threshold = 0) {
  // Return results of local state that exceeds threshold
  const slowRenders = await page.evaluate(async threshold => {
    return getAllSlowComponentRenders(threshold);
  }, threshold);

  return slowRenders;
}

async function reportAll() {
  // Return global state
}

export {record, report, reportAll};
