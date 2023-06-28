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
          board.addArrow(item.direction, item.color, item.size);
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
