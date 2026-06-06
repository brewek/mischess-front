const { Chess } = require('chess.js');
const tempChess = new Chess();
tempChess.move('e4');
console.log(tempChess.fen());
