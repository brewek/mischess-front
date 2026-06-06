const { Worker } = require('worker_threads');
// Node.js doesn't natively support loading web workers like this for the stockfish.js file
// I will just read the stockfish.js file to see if it's customized.
