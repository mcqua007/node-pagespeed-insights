// import axios from 'axios';
// import * as fs from 'fs/promises';
// import path from 'path';
// import Spinner from 'cli-spinner';

const axios = require('axios');
const fs = require('fs/promises');
const f = require('fs');
const path = require('path');
var Spinner = require('cli-spinner').Spinner;

async function getResults(config) {
  const { folder, hosts, pages, runs } = config;
  const pathToResults = config.outputDir ? config.outputDir : `${path.join(__dirname, '../')}/${folder}`;

  let results = [];
  var promises = [];

  for (host of hosts) {
    // if (!fs.existsSync(pathToResults + '/' + hosts)) {
    //   fs.mkdirSync(pathToResults + '/' + host);
    // }

    if (!f.existsSync(pathToResults + '/' + hosts)) {
      f.mkdirSync(pathToResults + '/' + host);
    }

    for (page of pages) {
      for (var i = 1; i <= runs; i++) {
        var index = runs === 1 ? '' : '-' + i;
        let p = page === 'home' ? '' : page;
        const url = `https://${host}/${p}`;

        const spinner = new Spinner(`%s ${i}. Fetching results for ${url}`);
        spinner.setSpinnerString(20);
        spinner.start();

        const result = await axios.get(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=${process.env.KEY}&url=${url}`
        );

        results.push(result.data);

        const fileName = page.replace(RegExp('/', 'g'), '-');
        const fullPath = `${pathToResults}/${host}/${fileName}${index}.json`;

        await fs.writeFile(fullPath, JSON.stringify(result.data)).then((e) => {
          if (e) throw e;
          spinner.stop(true);
          console.log(`- (${i}) Results written to ${folder}/${fileName}${index}.json`);
        });
      }
    }
  }

  return results;
}
// export { getResults };
module.exports = getResults;
