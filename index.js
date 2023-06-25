get_user().catch(err => {
    console.error(err)
    window.location.replace("login.html");
});


var last_known_game
get_last_game().then(last_game => {
    update_page(last_game)
    last_known_game = last_game
}).catch(err => { console.error(err) });

function prettyDate(date) {
    now = new Date();
    var secs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (secs < 60) return secs + "s ago";
    if (secs < 3600) return Math.floor(secs / 60) + "m ago";
    if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
    if (secs < 604800) return Math.floor(secs / 86400) + "d ago";
    return date.toDateString();
}

function update_page(game) {
    if (game.game.url.indexOf("chess.com") > -1) {
        lichess_import_button = document.getElementById("lichess_import");
        lichess_import_button.disabled = false
    }

    title = document.getElementById("title");
    title.href = game.game.url
    white = game.game.players.white
    black = game.game.players.black
    game_ended = new Date(game.game.game_ended)
    title.innerHTML = `${prettyDate(game_ended)}: ${white.username} (${white.rating}) vs ${black.username} (${black.rating})`
    recreate_board(game);
}

function recreate_board(game) {
    var board = Chessboard2("chessboard", game.FEN);
    if (!game.game.viewer) {
        board.flip()
    }
    board.addArrow({
        color: 'red',
        start: game.MovePlayed.substring(0, 2),
        end: game.MovePlayed.substring(2),
        opacity: 0.35
    })
    for (move of game.ExpectedMoves) {
        board.addArrow({
            color: 'green',
            start: move.substring(0, 2),
            end: move.substring(2),
            opacity: 0.35
        })
    }
};

async function get_last_game() {
    token = get_token()
    let response = await fetch(`${lambda_url}/games/opening`, {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
    })
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json()
}

$('#lichess_import').value = "asd"
$('#lichess_import').on('click', function () {
    import_game(last_known_game).then(url => {
        window.open(url);
    }).catch(err => {
        log.error(err);
    })
    return false;
});

async function import_game(game) {

    let response = await fetch(`${lambda_url}/games/import`, {
        method: "POST",
        headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
            "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: game.game.pgn
    })

    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.text()
}
