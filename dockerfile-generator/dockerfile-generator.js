#!/usr/bin/env node
/* eslint-disable no-param-reassign */
const prompt = require('prompt');
const path = require('path');
const fs = require('fs');

prompt.start();

// docker file contents for app container
const appDockerFile = `FROM node:12-alpine
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .`;

// docker file contents for puppeteer test container
const testDockerFile = `FROM buildkite/puppeteer:5.2.1
WORKDIR /tests
COPY package-lock.json package.json ./
RUN npm ci
COPY . .`;

/**
 * @description function to sanitize string
 */
const sanitizeString = str => {
  const sanitizedStr = str.replace(/[^a-z0-9.,_-]/gim, '');
  return sanitizedStr.trim();
};

// docker-compose.yml file contents
let dockerComposeFile = '';

/**
 * @description function to generate a docker-compose.yml file based on input parameters
 */
const generateDockerComposeFile = parameters => {
  const {appName, port, startScript, testScript} = parameters;
  if (typeof appName !== 'string' || typeof startScript !== 'string' || typeof testScript !== 'string') {
    throw new Error('Error, input must be a string.');
  }
  dockerComposeFile = `version: "3"
  services:
    tests:
      build:
        context: .
        dockerfile: Dockerfile.test
      command: bash -c "wait-for-it.sh ${appName}:${port} && ${testScript}"
      links:
        - ${appName}
    ${appName}:
      build:
        context: .
        dockerfile: Dockerfile.app
      command: ${startScript}
      tty: true
      expose:
        - "${port}"`;
};

/**
 * @description function to write a docker file for the app container and test container, and a docker-compose file to link them together
 */
const writeFiles = () => {
  const files = [
    {fileName: 'Dockerfile.app', contents: appDockerFile},
    {fileName: 'Dockerfile.test', contents: testDockerFile},
    {fileName: 'docker-compose.yml', contents: dockerComposeFile},
  ];
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
    appName: {
      description: 'app name',
      pattern: /^[a-zA-Z-]+$/,
      message: 'app name must only contain letters or dashes and cannot be blank',
      required: true,
    },
    port: {
      description: 'port number',
      pattern: /^[0-9]*$/,
      message: 'port number must only contain numbers and cannot be blank',
      required: true,
    },
    startScript: {
      description: 'start script',
      pattern: /^[a-zA-Z\s-]+$/,
      message: 'start script must only contain letters, spaces, or dashes and cannot be blank',
      required: true,
    },
    testScript: {
      description: 'test script',
      pattern: /^[a-zA-Z\s-]+$/,
      message: 'test script must only contain letters, spaces, or dashes and cannot be blank',
      required: true,
    },
  },
};

prompt.get(schema, (err, result) => {
  if (err) {
    return onErr(err);
  }
  result.appName = sanitizeString(result.appName);
  generateDockerComposeFile(result);
  console.log(`success. remember to change http://localhost in your puppeteer test file to http://${result.appName}`);
  return writeFiles(result);
});
