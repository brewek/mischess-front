function fixFen(fen) {
  if (fen === 'start') return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const parts = fen.trim().split(/\s+/);
  if (parts.length === 6) return fen;
  
  let result = parts[0];
  result += parts[1] ? ' ' + parts[1] : ' w';
  result += parts[2] ? ' ' + parts[2] : ' KQkq';
  result += parts[3] ? ' ' + parts[3] : ' -';
  result += parts[4] ? ' ' + parts[4] : ' 0';
  result += parts[5] ? ' ' + parts[5] : ' 1';
  return result;
}

const { Chess } = require('chess.js');
try {
  new Chess(fixFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'));
  console.log('Fixed FEN works!');
} catch (e) {
  console.log(e.message);
}
