FROM buildkite/puppeteer:5.2.1

WORKDIR /tests
ADD . . 

RUN npm ci 
CMD [ "node", "src/__tests__/index.js" ]