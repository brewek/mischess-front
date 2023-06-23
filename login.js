login_form = document.getElementById("login-form")
login_form.addEventListener('submit', function () {
    username = document.getElementById("username").value
    password = document.getElementById("password").value
    token = getToken(username, password)
    console.log(username + "/" + password + " - " + token)
    return false;
});

var lambda_url = "https://z78mv32t5l.execute-api.eu-central-1.amazonaws.com/Prod";
function getToken(username, password) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", `${lambda_url}/token`, false); // false for synchronous request
    body = `username=${username}&password=${password}`
    xmlHttp.send(body);
    // TODO: do proper login, set cookie, handle in index.js
    console.log(body)
    console.log(xmlHttp.responseText)
    return JSON.parse(xmlHttp.responseText);
}