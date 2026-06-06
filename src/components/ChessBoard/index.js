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

    const newFen = props.config?.position || 'start';
    if (el.getAttribute('fen') !== newFen) {
      el.setAttribute('fen', newFen);
    }

    const newOrientation = props.config?.orientation || 'white';
    if (el.getAttribute('orientation') !== newOrientation) {
      el.setAttribute('orientation', newOrientation);
    }
  }, [props.config?.position, props.config?.orientation]);

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
