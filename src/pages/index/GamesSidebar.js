import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const getSourceIcon = (url) => {
  if (url?.includes('lichess.org'))
    return (
      <img
        src="https://lichess1.org/assets/logo/lichess-favicon-32.png"
        alt="Lichess"
        width={16}
        height={16}
      />
    );
  if (url?.includes('chess.com'))
    return (
      <img
        src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png"
        alt="Chess.com"
        width={16}
        height={16}
      />
    );
  return <OpenInNewIcon fontSize="small" />;
};

export default function GamesSidebar(props) {
  const theme = useTheme();
  const {
    games,
    filteredGames,
    gameFilter,
    selectedGameIndex,
    height,
    myUsernames,
    onFilterChange,
    onSelectGame,
  } = props;

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: height > 0 ? height : 600 },
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" fontWeight="bold">
          My games
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {filteredGames.length} of {games.length} games
        </Typography>
      </Box>
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <ToggleButtonGroup
          value={gameFilter}
          exclusive
          onChange={onFilterChange}
          fullWidth
          size="small"
        >
          <ToggleButton value="white">White</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="black">Black</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredGames.map((g, idx) => {
          const isSelected = selectedGameIndex === -1 ? idx === 0 : idx === selectedGameIndex;
          const isWhite = myUsernames.has(g.players.white.username?.toLowerCase());
          const isLightMode = theme.palette.mode === 'light';

          let gradientBase, gradientSelected;
          if (isWhite) {
            const opBase = isLightMode ? 0.7 : 0.12;
            const opSel = isLightMode ? 0.9 : 0.2;
            gradientBase = `linear-gradient(to right, rgba(255,255,255,${opBase}), transparent 45%)`;
            gradientSelected = `linear-gradient(to right, rgba(255,255,255,${opSel}), transparent 55%)`;
          } else {
            const opBase = !isLightMode ? 0.6 : 0.12;
            const opSel = !isLightMode ? 0.8 : 0.2;
            gradientBase = `linear-gradient(to left, rgba(0,0,0,${opBase}), transparent 45%)`;
            gradientSelected = `linear-gradient(to left, rgba(0,0,0,${opSel}), transparent 55%)`;
          }

          return (
            <Box key={idx}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelectGame(idx)}
                sx={{
                  position: 'relative',
                  pl: 3,
                  pr: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 1,
                    background: gradientBase,
                    pointerEvents: 'none',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&::before': {
                      background: gradientSelected,
                    },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.contrastText',
                      fontWeight: 600,
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255,255,255,0.85)',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0.5 }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight={
                          myUsernames.has(g.players.white.username?.toLowerCase()) ? 700 : 400
                        }
                        noWrap
                        sx={{
                          flex: '1 1 0',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'left',
                        }}
                      >
                        {g.players.white.username}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexShrink: 0, color: 'text.secondary' }}
                      >
                        vs
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight={
                          myUsernames.has(g.players.black.username?.toLowerCase()) ? 700 : 400
                        }
                        noWrap
                        sx={{
                          flex: '1 1 0',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'right',
                        }}
                      >
                        {g.players.black.username}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{
                    sx: { width: '100%' },
                  }}
                  secondary={
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        width: '100%',
                        mt: 0.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                      >
                        <Typography component="span" variant="caption">
                          {myUsernames.has(g.players.white.username?.toLowerCase())
                            ? g.players.white.rating != null
                              ? `R${g.players.white.rating}`
                              : ''
                            : g.players.black.rating != null
                              ? `R${g.players.black.rating}`
                              : ''}
                        </Typography>
                        <Typography component="span" variant="caption">
                          {myUsernames.has(g.players.white.username?.toLowerCase())
                            ? g.players.black.rating != null
                              ? `R${g.players.black.rating}`
                              : ''
                            : g.players.white.rating != null
                              ? `R${g.players.white.rating}`
                              : ''}
                        </Typography>
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          gap: 0.75,
                        }}
                      >
                        {g.url && (
                          <Tooltip title="View game on source site">
                            <IconButton
                              component="a"
                              href={g.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                              sx={{ p: 0, color: 'inherit', display: 'flex' }}
                            >
                              {getSourceIcon(g.url)}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Typography component="span" variant="caption" sx={{ opacity: 0.65 }}>
                          {new Date(g.game_ended).toISOString().replace('T', ' ').substring(0, 16)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondaryTypographyProps={{
                    sx: { mt: 0.25 },
                  }}
                />
              </ListItemButton>
              {idx < games.length - 1 && <Divider sx={{ mx: 2 }} />}
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}
