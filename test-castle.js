const { Chess } = require('chess.js');
const chess = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
const move = chess.move({ from: 'e1', to: 'g1' });
console.log(move);
