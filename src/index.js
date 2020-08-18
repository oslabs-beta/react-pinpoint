/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const path = require('path');

async function recordTest(page, url, rootIdString) {
  // Mock devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(() => {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};
  });

  // Load url and inject code to page
  await page.goto(url);
  await page.addScriptTag({
    path: path.join(__dirname, 'utils/utils.js'),
  });

  // Start recording changes
  await page.evaluate((rootIdString) => {
    const root = document.querySelector(rootIdString);
    mountToReactRoot(root);
  }, rootIdString);

  return page;
}

async function reportTestResults(page, threshold = 0) {
  // Return results of local state that exceeds threshold
  const slowRenders = await page.evaluate(async (threshold) => {
    return getAllSlowComponentRenders(threshold);
  }, threshold);

  return slowRenders;
}

async function reportAllTestResults() {
  // Return global state
}

module.exports = { recordTest, reportTestResults, reportAllTestResults };
