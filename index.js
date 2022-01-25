import getAndWriteResults from './helpers/get-results.js';
import getAndWriteResultsAsync from './helpers/get-results-async.js';
import getAndWriteResultsAsyncRateLimited from './helpers/get-async-rate-limited.js';
import fs from 'fs';
import dotenv from 'dotenv';
import config from './config.js';

dotenv.config();

//Set defaults incase not defined
let folder = config.folder ? config.folder : `results-${new Date().toISOString().slice(0, 16)}`;
let mainFolder = config.sync ? `sync-${folder}` : folder;
let devices = config.devices ? config.devices : ['desktop'];
config.folder = mainFolder;
config.devices = devices;

if (!fs.existsSync(mainFolder)) {
  fs.mkdirSync(mainFolder);
}

console.log(
  `${config.hosts.length * config.pages.length} pages to test. With ${config.runs} run(s) per page and ${
    config.devices.length
  } device(s)`
);

if (config.sync) {
  getAndWriteResults(config);
} else {
  //getAndWriteResultsAsync(config);
  getAndWriteResultsAsyncRateLimited(config);
}
