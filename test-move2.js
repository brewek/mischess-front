const { Chess } = require('chess.js');
const chess = new Chess();
chess.move({ from: 'e2', to: 'e4' });
try {
  chess.move({ from: 'e7', to: 'e5' });
  console.log('Success!', chess.fen());
} catch (e) {
  console.log('Failed:', e.message);
}
