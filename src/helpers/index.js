function prettyDate(date) {
  let now = new Date();
  var secs = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (secs < 60) return secs + "s ago";
  if (secs < 3600) return Math.floor(secs / 60) + "m ago";
  if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
  if (secs < 604800) return Math.floor(secs / 86400) + "d ago";
  return date.toDateString();
}

export {
  prettyDate
}