function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


$('#login-form').submit(function () {
    getToken($('#login-form').serialize())
        .then((token) => {
            setCookie("token", JSON.stringify(token), 180)
            window.location.replace("")
        })
        .catch(err => { console.error({ message: "failed to login", error: err.message }) })
    return false;
});

async function getToken(body) {
    var token
    let response = await fetch(`${lambda_url}/token`, {
        method: "POST",
        mode: "cors",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
    })
    if (!response.ok) {
        throw new Error(await response.text());
    }
    token = await response.json()
    return token
}
