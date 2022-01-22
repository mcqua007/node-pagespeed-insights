import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import { Spinner } from 'cli-spinner';
import { fileURLToPath } from 'url';
import rateLimitMap from './rate-limit-map.js';

async function getAndJoinData(data) {
  var { reqUrl, url, page, run, indexStr, pathToResults, host, folder, device } = data;
  const result = await axios.get(reqUrl);
  const fileName = `${device}-${page.replace(RegExp('/', 'g'), '-')}`;
  const fullPath = `${pathToResults}/${host}/${fileName}${indexStr}.json`;
  return {
    reqUrl,
    fileName,
    fullPath,
    folder,
    host,
    run,
    indexStr,
    data: result.data,
    fetchTime: result.data.lighthouseResult.fetchTime,
  };
}

function buildData(config) {
  const data = [];
  const { folder, hosts, pages, runs, devices } = config;
  const __dirname = config.dir ? config.dir : path.dirname(fileURLToPath(import.meta.url));
  const pathToResults = config.outputDir ? config.outputDir : `${path.join(__dirname, '../')}/${folder}`;

  for (const host of hosts) {
    createDirectory(`${pathToResults}/${host}`);
    for (const page of pages) {
      for (const device of devices) {
        for (var i = 1; i <= runs; i++) {
          const run = i;
          const indexStr = runs === 1 ? '' : '-' + i;
          let p = page === 'home' ? '' : page;
          const url = `https://${host}/${p}?v=${Date.now()}-${run}`;
          const reqUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=${process.env.KEY}&strategy=${device}&url=${url}`;

          var item = {
            reqUrl,
            url,
            page,
            run,
            indexStr,
            pathToResults,
            host,
            folder,
            device,
          };

          data.push(item);
        }
      }
    }
  }

  return data;
}

async function getAndWriteResultsAsyncRateLimited(config) {
  const requestsData = buildData(config);
  const spinner = new Spinner(`%s Fetching results for ${requestsData.length * config.devices.length} urls(s)...`);
  spinner.setSpinnerString(30);
  spinner.start();

  rateLimitMap(requestsData, 100, 20, getAndJoinData).then(
    (results) => {
      writeResultsToFiles(results, spinner);
      return results;
    },
    (err) => {
      console.log(('Error: ', err));
      spinner.stop(true);
    }
  );
}

function createDirectory(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function writeResultsToFiles(results, spinner) {
  results.forEach((item) => {
    var { data, folder, indexStr, fullPath, fileName, host, run } = item;
    fs.promises.writeFile(fullPath, JSON.stringify(data)).then((e) => {
      if (e) throw e;
      spinner.stop(true);
      console.log(`- Results written to ${folder}/${host}/${fileName}${indexStr}.json`);
    });
  });
}

export default getAndWriteResultsAsyncRateLimited;
