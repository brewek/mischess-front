import { Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';

export default function PGNViewer(props) {
  const [history, setHistory] = useState([]);

  const changeFen = (idx) => {
    props.setGameConfig({
      ...props.gameConfig,
      position: history[idx].fen,
    });
    if (props.playSound) {
      props.playSound();
    }
  };

  useEffect(() => {
    if (!props.pgn) {
      setHistory([]);
      if (props.onHistoryChange) props.onHistoryChange([]);
      return;
    }

    const chess = new Chess();
    chess.loadPgn(props.pgn);

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
    if (props.onHistoryChange) props.onHistoryChange(moves);
  }, [props.pgn, props.onHistoryChange]);

  return (
    <Grid
      container
      spacing={2}
      style={{
        height: props.height,
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
            {props.players ? props.players.white.username : null}
          </Typography>
        </div>
        <List dense>
          {history
            ? history
                .filter((item, idx) => {
                  return idx % 2 === 0;
                })
                .map((item, idx) => {
                  return (
                    <ListItem key={item.index}>
                      <ListItemButton onClick={() => changeFen(item.index)}>
                        <ListItemText>{item.move}</ListItemText>
                      </ListItemButton>
                    </ListItem>
                  );
                })
            : null}
        </List>
      </Grid>
      <Grid item xs={6}>
        <div
          style={{
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography align="center" variant="caption">
            {props.players ? props.players.black.username : null}
          </Typography>
        </div>
        <List dense>
          {history
            ? history
                .filter((item, idx) => {
                  return idx % 2 !== 0;
                })
                .map((item, idx) => {
                  return (
                    <ListItem key={item.index}>
                      <ListItemButton onClick={() => changeFen(item.index)}>
                        <ListItemText>{item.move}</ListItemText>
                      </ListItemButton>
                    </ListItem>
                  );
                })
            : null}
        </List>
      </Grid>
    </Grid>
  );
}
