# dockerfile generator

A script to generate docker files to be used with react-pinpoint and puppeteer js.

## Table of Contents

- [Description](##Description)
- [Prerequisites](##Prerequisites)
- [Features](##Features)
- [Usage](##Usage)
  - [Getting Started](###Getting-Started)
  - [User Inputs](###User-Inputs)
  - [Configure the url for react-pinpoint](###Configure-the-url-for-react-pinpoint)
  - [Build and run the docker containers](###Build-and-run-the-docker-containers)

## Description

A script to generate Docker files to be used with react-pinpoint and puppeteer js.

## Prerequisites

- [Docker](https://www.docker.com/)
- [react-pinpoint](https://github.com/oslabs-beta/react-pinpoint)
- [puppeteer](https://pptr.dev/)

## Features

The script will create (in the same folder):

- Dockerfile.app
- Dockerfile.test
- docker-compose.yml

## Usage

### Getting Started

1. Download `dockerfile-generator.js` and save it in the root folder of your app.
2. Run `node dockerfile-generator.js` to generate the files.

### User Inputs

The script will prompt for 4 user inputs as follows:

1. `app name` - provide a name for your app, e.g. `webapp`.
2. `port` - provide a port number to host the app server, e.g. `5000`. The app server will be accessible at `http://webapp:5000`
3. `start script` - provide the start script used to serve the app server, e.g. `npm start`
4. `test script` - provide the test script used to run the tests, e.g. `npm test`

### Configure the url for react-pinpoint

In the test file, replace `http://localhost:3000` with the `app name` and `port` provided, e.g. `http://webapp:5000`

```javascript
beforeEach(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  const url = 'http://webapp:5000';
  const rootId = '#root';
  await reactPinpoint.recordTest(page, url, rootId);
});
```

Full example test file below:

```javascript
const puppeteer = require('puppeteer');
const reactPinpoint = require('react-pinpoint');

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  const url = 'http://webapp:5000';
  const rootId = '#root';
  await reactPinpoint.recordTest(page, url, rootId);
});

afterEach(async () => {
  const slowRenders = await reactPinpoint.reportTestResults(page, 16);
  console.log(`There are: ${slowRenders.length} 'slow renders.'`);
  await browser.close();
});

test('The checkbox should be checked.', async () => {
  await page.click('#MyCheckbox');
  const result = await page.evaluate(() => {
    const myCheckbox = document.querySelector('#myCheckbox');
    return myCheckbox.checked;
  });
  expect(result).toBe(true);
});
```

### Build and run the docker containers

Run `docker-compose up --build` to build and run the docker containers.
