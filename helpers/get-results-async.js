import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import { Spinner } from 'cli-spinner';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getAndJoinData(url, page, index, pathToResults, host, folder) {
  const result = await axios.get(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=${process.env.KEY}&url=${url}`
  );

  const fileName = page.replace(RegExp('/', 'g'), '-');
  const fullPath = `${pathToResults}/${host}/${fileName}${index}.json`;
  return { fileName, fullPath, folder, host, index, data: result.data };
}

async function getAllPagesMetrics(config) {
  var promises = [];
  const { folder, hosts, pages, runs } = config;
  const pathToResults = config.outputDir ? config.outputDir : `${path.join(__dirname, '../')}/${folder}`;

  for (const host of hosts) {
    if (!fs.existsSync(pathToResults + '/' + host)) {
      fs.mkdirSync(pathToResults + '/' + host);
    }

    for (const page of pages) {
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

  getAllPagesMetrics(config).then((results) => {
    results.forEach((item) => {
      var { data, folder, index, fullPath, fileName, host } = item;

      fs.promises.writeFile(fullPath, JSON.stringify(data)).then((e) => {
        if (e) throw e;
        spinner.stop(true);
        console.log(`- Results written to ${folder}/${host}/${fileName}${index}.json`);
      });
    });
  });
}

export default getAndWriteResultsAsync;
