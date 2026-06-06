function prettyDate(date) {
  const now = new Date();
  const secs = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (secs < 60) return secs + 's ago';
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  if (secs < 604800) return Math.floor(secs / 86400) + 'd ago';
  return date.toDateString();
}

function createFallbackGame(username) {
  return {
    fen: 'start',
    players: { white: { username }, black: { username: 'Opponent' } },
    pgn: '[Event "Test"]\n[White "' + username + '"]\n[Black "Opponent"]\n\n',
    ended: new Date().toISOString(),
  };
}

export { prettyDate, createFallbackGame };
