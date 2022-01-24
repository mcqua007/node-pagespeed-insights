// pass the following arguments:
//   array - array of values to iterate
//   requestsPerSec - max requests per second to send (integer)
//   maxInFlight - max number of requests in process at a time
//   fn - function to process an array value
//        function is passed array element as first argument
//        function returns a promise that is resolved/rejected when async operation is done
// Returns: promise that is resolved with an array of resolves values
//          or rejected with first error that occurs

function rateLimitMap(array, requestsPerSec, maxInFlight, fn) {
  return new Promise(function(resolve, reject) {
    var index = 0;
    var inFlightCntr = 0;
    var doneCntr = 0;
    var launchTimes = [];
    var results = new Array(array.length);
    // calculate num requests in last second
    function calcRequestsInLastSecond() {
      var now = Date.now();
      // look backwards in launchTimes to see how many were launched within the last second
      var cnt = 0;
      for (var i = launchTimes.length - 1; i >= 0; i--) {
        if (now - launchTimes[i] < 1000) {
          ++cnt;
        } else {
          break;
        }
      }
      return cnt;
    }

    function runMore() {
      while (index < array.length && inFlightCntr < maxInFlight && calcRequestsInLastSecond() < requestsPerSec) {
        (function(i) {
          ++inFlightCntr;
          launchTimes.push(Date.now());

          fn(array[i]).then(function(val) {
            results[i] = val;
            --inFlightCntr;
            ++doneCntr;
            runMore();
          }, reject);
        })(index);
        ++index;
      }
      // see if we're done
      if (doneCntr === array.length) {
        resolve(results);
      } else if (launchTimes.length >= requestsPerSec) {
        // calc how long we have to wait before sending more
        var delta = 1000 - (Date.now() - launchTimes[launchTimes.length - requestsPerSec]);
        if (delta >= 0) {
          setTimeout(runMore, ++delta);
        }
      }
    }
    runMore();
  });
}
export default rateLimitMap;
