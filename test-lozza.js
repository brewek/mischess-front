const fs = require('fs');
const lozzaCode = fs.readFileSync('/home/b2a136bc6edf/workspace/mischess-front/public/engines/lozza.js', 'utf8');
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', msg => {
    console.log('LOZZA:', msg);
  });
  worker.postMessage('uci');
  worker.postMessage('position startpos');
  worker.postMessage('go depth 2');
  setTimeout(() => process.exit(0), 1000);
} else {
  global.postMessage = (msg) => parentPort.postMessage(msg);
  parentPort.on('message', msg => {
    global.onmessage({ data: msg });
  });
  eval(lozzaCode);
}
