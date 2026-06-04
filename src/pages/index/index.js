import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Container,
  FormControl,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Paper
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

  const handleGameChange = (event) => {
    const idx = event.target.value;
    setSelectedGameIndex(idx);
    fetchOpening(cookies.token, props.user?.username, idx);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Analiza partii
      </Typography>
      
      {games.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="game-select-label">Wybierz partię</InputLabel>
            <Select
              labelId="game-select-label"
              value={selectedGameIndex === -1 ? games.length - 1 : selectedGameIndex}
              onChange={handleGameChange}
              label="Wybierz partię"
            >
              {games.map((g, idx) => (
                <MenuItem key={idx} value={idx}>
                  {new Date(g.game_ended).toLocaleString()} - {g.players.white.username} ({g.players.white.rating}) vs {g.players.black.username} ({g.players.black.rating})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

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
    </Container>
  );
}
