import getAndWriteResults from './helpers/get-results.js';
import getAndWriteResultsAsync from './helpers/get-results-async.js';
import fs from 'fs';
import dotenv from 'dotenv';
import config from './config.js';

dotenv.config();

const folder = config.folder ? config.folder : `results-${new Date().toISOString().slice(0, 16)}`;
config.folder = folder;

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

console.log(`${config.hosts.length * config.pages.length} pages to test. With ${config.runs} run(s) per page.`);

if (config.sync) {
  getAndWriteResults(config);
} else {
  getAndWriteResultsAsync(config);
}
