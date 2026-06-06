import { useEffect, useRef } from 'react';
import 'js-chess-viewer';
import 'js-chess-viewer/theme.css';

export default function Board(props) {
  const boardRef = useRef(null);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    el.setAttribute('coordinates', 'classic');
    el.setAttribute('moveable', 'false');
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    let newFen = props.config?.position || 'start';
    if (newFen === 'start') {
      newFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    } else if (newFen.split('/').length < 8) {
      console.warn('Invalid FEN prevented from crashing board:', newFen);
      newFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }

    if (el.getAttribute('fen') !== newFen) {
      el.setAttribute('fen', newFen);
    }

    if (el.getAttribute('orientation') !== (props.config?.orientation || 'white')) {
      el.setAttribute('orientation', props.config?.orientation || 'white');
    }
  }, [props.config]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    el.setArrows(props.arrows || []);
  }, [props.arrows]);

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }} className="theme-wood">
      <chess-board ref={boardRef}></chess-board>
    </div>
  );
}
