const { Chess } = require('chess.js');

function uciToSan(fen, uciLine) {
  try {
    const chess = new Chess(fen === 'start' ? undefined : fen);
    const moves = uciLine.trim().split(' ');
    const sanMoves = [];
    let moveCount = chess.moveNumber();
    let turn = chess.turn();

    for (const uciMove of moves) {
      if (!uciMove) continue;
      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion = uciMove.length === 5 ? uciMove[4] : undefined;
      
      const move = chess.move({ from, to, promotion });
      if (!move) break; 
      
      if (turn === 'w') {
        sanMoves.push(`${moveCount}. ${move.san}`);
        turn = 'b';
      } else {
        if (sanMoves.length === 0) {
          sanMoves.push(`${moveCount}... ${move.san}`);
        } else {
          sanMoves.push(`${move.san}`);
        }
        turn = 'w';
        moveCount++;
      }
    }
    return sanMoves.join(' ');
  } catch (e) {
    return 'ERROR: ' + e.message;
  }
}

console.log(uciToSan('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 'e7e5 g1f3 b8c6'));
