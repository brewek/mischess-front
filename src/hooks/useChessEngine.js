import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';

const ENGINES = {
  stockfish: '/engines/stockfish.js',
  lozza: '/engines/lozza.js',
};

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
      // Handle special cases or malformed engine outputs
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
    return 'ERR: ' + e.message + ' | ' + uciLine;
  }
}

export default function useChessEngine() {
  const [engineType, setEngineType] = useState('stockfish');
  const [isEnabled, setIsEnabled] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const workerRef = useRef(null);
  const positionFenRef = useRef('start');

  const stopEngine = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const evaluatePosition = useCallback(
    (fen) => {
      positionFenRef.current = fen;
      if (workerRef.current && isEnabled) {
        workerRef.current.postMessage('stop');
        workerRef.current.postMessage('ucinewgame');
        workerRef.current.postMessage(
          `position fen ${fen === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : fen}`
        );
        workerRef.current.postMessage('go depth 15');
      }
    },
    [isEnabled]
  );

  const evalLinesRef = useRef([]);

  const startEngine = useCallback(
    (type = engineType) => {
      stopEngine();
      const url = ENGINES[type] || ENGINES.stockfish;
      const worker = new Worker(url);
      workerRef.current = worker;
      evalLinesRef.current = [];

      worker.onmessage = (event) => {
        const line = event.data;
        if (typeof line !== 'string') return;

        if (line.startsWith('info') && line.includes('score') && line.includes(' pv ')) {
          const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
          const pvMatch = line.match(/ pv (.*)/);
          const multiPvMatch = line.match(/multipv (\d+)/);
          const multiPvIndex = multiPvMatch ? parseInt(multiPvMatch[1], 10) - 1 : 0;

          if (scoreMatch && pvMatch) {
            const type = scoreMatch[1];
            const val = parseInt(scoreMatch[2], 10);
            let scoreStr = '';
            if (type === 'cp') {
              scoreStr = (val / 100).toFixed(2);
              if (val > 0) scoreStr = '+' + scoreStr;
            } else {
              scoreStr = 'M' + Math.abs(val);
              if (val < 0) scoreStr = '-' + scoreStr;
            }

            const rawPv = pvMatch[1].trim();
            evalLinesRef.current[multiPvIndex] = {
              score: scoreStr,
              pv: uciToSan(positionFenRef.current, rawPv),
              firstMove: rawPv.split(' ')[0],
            };

            setEvaluation([...evalLinesRef.current].filter(Boolean));
          }
        }
      };

      worker.postMessage('uci');
      worker.postMessage('setoption name MultiPV value 3');
      worker.postMessage('isready');
      if (positionFenRef.current) {
        evaluatePosition(positionFenRef.current);
      }
    },
    [engineType, stopEngine, evaluatePosition]
  );

  useEffect(() => {
    if (isEnabled) {
      startEngine();
    } else {
      stopEngine();
      setEvaluation(null);
    }
    return () => {
      stopEngine();
    };
  }, [isEnabled, startEngine, stopEngine]);

  const toggleEngine = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  return {
    isEnabled,
    toggleEngine,
    engineType,
    setEngineType,
    evaluation,
    evaluatePosition,
  };
}
