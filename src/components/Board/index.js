import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { getOpening } from "../../helpers/api";

export default function Board(props) {
  const [game, setGame] = useState();
  const [arrows, setArrows] = useState();
  const [current, setCurrent] = useState()
  const [cookies, setCookies] = useCookies();
  const navigate = useNavigate()

  const separateMoves = (move) => {
    let from = move.substring(0, 2);
    let to = move.substring(2);

    return [from, to];
  }

  const updateArrows = async (lastGame) => {
    let played = separateMoves(lastGame.move_played);
    let moves = lastGame.expected_moves.map((item) => separateMoves(item));

    setCurrent([played]);
    setArrows(moves);
  }

  useEffect(() => {
    let ignore = false;

    async function fetchLastGame() {
      let token = cookies.token;
      if (!token)
        return;

      let response = await getOpening(token);

      if (!ignore) {
        if (!response.ok) {
          console.log("Failed to get last game");
          return;
        }

        let lastGame = await response.json();

        if (!lastGame) {
          navigate('/error');
          return;
        }

        setGame(lastGame);
        await updateArrows(lastGame);
      }
    }

    fetchLastGame();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      {game ? <Chessboard 
        position={game.fen} 
        isDraggablePiece={() => false}
        customArrows={arrows}
        customArrowColor="#000"
        boardOrientation={game.game.players.white.username === 'brewek' ? 'white' : 'black'}
        areArrowsAllowed={false}
        clearPremovesOnRightClick={false}
      /> : null}
    </>
  )
}