/**
 *  config.js options:
 *  folder: (optional) string of the folder name you want to save results to, defaults to results-[iso timestamp]
 *  hosts: an array of the hosts i.e. example.com
 *  pages: an array pf pages for each hosts ie.e /product/pencil, for home page just put home or index
 *  runs: integer the number of times to run each page i.e. 3 get 3 results for /products/pencil page
 *  sync: (optional) boolean that runs either synchronously or asynchronous defaults to async as its faster
 *  dir: (optional) string of path to putput folder, defaults to root of this project
 */

const config = {
  hosts: ['example.com', 'example.ca', 'example.co.uk'],
  pages: ['home', 'posts/all', 'about', 'products/pencil'],
  runs: 1,
  sync: false,
};
