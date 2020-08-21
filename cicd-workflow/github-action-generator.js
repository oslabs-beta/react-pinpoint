#!/usr/bin/env node
/* eslint-disable no-param-reassign */
const prompt = require('prompt');
const path = require('path');
const fs = require('fs');

prompt.start();

/**
 * @description function to sanitize string
 */
const sanitizeString = str => {
  const sanitizedStr = str.replace(/[^a-z0-9.,_-]/gim, '');
  return sanitizedStr.trim();
};

// github-action.yml file contents
let githubActionFile = '';

/**
 * @description function to generate a docker-compose.yml file based on input parameters
 */
const generateGithubActionFile = parameters => {
  const {actionName} = parameters;
  if (typeof actionName !== 'string') {
    throw new Error('Error, input must be a string.');
  }
  githubActionFile = `name: ${actionName}
  on: push
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        uses: actions/checkout@v2
        run: docker-compose-up --build --abort-on-container-exit`;
};

/**
 * @description function to write a docker file for the app container and test container, and a docker-compose file to link them together
 */
const writeFiles = () => {
  const files = [{fileName: 'github-action.yml', contents: githubActionFile}];
  files.forEach(file => fs.writeFileSync(path.resolve(__dirname, file.fileName), file.contents));
};

/**
 * @description function to log an error
 */
const onErr = err => {
  console.log(err);
  return 1;
};

// schema to validate user input
const schema = {
  properties: {
    actionName: {
      description: 'action name',
      pattern: /^[a-zA-Z-]+$/,
      message: 'action name must only contain letters or dashes and cannot be blank',
      required: true,
    },
  },
};

prompt.get(schema, (err, result) => {
  if (err) {
    return onErr(err);
  }
  result.appName = sanitizeString(result.actionName);
  generateGithubActionFile(result);
  console.log(`success.`);
  return writeFiles(result);
});
