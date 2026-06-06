import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  TextField,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function EngineControls({ engineHook }) {
  const {
    isEnabled,
    toggleEngine,
    engineType,
    setEngineType,
    engineDepth,
    setEngineDepth,
    engineMultiPv,
    setEngineMultiPv,
    evaluation,
  } = engineHook;

  const [settingsOpen, setSettingsOpen] = useState(false);

  const evalArray = Array.isArray(evaluation) ? evaluation : [];
  const topEvaluation = evalArray[0];

  // Render evaluation bar segment
  let evalNum = 0;
  if (topEvaluation?.score) {
    if (topEvaluation.score.startsWith('M')) {
      evalNum = topEvaluation.score.startsWith('-') ? -10 : 10;
    } else {
      evalNum = parseFloat(topEvaluation.score);
    }
  }

  // Normalize between 0 and 100 for the progress bar
  // +10 -> 100%, -10 -> 0%, 0 -> 50%
  const clampEval = Math.max(-10, Math.min(10, evalNum));
  const progressValue = ((clampEval + 10) / 20) * 100;

  return (
    <Box
      sx={{ p: 1, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Engine
          </Typography>
          <Switch size="small" checked={isEnabled} onChange={toggleEngine} color="primary" />
        </Box>

        {isEnabled && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'monospace',
                minWidth: '40px',
                textAlign: 'right',
              }}
            >
              {topEvaluation ? topEvaluation.score : '...'}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSettingsOpen(!settingsOpen)}
              color={settingsOpen ? 'primary' : 'default'}
              sx={{ p: 0.5 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {isEnabled && (
        <Collapse in={settingsOpen}>
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption">Engine:</Typography>
              <Select
                size="small"
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
                sx={{ minWidth: 100, height: 24, fontSize: '0.75rem' }}
              >
                <MenuItem value="stockfish" sx={{ fontSize: '0.75rem' }}>
                  Stockfish
                </MenuItem>
                <MenuItem value="lozza" sx={{ fontSize: '0.75rem' }}>
                  Lozza
                </MenuItem>
              </Select>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption">Max Depth:</Typography>
              <TextField
                type="number"
                size="small"
                value={engineDepth}
                onChange={(e) => setEngineDepth(parseInt(e.target.value, 10))}
                inputProps={{
                  min: 1,
                  max: 99,
                  style: {
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    width: '40px',
                    textAlign: 'center',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption">Lines (MultiPV):</Typography>
              <TextField
                type="number"
                size="small"
                value={engineMultiPv}
                onChange={(e) => setEngineMultiPv(parseInt(e.target.value, 10))}
                inputProps={{
                  min: 1,
                  max: 10,
                  style: {
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    width: '40px',
                    textAlign: 'center',
                  },
                }}
              />
            </Box>
          </Box>
        </Collapse>
      )}

      {isEnabled && (
        <Box
          sx={{
            mt: 1,
            position: 'relative',
            width: '100%',
            height: 6,
            bgcolor: '#444',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progressValue}%`,
              bgcolor: '#eee',
              transition: 'width 0.3s ease-out',
            }}
          />
        </Box>
      )}

      {isEnabled && evalArray.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {evalArray.slice(0, engineMultiPv).map((line, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'baseline',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', width: '36px', flexShrink: 0, textAlign: 'right' }}
              >
                {line.score}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontFamily: 'monospace',
                }}
              >
                {line.pv}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
