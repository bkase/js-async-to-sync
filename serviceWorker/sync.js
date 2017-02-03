

importScripts('asyncToSync.js');

console.log('calling async function...');

var result = callSync('test_timeout', [ 1000 ]);

console.log('got result');
console.log(result);
