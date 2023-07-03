import { useEffect } from 'react';

export default function Board(props) {
  useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://unpkg.com/@chrisoakman/chessboard2@0.5.0/dist/chessboard2.min.js'
    script.async = true
    script.onload = () => {
      const chessboard2 = window['Chessboard2']
      const board = chessboard2('board', props.config);

      if (props.arrows) {
        props.arrows.forEach((item) => {
          board.addArrow({ start: item.from, end: item.to, color: item.color, size: item.size, opacity: item.opacity });
        })
      }
    };

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
    // eslint-disable-next-line:react-hooks/exhaustive-deps
  }, [props.config, props.arrows])

  return (
    <div>
      <div id='board' />
    </div>
  )
}
