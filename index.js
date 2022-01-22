import getAndWriteResults from './helpers/get-results.js';
import getAndWriteResultsAsync from './helpers/get-results-async.js';
import getAndWriteResultsAsyncRateLimited from './helpers/get-async-rate-limited.js';
import fs from 'fs';
import dotenv from 'dotenv';
import config from './config.js';

dotenv.config();

//Set defaults incase not defined
let folder = config.folder ? config.folder : `results-${new Date().toISOString().slice(0, 16)}`;
let devices = config.devices ? config.devices : ['desktop'];
config.folder = folder;
config.devices = devices;

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

console.log(`${config.hosts.length * config.pages.length} pages to test. With ${config.runs} run(s) per page.`);

if (config.sync) {
  getAndWriteResults(config);
} else {
  //getAndWriteResultsAsync(config);
  getAndWriteResultsAsyncRateLimited(config);
}
