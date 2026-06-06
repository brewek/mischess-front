const { Chess } = require('chess.js');

function fixFen(fen) {
  if (!fen || fen === 'start') return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
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

function uciToSan(fen, uciLine) {
  try {
    const fixedFen = fixFen(fen);
    const chess = new Chess(fixedFen);
    const moves = uciLine.trim().split(/\s+/);
    const sanMoves = [];
    let moveCount = chess.moveNumber();
    let turn = chess.turn();

    for (const uciMove of moves) {
      if (!uciMove) continue;
      if (uciMove === '0000') break; 

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
    return sanMoves.length > 0 ? sanMoves.join(' ') : uciLine;
  } catch (e) {
    return 'ERROR: ' + e.message + ' | UCI: ' + uciLine;
  }
}

console.log('Depth 1:', uciToSan('start', 'e2e4'));
console.log('Depth 2:', uciToSan('start', 'e2e4 e7e5'));
