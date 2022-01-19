import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import { Spinner } from 'cli-spinner';
import { fileURLToPath } from 'url';

async function getAndWriteResults(config) {
  const { folder, hosts, pages, runs, devices } = config;
  const __dirname = config.dir ? config.dir : path.dirname(fileURLToPath(import.meta.url));
  const pathToResults = config.outputDir ? config.outputDir : `${path.join(__dirname, '../')}/${folder}`;

  let results = [];

  for (const host of hosts) {
    if (!fs.existsSync(pathToResults + '/' + host)) {
      fs.mkdirSync(pathToResults + '/' + host);
    }

    for (const page of pages) {
      for (const device of devices) {
        for (var i = 1; i <= runs; i++) {
          var index = runs === 1 ? '' : '-' + i;
          let p = page === 'home' ? '' : page;
          const url = `https://${host}/${p}?v=${Date.now()}`;

          const spinner = Spinner(`%s ${i}. Fetching results for ${url}`);
          spinner.setSpinnerString(20);
          spinner.start();

          const result = await axios.get(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=${process.env.KEY}&strategy=${device}&url=${url}`
          );

          results.push(result.data);

          const fileName = `${device}-${page.replace(RegExp('/', 'g'), '-')}`;
          const fullPath = `${pathToResults}/${host}/${fileName}${index}.json`;

          await fs.promises.writeFile(fullPath, JSON.stringify(result.data)).then((e) => {
            if (e) throw e;
            spinner.stop(true);
            console.log(`- (${i}) Results written to ${folder}/${host}/${fileName}${index}.json`);
          });
        }
      }
    }
  }

  return results;
}

export default getAndWriteResults;
