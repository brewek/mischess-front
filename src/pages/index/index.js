import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/system";
import { getOpening, getUser } from "../../helpers/api";
import Board from "../../components/ChessBoard";


export default function IndexPage(props) {
  const [cookies] = useCookies();
  const [gameConfig, setGameConfig] = useState({
    'orientation': 'white',
    'position': 'start'
  });
  const [arrows, setArrows] = useState([]);
  const navigate = useNavigate();

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

  const fetchLastOpening = async (token, username) => {
    let response = await getOpening(token);
    if (!response.ok) {
      console.log(response);
      return;
    }

    let lastGame = await response.json();

    setArrows(getArrows(lastGame));

    if (!lastGame) {
      navigate('/error');
      return;
    }

    setGameConfig({
      ...gameConfig,
      position: lastGame.fen,
      orientation: lastGame.game.players.white.username === username ? 'white' : 'black'
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
    <Container maxWidth="sm">
      <Board config={gameConfig} arrows={arrows} />
    </Container>
  );
}
