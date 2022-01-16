// import { getResults } from './helpers/get-results.js';
// import fs from 'fs';
// import dotenv from 'dotenv';

const getResults = require('./helpers/get-results.js');
const ggetAndWriteResultsAsync = require('./helpers/get-results-async');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const hosts = ['fromourplace.com', 'fromourplace.ca', 'fromourplace.co.uk'];
const pages = [
  'home',
  'collections/all',
  'products/always-essential-cooking-pan',
  'products/perfect-pot',
  'products/home-cook-duo',
];

// const hosts = ['fromourplace.com'];
// const pages = ['home', 'collections/all'];

const folder = 'results-' + new Date().toISOString().slice(0, 16);

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

var sync = false;

const config = {
  folder,
  hosts,
  pages,
  runs: 1,
};

console.log(`${hosts.length * pages.length} pages to test. With ${config.runs} run(s) per page.`);

if (sync) {
  getResults(config);
} else {
  getAndWriteResultsAsync(config);
}
