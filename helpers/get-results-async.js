// import axios from 'axios';
// import * as fs from 'fs/promises';
// import path from 'path';
// import Spinner from 'cli-spinner';

const axios = require('axios');
const fs = require('fs/promises');
const f = require('fs');
const path = require('path');
var Spinner = require('cli-spinner').Spinner;

async function getAndJoinData(url, page, index, pathToResults, host, folder) {
  const result = await axios.get(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=${process.env.KEY}&url=${url}`
  );

  const fileName = page.replace(RegExp('/', 'g'), '-');
  const fullPath = `${pathToResults}/${host}/${fileName}${index}.json`;
  return { fileName, fullPath, folder, index, data: result.data };
}

async function getMetrics(config) {
  var promises = [];
  const { folder, hosts, pages, runs } = config;
  const pathToResults = config.outputDir ? config.outputDir : `${path.join(__dirname, '../')}/${folder}`;

  for (host of hosts) {
    if (!f.existsSync(pathToResults + '/' + hosts)) {
      f.mkdirSync(pathToResults + '/' + host);
    }

    for (page of pages) {
      for (var i = 1; i <= runs; i++) {
        var index = runs === 1 ? '' : '-' + i;
        let p = page === 'home' ? '' : page;
        const url = `https://${host}/${p}`;

        promises.push(getAndJoinData(url, page, index, pathToResults, host, folder));
      }
    }
  }

  return Promise.all(promises);
}
async function getAndWriteResultsAsync(config) {
  const spinner = new Spinner(`%s Fetching results...`);
  spinner.setSpinnerString(20);
  spinner.start();

  getMetrics(config).then((results) => {
    console.log({ results });

    results.forEach((item) => {
      var { data, folder, index, fullPath, fileName } = item;

      fs.writeFile(fullPath, JSON.stringify(data)).then((e) => {
        if (e) throw e;
        spinner.stop(true);
        console.log(`- Results written to ${folder}/${fileName}${index}.json`);
      });
    });
  });
}

module.exports = getAndWriteResultsAsync;
