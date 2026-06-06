import { useEffect, useRef } from 'react';
import 'js-chess-viewer';
import 'js-chess-viewer/theme.css';

export default function Board(props) {
  const boardRef = useRef(null);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    el.setAttribute('fen', props.config?.position || 'start');
    el.setAttribute('orientation', props.config?.orientation || 'white');
    el.setAttribute('coordinates', 'classic');
    el.setAttribute('moveable', 'false');
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
