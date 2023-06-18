var lambda_url = "https://z78mv32t5l.execute-api.eu-central-1.amazonaws.com/Prod";
last_game = get_last_game();

function prettyDate(date) {
    now = new Date();
    var secs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (secs < 60) return secs + "s ago";
    if (secs < 3600) return Math.floor(secs / 60) + "m ago";
    if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
    if (secs < 604800) return Math.floor(secs / 86400) + "d ago";
    return date.toDateString();
}

if (last_game.game.url.indexOf("lichess.org") > -1) {
    lichess_import_button = document.getElementById("lichess_import");
    lichess_import_button.disabled = true
}

title = document.getElementById("title");
title.href = last_game.game.url
white = last_game.game.players.white
black = last_game.game.players.black
game_ended = new Date(last_game.game.game_ended)
title.innerHTML = `${prettyDate(game_ended)}: ${white.username} (${white.rating}) vs ${black.username} (${black.rating})`
function recreate_board() {
    var board = Chessboard2("chessboard", last_game.FEN);
    if (!last_game.game.viewer) {
        board.flip()
    }
    board.addArrow({
        color: 'red',
        start: last_game.MovePlayed.substring(0, 2),
        end: last_game.MovePlayed.substring(2),
        opacity: 0.35
    })
    for (move of last_game.ExpectedMoves) {
        board.addArrow({
            color: 'green',
            start: move.substring(0, 2),
            end: move.substring(2),
            opacity: 0.35
        })
    }
};
recreate_board();

function get_last_game() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `${lambda_url}/opening`, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

// function refresh() {
//     recreate_board();
//     notify();
// }

// function check_last_game() {
//     lg = get_last_game();
//     if (lg.FEN != last_game.FEN) {
//         last_game = lg;
//         refresh();
//     }
//     setTimeout(check_last_game, 30000);
// }
// setTimeout(check_last_game, 0);

function import_last_game() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            window.open(xhr.responseText);
        }
        else {
            console.log(xhr.responseText)
        }
    }
    xhr.open('post', `${lambda_url}/import`, false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(last_game.game.pgn);
}

// Notification.requestPermission().then((result) => {
//     console.log(result);
// });

// function notify() {
//     const text = `HEY! Check your last game.`;
//     const notification = new Notification("To do list", { body: text });
// }
