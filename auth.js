var lambda_url = "https://api.the226.pl";
// var lambda_url = "http://127.0.0.1:5000";

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function get_token() {
    auth_cookie = getCookie("token");
    if (!auth_cookie) {
        throw new Error("not logged in")
    }
    token = JSON.parse(auth_cookie)
    return token
}

async function get_user() {
    token = get_token()
    let response = await fetch(`${lambda_url}/users/me`, {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
    })
    if (!response.ok) {
        throw new Error("something went wrong while validating active user");
    }
    return response.json();
};