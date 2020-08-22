# React Pinpoint

<a>
  <img
    height="80"
    width="80"
    alt="goat"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/237/kangaroo_1f998.png"
  />
</a>

An open-source utility library for measuring React component render times

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

## Table of Contents

- [Prerequisites](#prerequisites)
  - [Browser context](#browser-context)
  - [Production build with a twist](#production-build-with-a-twist)
- [APIs](#apis)
  - [record](#record--)
  - [report](#report--)
- [Examples](#examples)
  - [Using with Puppeteer](#using-with-puppeteer)
- [Docker](#docker)
- [FAQS](#faqs)

## Prerequisites

### Browser context

React pinpoint must run inside a browser context to observe the React fiber tree. We recommended using automation software such as
[puppeteer](https://github.com/puppeteer/puppeteer) to achieve this.

### Production build with a twist

React optimises your development code base when you build for production, which decreases component render times. Users should therefore run
react pinpoint against their production code

However, tweaks need to be made to the build process to preserve component names and enable render time profiling. Steps for doing so can be
[found here](https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977).

## APIs

### `record(page, url, rootId)`

- `page` <[Page](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#class-page)> Puppeteeer page instance
- `url` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> address React page is hosted at
- `rootId` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> id of dom element that React is
  mounted to
- returns: <[Page](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#class-page)> Puppeteeer page instance with a listener
  attached to React components

This function attaches a listener to the Puppeteer page's react root for recording changes

### `report(page, threshold)`

- `page` <[Page](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#class-page)> Puppeteeer page instance with record listener
  attached
- `threshold` <[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> cutoff for acceptable
  component render time (in ms)
  - default time is 16ms
- returns: [Node[]](https://developer.mozilla.org/en-US/docs/Glossary/array) An array of nodes belonging to each react component that
  exceeded the given render time threshold

Will report all component render times that exceed the given threshold in ms

If no threshold is given, the default threshold of 16ms is used (please see [FAQ “Why is the default render threshold 16ms?”](<(#faqs)>))

## Examples

### Using with Puppeteer

```javascript
const puppeteer = require('puppeteer');
const reactPinpoint = require('react-pinpoint');

(async () => {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  // Pass information to
  const url = 'http://localhost:3000/calculator';
  const rootId = '#root';
  await reactPinpoint.record(page, url, rootId);

  // Perform browser actions
  await page.click('#yeah1');
  await page.click('#yeah2');
  await page.click('#yeah3');

  // Get all components that took longer than 16ms to render during browser actions
  const threshold = 16;
  const slowRenders = await reactPinpoint.reportTestResults(page, threshold);

  await browser.close();
})();
```

### Using with Cypress

Not yet implemented

## Docker

React pinpoint was designed with the goal of regression testing component render times within a CICD, we therefore offer several
preconfigured docker containers to assist with using React pinpoint within a CICD as well as with examples for doing so

- [Puppeteer](https://github.com/oslabs-beta/react-pinpoint/tree/master/dockerfile-generator)

## FAQS

#### Why does React Pinpoint only measure individual component render times?

Since React has moved to using a React fiber infrastructure

#### Why is the default render threshold 16ms?

The recommended render time for a [60 FPS](https://developers.google.com/web/fundamentals/performance/rendering)

#### Does React pinpoint work in a headless browser?

Yes! Due to the component render times being driven by component logic, a GUI is not needed to capture them
