import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import { getOpening, getUser, getGames } from "../../helpers/api";

import Board from "../../components/ChessBoard";
import PGNViewer from "../../components/PGNViewer";


export default function IndexPage(props) {
  const theme = useTheme();
  const [cookies] = useCookies();
  const [game, setGame] = useState({});
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [gameFilter, setGameFilter] = useState('all');
  const [selectedGameIndex, setSelectedGameIndex] = useState(-1);
  const [players, setPlayers] = useState({
    white: '',
    black: ''
  });
  const [gameConfig, setGameConfig] = useState({
    'orientation': 'white',
    'position': 'start'
  });
  const [pgn, setPgn] = useState('');
  const [arrows, setArrows] = useState([]);
  const [height, setHeight] = useState(0);
  const [currentUsername, setCurrentUsername] = useState(null);
  const navigate = useNavigate();
  const boardRef = useRef();

  const createArrow = (move, color) => {
    return {
      from: move.substring(0, 2),
      to: move.substring(2),
      color,
      size: "medium",
      opacity: 0.35
    };
  }

  const getArrows = (lastGame) => {
    if (!lastGame || !Array.isArray(lastGame.expected_moves)) return [];
    let arrows = lastGame.expected_moves.map((item) => createArrow(item, 'green'));
    if (typeof lastGame.move_played === 'string') {
      arrows = arrows.concat(createArrow(lastGame.move_played, 'red'));
    }
    return arrows
  }

  const clearArrows = () => {
    setArrows([]);
  }

  const resetArrows = () => {
    let fenPosition = game?.game?.fen || 'start';
    setGameConfig({
      ...gameConfig,
      position: fenPosition,
    })
    setArrows(getArrows(game));
  }

  const fetchOpening = async (token, username, index = -1) => {
    try {
      let response = await getOpening(token, index);

      if (!response.ok) {
        console.error('Error fetching game:', response.status, response.statusText);

        if (response.status === 401 || !token) {
          navigate('/sign-in');
        } else {
          if (username) {
            setGame({
              fen: 'start',
              players: { white: { username: username }, black: { username: 'Opponent' } },
              pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
              ended: new Date().toISOString()
            });
          }
        }
        return;
      }

      let lastGame = await response.json();

      // === API RESPONSE NORMALIZATION ===
      // Handle different API response formats

      if (lastGame && Array.isArray(lastGame.games) && !lastGame.game) {
        lastGame.game = lastGame.games[index] || null;
      }

      if (lastGame && !lastGame.game && !Array.isArray(lastGame.games)) {
        if (lastGame.players || lastGame.fen) {
          lastGame = {
            game: {
              players: lastGame.players,
              fen: lastGame.fen,
              pgn: lastGame.pgn,
              ended: lastGame.ended,
            },
            expected_moves: lastGame.expected_moves,
            move_played: lastGame.move_played,
            orientation: lastGame.orientation,
          };
        }
      }

      if (lastGame?.game && !lastGame.game.players && Array.isArray(games) && games[index]) {
        lastGame.game.players = games[index].players;
      }

      if (lastGame?.game && Array.isArray(games) && games[index]) {
        if (!lastGame.game.fen) lastGame.game.fen = games[index].fen;
        if (!lastGame.game.pgn) lastGame.game.pgn = games[index].pgn;
        if (!lastGame.game.ended) lastGame.game.ended = games[index].game_ended;
      }

      if (!lastGame || !lastGame.game || !lastGame.game.players) {
        console.error('Could not read game data:', JSON.stringify(lastGame));

        if (username) {
          setGame({
            fen: 'start',
            players: { white: { username: username }, black: { username: 'Opponent' } },
            pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
            ended: new Date().toISOString()
          });
        } else {
          navigate('/error');
        }
        return;
      }

      setArrows(getArrows(lastGame));

      let whitePlayer = lastGame.game.players?.white || {};
      let blackPlayer = lastGame.game.players?.black || {};

      setPlayers({
        white: whitePlayer.username || 'White',
        black: blackPlayer.username || 'Black'
      })
      setPgn(lastGame.game.pgn);
      let orientation = lastGame.game.players?.white?.username === username ? 'white' :
        lastGame.game.players?.black?.username === username ? 'black' :
          (lastGame.orientation || 'white');

      setGame({
        fen: lastGame.fen || lastGame.game?.fen || 'start',
        players: lastGame.players || lastGame.game?.players,
        game: lastGame,
        pgn: lastGame.pgn || lastGame.game?.pgn,
        ended: lastGame.ended || lastGame.game?.ended,
      });

      setGameConfig({
        ...gameConfig,
        position: lastGame.fen || lastGame.game?.fen || 'start',
        orientation: orientation,
      });
    } catch (error) {
      console.error('Network error while fetching game:', error);
      if (username) {
        setGame({
          fen: 'start',
          players: { white: { username: username }, black: { username: 'Opponent' } },
          pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
          ended: new Date().toISOString()
        });
      }
    }
  }

  const handleFilterChange = (event, newFilter) => {
    if (newFilter === null) return;
    setGameFilter(newFilter);

    let filtered = games;
    if (newFilter === 'white') {
      filtered = games.filter(g => g.players.white.username === currentUsername);
    } else if (newFilter === 'black') {
      filtered = games.filter(g => g.players.black.username === currentUsername);
    }
    setFilteredGames(filtered);
    setSelectedGameIndex(-1);
  }

  useEffect(() => {
    let ignore = false;

    async function checkAuthenticated() {
      try {
        const token = cookies.token;

        if (!token) {
          navigate('/sign-in');
          return;
        }

        let response = await getUser(token);

        if (!ignore && !response.ok) {
          console.error('Error fetching user data:', response.status, response.statusText);
          if (response.status === 401) {
            navigate('/sign-in');
          } else {
            navigate('/error');
          }
          return;
        }

        let me = await response.json();
        props.setUser(me);
        setCurrentUsername(me.username);

        try {
          const gamesResponse = await getGames(token);

          if (!gamesResponse.ok) {
            console.error('Error fetching games list:', gamesResponse.status, gamesResponse.statusText);

            if (gamesResponse.status === 401 && !cookies.token) {
              navigate('/sign-in');
              return;
            }

            setGames([]);
            setFilteredGames([]);

            if (me?.username) {
              setGame({
                fen: 'start',
                players: { white: { username: me.username }, black: { username: 'Opponent' } },
                pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                ended: new Date().toISOString()
              });
            }
          } else if (gamesResponse.ok) {
            let data = await gamesResponse.json();

            if (!Array.isArray(data)) {
              console.error('API returned non-array:', typeof data, data);
              if (data?.games && Array.isArray(data.games)) {
                data = data.games;
              } else if (data?.data && Array.isArray(data.data)) {
                data = data.data;
              } else {
                data = [];
              }
            }

            const validGames = (data || [])
              .map(g => {
                if (g?.players?.white?.username && g?.players?.black?.username) {
                  return g;
                }

                if (g?.white?.username && g?.black?.username) {
                  return { ...g, players: { white: g.white, black: g.black } };
                }

                if (g?.game?.players?.white?.username && g?.game?.players?.black?.username) {
                  return { ...g, players: g.game.players };
                }

                if (g?.game?.white?.username && g?.game?.black?.username) {
                  return { ...g, players: { white: g.game.white, black: g.game.black } };
                }

                return null;
              })
              .filter(g => {
                const valid = g?.players?.white?.username && g?.players?.black?.username;
                if (!valid && g) {
                  console.warn('Game without valid players (after transformation):', g);
                }
                return valid;
              });

            setGames(validGames);
            setFilteredGames(validGames);

            if (!validGames || validGames.length === 0) {
              if (me?.username && selectedGameIndex === -1) {
                setGame({
                  fen: 'start',
                  players: { white: { username: me.username }, black: { username: 'Opponent' } },
                  pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                  ended: new Date().toISOString()
                });
              } else {
                navigate('/error');
              }
            }

            await fetchOpening(token, me.username, -1);
          } else {
            console.error('Error fetching games list:', gamesResponse.status, gamesResponse.statusText);
          }
        } catch (error) {
          console.error('Error while loading data:', error);

          if (!ignore && !cookies.token) {
            navigate('/sign-in');
          } else {
            setGames([]);
            setFilteredGames([]);

            if (me?.username) {
              setGame({
                fen: 'start',
                players: { white: { username: me.username }, black: { username: 'Opponent' } },
                pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                ended: new Date().toISOString()
              });
            } else {
              navigate('/error');
            }
          }
        }
      } catch (error) {
        console.error('Network error:', error);
        if (!ignore) {
          navigate('/sign-in');
        }
      }
    }

    checkAuthenticated();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.token]);

  useEffect(() => {
    if (currentUsername && !game?.fen && !game?.players?.white?.username) {
      const timer = setTimeout(() => {
        setGame({
          fen: 'start',
          players: { white: { username: currentUsername }, black: { username: 'Opponent' } },
          pgn: '[Event "Test"]\n[White "' + currentUsername + '"]\n[Black "Przeciwnik"]\n\n',
          ended: new Date().toISOString()
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUsername, game]);

  const isLoading = !game?.fen && !game?.players?.white?.username;

  useEffect(() => {
    if (!isLoading && boardRef.current) {
      setHeight(boardRef.current.offsetHeight);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }} fontWeight="bold">
            Loading games...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Game analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar - Game List */}
        {games.length > 0 && (
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                  onChange={handleFilterChange}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="white">⬜ White</ToggleButton>
                  <ToggleButton value="black">⬛ Black</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <List sx={{ maxHeight: { xs: '300px', md: height > 0 ? height : 600 }, overflow: 'auto' }}>
                {filteredGames.map((g, idx) => {
                  const isSelected = selectedGameIndex === -1 ? idx === filteredGames.length - 1 : idx === selectedGameIndex;
                  return (
                    <Box key={idx}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => {
                          const originalIndex = games.indexOf(g);
                          setSelectedGameIndex(idx);
                          fetchOpening(cookies.token, currentUsername, originalIndex);
                        }}
                        sx={{
                          pl: 3,
                          pr: 2,
                          py: 1.5,
                          borderRadius: 1,
                          mx: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {g.players.white.username}
                              </Typography>
                              <Chip label={`R${g.players.white.rating}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" noWrap>
                                vs {g.players.black.username}{' '}
                                <Chip label={`R${g.players.black.rating}`} size="small" sx={{ height: 20, fontSize: '0.65rem', ml: 0.5 }} />
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary">
                                {'\n'}{new Date(g.game_ended).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItemButton>
                      {idx < games.length - 1 && <Divider sx={{ mx: 2 }} />}
                    </Box>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Main Content - Board + PGN */}
        <Grid item xs={12} md={games.length > 0 ? 9 : 12}>
          <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Grid container>
                <Grid item xs={12} md={8} ref={boardRef} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f5f5f5' }}>
                  <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                    <Board config={gameConfig} arrows={arrows} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ borderLeft: { md: `1px solid ${theme.palette.divider}` } }}>
                  <Box sx={{ height: { xs: '300px', md: height > 0 ? height : 600 }, overflow: 'hidden' }}>
                    <PGNViewer
                      gameConfig={gameConfig}
                      setGameConfig={setGameConfig}
                      pgn={pgn}
                      players={players}
                      height={height ? height : 0}
                      clearArrows={clearArrows}
                      resetArrows={resetArrows}
                    />
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={resetArrows}
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Reset analysis
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
