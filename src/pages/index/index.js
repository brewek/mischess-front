import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { 
  Grid,
  Container,
  FormControl,
  Button
} from "@mui/material";
import { getOpening, getUser } from "../../helpers/api";

import Board from "../../components/ChessBoard";
import PGNViewer from "../../components/PGNViewer";


export default function IndexPage(props) {
  const [cookies] = useCookies();
  const [game, setGame] = useState({});
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

  const separateMoves = (move, color, size) => {
    let from = move.substring(0, 2);
    let to = move.substring(2);

    return {
      direction: `${from}-${to}`,
      color,
      size
    };
  }

  const getArrows = (lastGame) => {
    let arrows = lastGame.expected_moves.map((item) => separateMoves(item, 'blue', 'small'));
    arrows = arrows.concat(separateMoves(lastGame.move_played, 'red', 'small'));
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

  const fetchLastOpening = async (token, username) => {
    let response = await getOpening(token);
    if (!response.ok) {
      console.log(response);
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
        
        setHeight(boardRef.current.offsetHeight);
        fetchLastOpening(token, me.username);
      }
    }
  
    checkAuthenticated();
  
    return () => {
      ignore = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.token]);

  return (
    <Container maxWidth="md">
      <Grid container >
        <Grid item xs={8} ref={boardRef} >
          <Board config={gameConfig} arrows={arrows} />
        </Grid>
        <Grid item xs={4} >
          <PGNViewer 
            gameConfig={gameConfig} 
            setGameConfig={setGameConfig} 
            pgn={pgn} 
            players={players}
            height={height ? height : 0}
            clearArrows={clearArrows}
            resetArrows={resetArrows}
          />
        </Grid>
      </Grid>
      <FormControl fullWidth >
        <Button variant='text' onClick={resetArrows}>
          Reset
        </Button>
      </FormControl>
    </Container>
  );
}
