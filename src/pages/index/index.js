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
    // Użyj FEN z gry lub domyślnej pozycji startowej jeśli nie ma FEN
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

      // Obsługa błędów API i brakujących danych
      if (!response.ok) {
        console.error('Błąd pobierania partii:', response.status, response.statusText);

        // Jeśli token wygasł (401) lub go brak, przekieruj do logowania
        if (response.status === 401 || !token) {
          navigate('/sign-in');
        } else {
          // Dla innych błędów - ustaw startową pozycję gry
          if (username) {
            setGame({
              fen: 'start',
              players: { white: { username: username }, black: { username: 'Przeciwnik' } },
              pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
              ended: new Date().toISOString()
            });
          }
        }
        return;
      }

      let lastGame = await response.json();

      // Walidacja odpowiedzi - obsługa pustych partii i brakujących danych
      if (!lastGame ||
        ((!Array.isArray(lastGame.games)) && !lastGame.game)) {
        console.error('Niepoprawna struktura API:', JSON.stringify(lastGame));

        // Jeśli użytkownik jest zalogowany, pokaż startową pozycję gry
        if (username) {
          setGame({
            fen: 'start',
            players: { white: { username: username }, black: { username: 'Przeciwnik' } },
            pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
            ended: new Date().toISOString()
          });
        } else {
          navigate('/error');
        }
        return;
      }

      // Pobierz właściwą partię z odpowiedzi (obsługa różnych formatów API)
      let gameData = lastGame.games?.[index] || lastGame.game || null;

      // Normalize gameData - może mieć zagnieżdżone "game" pole lub nie
      if (gameData && !gameData.game && gameData.fen) {
        gameData = { game: gameData };
      }

      if (!gameData || !gameData.game || !gameData.game.players) {
        console.error('Brak danych o partii:', JSON.stringify(lastGame));

        // Jeśli nie ma żadnych gier, ale użytkownik jest zalogowany - pokaż startową pozycję
        if (username && index === -1) {
          setGame({
            fen: 'start',
            players: { white: { username: username }, black: { username: 'Przeciwnik' } },
            pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
            ended: new Date().toISOString()
          });
        } else {
          navigate('/error');
        }
        return;
      }

      setArrows(getArrows(lastGame));

      // Ustaw graczy z zabezpieczeniem przed błędami
      let whitePlayer = lastGame.game.players?.white || {};
      let blackPlayer = lastGame.game.players?.black || {};

      setPlayers({
        white: whitePlayer.username || 'White',
        black: blackPlayer.username || 'Black'
      })
      setPgn(lastGame.game.pgn);
      // Ustaw orientację z zabezpieczeniem przed błędami
      let orientation = lastGame.game.players?.white?.username === username ? 'white' :
        lastGame.game.players?.black?.username === username ? 'black' :
          (lastGame.orientation || 'white');

      // Normalizuj grę - ustaw top-level fen i players dla compatibility
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
      console.error('Błąd sieci podczas pobierania partii:', error);
      // Pokaż startową pozycję gry zamiast błędu
      if (username) {
        setGame({
          fen: 'start',
          players: { white: { username: username }, black: { username: 'Przeciwnik' } },
          pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Przeciwnik"]\n\n',
          ended: new Date().toISOString()
        });
      }
    }
  }

  // Funkcja nie jest już używana - usunięta w celu eliminacji warningu ESLint

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
          console.error('Błąd pobierania danych użytkownika:', response.status, response.statusText);
          // Jeśli token wygasł (401), użytkownik musi się zalogować ponownie
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

        if (boardRef.current) {
          setHeight(boardRef.current.offsetHeight);
        }

        // Pobierz listę gier i pierwszą partię
        try {
          const gamesResponse = await getGames(token);

          if (!gamesResponse.ok) {
            console.error('Błąd pobierania listy gier:', gamesResponse.status, gamesResponse.statusText);

            // Jeśli token wygasł (401), przekieruj do logowania
            if (gamesResponse.status === 401 && !cookies.token) {
              navigate('/sign-in');
              return;
            }

            // Dla innych błędów - ustaw startową pozycję gry
            setGames([]);
            setFilteredGames([]);

            if (me?.username) {
              setGame({
                fen: 'start',
                players: { white: { username: me.username }, black: { username: 'Przeciwnik' } },
                pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                ended: new Date().toISOString()
              });
            }
          } else if (gamesResponse.ok) {
            let data = await gamesResponse.json();
            setGames(data || []);
            setFilteredGames(data || []);

            // Jeśli nie ma gier, wyświetl komunikat zamiast pętli ładowania
            if (!data || data.length === 0) {
              console.log('Nie masz jeszcze żadnych partii.');

              // Ustaw startową pozycję gry jeśli użytkownik jest zalogowany
              if (me?.username && selectedGameIndex === -1) {
                setGame({
                  fen: 'start',
                  players: { white: { username: me.username }, black: { username: 'Przeciwnik' } },
                  pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                  ended: new Date().toISOString()
                });
              } else {
                navigate('/error');
              }
            }

            // Pobierz pierwszą partię (lub ostatnią jeśli to nie jest startowa pozycja)
            await fetchOpening(token, me.username, -1);

            // Zabezpieczenie - jeśli fetchOpening nie ustawił gry, ustaw fallback
            setTimeout(() => {
              if (!ignore && (!game?.fen || !game?.players?.white?.username)) {
                console.log('fetchOpening nie ustawił gry, ustawianie fallback');
                setGame({
                  fen: 'start',
                  players: { white: { username: me.username }, black: { username: 'Przeciwnik' } },
                  pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                  ended: new Date().toISOString()
                });
              }
            }, 2000);
          } else {
            console.error('Błąd pobierania listy gier:', gamesResponse.status, gamesResponse.statusText);
          }
        } catch (error) {
          console.error('Błąd podczas ładowania danych:', error);

          // Jeśli token nie istnieje - przekieruj do logowania
          if (!ignore && !cookies.token) {
            navigate('/sign-in');
          } else {
            setGames([]);
            setFilteredGames([]);

            // Ustaw startową pozycję gry jeśli użytkownik jest zalogowany
            if (me?.username) {
              setGame({
                fen: 'start',
                players: { white: { username: me.username }, black: { username: 'Przeciwnik' } },
                pgn: '[Event "Test"]\n[White "' + me.username + '"]\n[Black "Przeciwnik"]\n\n',
                ended: new Date().toISOString()
              });
            } else {
              navigate('/error');
            }
          }
        }
      } catch (error) {
        console.error('Błąd sieci:', error);
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

  // Fallback - jeśli gra nie załaduje się prawidłowo, upewnij się że coś jest wyświetlane
  useEffect(() => {
    if (currentUsername && !game?.fen && !game?.players?.white?.username) {
      const timer = setTimeout(() => {
        setGame({
          fen: 'start',
          players: { white: { username: currentUsername }, black: { username: 'Przeciwnik' } },
          pgn: '[Event "Test"]\n[White "' + currentUsername + '"]\n[Black "Przeciwnik"]\n\n',
          ended: new Date().toISOString()
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUsername, game]);


  const isLoading = !game?.fen && !game?.players?.white?.username;

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }} fontWeight="bold">
            Ładowanie partii...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Analiza partii
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar - Game List */}
        {games.length > 0 && (
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight="bold">
                  Moje partie
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {filteredGames.length} z {games.length} partii
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
                  <ToggleButton value="all">Wszystkie</ToggleButton>
                  <ToggleButton value="white">⬜ Biały</ToggleButton>
                  <ToggleButton value="black">⬛ Czarny</ToggleButton>
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
                      Resetuj analizę
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
