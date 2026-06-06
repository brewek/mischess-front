import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import { useEffect, useState, useMemo, memo, useCallback } from 'react';

function PGNViewer({
  pgn,
  onHistoryChange,
  setGameConfig,
  playSound,
  height,
  players,
  gameConfig,
}) {
  const [history, setHistory] = useState([]);

  const changeFen = useCallback(
    (idx) => {
      setGameConfig((prev) => ({
        ...prev,
        position: history[idx].fen,
      }));
      if (playSound) playSound();
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

  const rows = useMemo(() => {
    if (!history) return [];
    const r = [];
    for (let i = 0; i < history.length; i += 2) {
      r.push({
        moveNumber: i / 2 + 1,
        white: history[i],
        black: history[i + 1] || null,
      });
    }
    return r;
  }, [history]);

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
          p: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{ width: 45, textAlign: 'center', color: 'text.secondary' }}
        >
          #
        </Typography>
        <Typography variant="caption" align="center" sx={{ flex: 1, fontWeight: 'bold' }} noWrap>
          {players?.white?.username || 'White'}
        </Typography>
        <Typography variant="caption" align="center" sx={{ flex: 1, fontWeight: 'bold' }} noWrap>
          {players?.black?.username || 'Black'}
        </Typography>
      </Box>
      <List dense sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
        {rows.map((row) => (
          <ListItem
            key={row.moveNumber}
            disablePadding
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: row.moveNumber % 2 === 0 ? 'action.hover' : 'background.paper',
              display: 'flex',
            }}
          >
            <Box
              sx={{
                width: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: 1,
                borderColor: 'divider',
                py: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {row.moveNumber}.
              </Typography>
            </Box>

            <ListItemButton
              selected={gameConfig?.position === row.white.fen}
              onClick={() => changeFen(row.white.index)}
              sx={{ flex: 1, textAlign: 'center', py: 0.5 }}
            >
              <ListItemText
                primary={row.white.move}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: gameConfig?.position === row.white.fen ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>

            {row.black ? (
              <ListItemButton
                selected={gameConfig?.position === row.black.fen}
                onClick={() => changeFen(row.black.index)}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 0.5,
                  borderLeft: 1,
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={row.black.move}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: gameConfig?.position === row.black.fen ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            ) : (
              <Box sx={{ flex: 1, borderLeft: 1, borderColor: 'divider' }} />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default memo(PGNViewer);
