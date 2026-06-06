import { Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import { useEffect, useState, useMemo, memo, useCallback } from 'react';

function PGNViewer({ pgn, onHistoryChange, setGameConfig, playSound, height, players }) {
  const [history, setHistory] = useState([]);

  const changeFen = useCallback(
    (idx) => {
      setGameConfig((prev) => ({
        ...prev,
        position: history[idx].fen,
      }));
      if (playSound) {
        playSound();
      }
    },
    [history, setGameConfig, playSound]
  );

  useEffect(() => {
    if (!pgn) {
      setHistory([]);
      if (onHistoryChange) onHistoryChange([]);
      return;
    }

    const chess = new Chess();
    chess.loadPgn(pgn);

    const tempChess = new Chess();
    const moves = chess.history().map((move, idx) => {
      tempChess.move(move);
      return {
        index: idx,
        move,
        fen: tempChess.fen(),
      };
    });

    setHistory(moves);
    if (onHistoryChange) onHistoryChange(moves);
  }, [pgn, onHistoryChange]);

  const whiteMoves = useMemo(() => {
    if (!history) return null;
    return history
      .filter((item, idx) => idx % 2 === 0)
      .map((item) => (
        <ListItem key={item.index}>
          <ListItemButton onClick={() => changeFen(item.index)}>
            <ListItemText>{item.move}</ListItemText>
          </ListItemButton>
        </ListItem>
      ));
  }, [history, changeFen]);

  const blackMoves = useMemo(() => {
    if (!history) return null;
    return history
      .filter((item, idx) => idx % 2 !== 0)
      .map((item) => (
        <ListItem key={item.index}>
          <ListItemButton onClick={() => changeFen(item.index)}>
            <ListItemText>{item.move}</ListItemText>
          </ListItemButton>
        </ListItem>
      ));
  }, [history, changeFen]);

  return (
    <Grid
      container
      spacing={2}
      style={{
        height: height,
        overflowX: 'hidden',
        overflowY: 'scroll',
        marginTop: '1px',
      }}
    >
      <Grid item xs={6}>
        <div
          style={{
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography align="center" variant="caption">
            {players ? players.white.username : null}
          </Typography>
        </div>
        <List dense>{whiteMoves}</List>
      </Grid>
      <Grid item xs={6}>
        <div
          style={{
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography align="center" variant="caption">
            {players ? players.black.username : null}
          </Typography>
        </div>
        <List dense>{blackMoves}</List>
      </Grid>
    </Grid>
  );
}

export default memo(PGNViewer);
