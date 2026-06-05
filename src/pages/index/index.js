import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
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
  Chip
} from "@mui/material";
import { getOpening, getUser, getGames } from "../../helpers/api";

import Board from "../../components/ChessBoard";
import PGNViewer from "../../components/PGNViewer";


export default function IndexPage(props) {
  const [cookies] = useCookies();
  const [game, setGame] = useState({});
  const [games, setGames] = useState([]);
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
    if (!lastGame || !lastGame.expected_moves) return [];
    let arrows = lastGame.expected_moves.map((item) => createArrow(item, 'green'));
    if (lastGame.move_played) {
      arrows = arrows.concat(createArrow(lastGame.move_played, 'red'));
    }
    return arrows
  }

  const clearArrows = () => {
    setArrows([]);
  }

  const resetArrows = () => {
    setGameConfig({
      ...gameConfig,
      position: game.fen,
    })
    setArrows(getArrows(game));
  }

  const fetchOpening = async (token, username, index = -1) => {
    let response = await getOpening(token, index);
    if (!response.ok) {
      console.error(response);
      return;
    }

    let lastGame = await response.json();

    setGame(lastGame);
    setArrows(getArrows(lastGame));

    if (!lastGame) {
      navigate('/error');
      return;
    }

    setPlayers({
      white: lastGame.game.players.white,
      black: lastGame.game.players.black
    })
    setPgn(lastGame.game.pgn);
    setGameConfig({
      ...gameConfig,
      position: lastGame.fen,
      orientation: lastGame.game.players.white.username === username ? 'white' : 'black',
    });
  }

  const fetchGamesList = async (token) => {
    let response = await getGames(token);
    if (response.ok) {
      let data = await response.json();
      setGames(data);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function checkAuthenticated() {
      const token = cookies.token;
      let response = await getUser(token);

      if (!ignore) {
        if (!response.ok) {
          navigate('/sign-in');
          return;
        }

        let me = await response.json();
        props.setUser(me);

        if (boardRef.current) {
          setHeight(boardRef.current.offsetHeight);
        }
        await fetchGamesList(token);
        fetchOpening(token, me.username, -1);
      }
    }

    checkAuthenticated();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.token]);


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
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" fontWeight="bold">
                  Moje partie
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {games.length} partii
                </Typography>
              </Box>
              <List sx={{ maxHeight: { xs: '300px', md: height > 0 ? height : 600 }, overflow: 'auto' }}>
                {games.map((g, idx) => {
                  const isSelected = selectedGameIndex === -1 ? idx === games.length - 1 : idx === selectedGameIndex;
                  return (
                    <Box key={idx}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => {
                          setSelectedGameIndex(idx);
                          fetchOpening(cookies.token, props.user?.username, idx);
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
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                            '& .MuiListItemText-primary': {
                              color: 'white',
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
                <Grid item xs={12} md={8} ref={boardRef} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                    <Board config={gameConfig} arrows={arrows} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ borderLeft: { md: '1px solid #e0e0e0' } }}>
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
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
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
