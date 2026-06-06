import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { getOpening, getUser, getGames } from '../../helpers/api';
import { createFallbackGame } from '../../helpers';

import Board from '../../components/ChessBoard';
import PGNViewer from '../../components/PGNViewer';
import GamesSidebar from './GamesSidebar';

function normalizeGamesResponse(data) {
  if (Array.isArray(data)) return data;
  if (data?.games && Array.isArray(data.games)) return data.games;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

function normalizeGameResponse(lastGame, index, games) {
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
        mistake: lastGame.mistake,
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

  return lastGame;
}

function transformGameItem(g) {
  if (g?.players?.white?.username && g?.players?.black?.username) return g;
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
}

export default function IndexPage({ user, setUser }) {
  const theme = useTheme();
  const [cookies] = useCookies();
  const [game, setGame] = useState({});
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [gameFilter, setGameFilter] = useState('all');
  const [selectedGameIndex, setSelectedGameIndex] = useState(-1);
  const [players, setPlayers] = useState({ white: '', black: '' });
  const [gameConfig, setGameConfig] = useState({
    orientation: 'white',
    position: 'start',
  });
  const [pgn, setPgn] = useState('');
  const [arrows, setArrows] = useState([]);
  const [height, setHeight] = useState(0);
  const [currentUsername, setCurrentUsername] = useState(null);
  const navigate = useNavigate();
  const boardRef = useRef();
  const gamesRef = useRef(games);
  gamesRef.current = games;

  const myUsernames = useMemo(
    () =>
      new Set(
        [currentUsername, ...(user?.accounts || []).map((a) => a.value)]
          .filter(Boolean)
          .map((u) => u.toLowerCase())
      ),
    [currentUsername, user]
  );

  const createArrow = useCallback(
    (move, color) => ({
      from: move.substring(0, 2),
      to: move.substring(2),
      color,
      size: 'medium',
      opacity: 0.35,
    }),
    []
  );

  const getArrows = useCallback(
    (lastGame) => {
      if (!lastGame || !Array.isArray(lastGame.expected_moves)) return [];
      let result = lastGame.expected_moves.map((item) => createArrow(item, 'green'));
      if (typeof lastGame.move_played === 'string') {
        result = result.concat(createArrow(lastGame.move_played, 'red'));
      }
      return result;
    },
    [createArrow]
  );

  const clearArrows = useCallback(() => setArrows([]), []);

  const resetArrows = useCallback(() => {
    const fenPosition = game?.game?.fen || 'start';
    setGameConfig((prev) => ({ ...prev, position: fenPosition }));
    setArrows(getArrows(game));
  }, [game, getArrows]);

  const fetchOpening = useCallback(
    async (token, username, index = -1, currentUserObj = null) => {
      try {
        const response = await getOpening(token, index);

        if (!response.ok) {
          console.error('Error fetching game:', response.status, response.statusText);
          if (response.status === 401 || !token) {
            navigate('/sign-in');
          } else if (username) {
            setGame(createFallbackGame(username));
          }
          return;
        }

        let lastGame = await response.json();
        lastGame = normalizeGameResponse(lastGame, index, gamesRef.current);

        if (!lastGame || !lastGame.game || !lastGame.game.players) {
          console.error('Could not read game data:', JSON.stringify(lastGame));
          if (username) {
            setGame(createFallbackGame(username));
          } else {
            navigate('/error');
          }
          return;
        }

        setArrows(getArrows(lastGame));

        const whitePlayer = lastGame.game.players?.white || {};
        const blackPlayer = lastGame.game.players?.black || {};

        setPlayers({
          white: whitePlayer.username || 'White',
          black: blackPlayer.username || 'Black',
        });

        setPgn(lastGame.game.pgn);

        let orientation = 'white';
        const wUser = lastGame.game?.players?.white?.username?.toLowerCase();
        const bUser = lastGame.game?.players?.black?.username?.toLowerCase();

        const activeUser = currentUserObj || user;
        const activeUsernames = new Set(
          [username, ...(activeUser?.accounts || []).map((a) => a.value)]
            .filter(Boolean)
            .map((u) => u.toLowerCase())
        );

        if (wUser && activeUsernames.has(wUser)) {
          orientation = 'white';
        } else if (bUser && activeUsernames.has(bUser)) {
          orientation = 'black';
        } else {
          orientation = 'white';
        }

        setGame({
          fen: lastGame.fen || lastGame.game?.fen || 'start',
          players: lastGame.players || lastGame.game?.players,
          game: lastGame,
          pgn: lastGame.pgn || lastGame.game?.pgn,
          ended: lastGame.ended || lastGame.game?.ended,
        });

        setGameConfig((prev) => ({
          ...prev,
          position: lastGame.fen || lastGame.game?.fen || 'start',
          orientation,
        }));
      } catch (error) {
        console.error('Network error while fetching game:', error);
        if (username) {
          setGame(createFallbackGame(username));
        }
      }
    },
    [getArrows, navigate, user]
  );

  const handleFilterChange = useCallback(
    (event, newFilter) => {
      if (newFilter === null) return;
      setGameFilter(newFilter);

      const current = gamesRef.current;
      let filtered = current;
      if (newFilter === 'white') {
        filtered = current.filter((g) => myUsernames.has(g.players.white.username?.toLowerCase()));
      } else if (newFilter === 'black') {
        filtered = current.filter((g) => myUsernames.has(g.players.black.username?.toLowerCase()));
      }
      setFilteredGames(filtered);
      setSelectedGameIndex(-1);
    },
    [myUsernames]
  );

  const handleSelectGame = useCallback(
    (idx) => {
      const game = filteredGames[idx];
      const backendIndex =
        game._originalBackendIndex !== undefined ? game._originalBackendIndex : -1;
      setSelectedGameIndex(idx);
      fetchOpening(cookies.token, currentUsername, backendIndex, user);
    },
    [filteredGames, cookies.token, currentUsername, fetchOpening, user]
  );

  useEffect(() => {
    let ignore = false;

    async function checkAuthenticated() {
      try {
        const token = cookies.token;

        if (!token) {
          navigate('/sign-in');
          return;
        }

        const response = await getUser(token);

        if (!ignore && !response.ok) {
          console.error('Error fetching user data:', response.status, response.statusText);
          navigate(response.status === 401 ? '/sign-in' : '/error');
          return;
        }

        const me = await response.json();
        setUser(me);
        setCurrentUsername(me.username);

        try {
          const gamesResponse = await getGames(token);

          if (!gamesResponse.ok) {
            console.error(
              'Error fetching games list:',
              gamesResponse.status,
              gamesResponse.statusText
            );
            setGames([]);
            setFilteredGames([]);

            if (me?.username) {
              setGame(createFallbackGame(me.username));
            }
          } else {
            const data = normalizeGamesResponse(await gamesResponse.json());
            const validGames = data
              .map((g, idx) => {
                const t = transformGameItem(g);
                if (t) t._originalBackendIndex = idx;
                return t;
              })
              .filter((g) => {
                if (!g?.players?.white?.username || !g?.players?.black?.username) {
                  if (g) console.warn('Game without valid players:', g);
                  return false;
                }
                return true;
              })
              .reverse();

            gamesRef.current = validGames;
            setGames(validGames);
            setFilteredGames(validGames);

            if (!validGames || validGames.length === 0) {
              if (me?.username) {
                setGame(createFallbackGame(me.username));
              } else {
                navigate('/error');
              }
            }

            await fetchOpening(token, me.username, -1, me);
          }
        } catch (error) {
          console.error('Error while loading data:', error);

          if (!ignore && !cookies.token) {
            navigate('/sign-in');
          } else {
            setGames([]);
            setFilteredGames([]);

            if (me?.username) {
              setGame(createFallbackGame(me.username));
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
  }, [cookies.token, navigate, setUser]);

  useEffect(() => {
    if (currentUsername && !game?.fen && !game?.players?.white?.username) {
      const timer = setTimeout(() => {
        setGame(createFallbackGame(currentUsername));
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
        {games.length > 0 && (
          <Grid item xs={12} md={3}>
            <GamesSidebar
              games={games}
              filteredGames={filteredGames}
              gameFilter={gameFilter}
              selectedGameIndex={selectedGameIndex}
              height={height}
              currentUsername={currentUsername}
              myUsernames={myUsernames}
              onFilterChange={handleFilterChange}
              onSelectGame={handleSelectGame}
            />
          </Grid>
        )}

        <Grid item xs={12} md={games.length > 0 ? 9 : 12}>
          <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  md={8}
                  ref={boardRef}
                  sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f5f5f5' }}
                >
                  <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                    <Board config={gameConfig} arrows={arrows} />
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                  sx={{ borderLeft: { md: `1px solid ${theme.palette.divider}` } }}
                >
                  <Box
                    sx={{
                      height: { xs: '300px', md: height > 0 ? height : 600 },
                      overflow: 'hidden',
                    }}
                  >
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
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
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
