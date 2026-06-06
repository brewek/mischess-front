const { Chess } = require('chess.js');
const chess = new Chess();
try {
  const move = chess.move({ from: 'e2', to: 'e5' }); // invalid
  console.log('Returned:', move);
} catch (e) {
  console.log('Threw:', e.message);
}
