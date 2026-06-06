const API_URL = "https://api.the226.pl";

/**
 * Makes the request to sign in and returns the response object.
 * @param {string} body.username
 * @param {string} body.password
 */
async function signIn(body) {
  if (!body.username || !body.password) {
    throw Error('Username and Password are required.')
  }

  return fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${body.username}&password=${body.password}`
  });
}

/**
 * Makes the request to sign up and returns the response object.
 * @param {string} body.username
 * @param {string} body.email
 * @param {string} body.password 
 * @param {string} body.password_verify
 */
async function signUp(body, token) {
  if (!body.username || !body.email || !body.password || !body.password_verify) {
    throw Error('Username and Password are required.')
  }

  return fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

async function getUser(token) {
  return fetch(`${API_URL}/users/me`, { 
    headers: {
      Authorization: token
    }
   });
}

async function getGames(token) {
  return fetch(`${API_URL}/users/me/games/`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  });
}

async function getOpening(token, index = -1) {
  return fetch(`${API_URL}/users/me/games/opening?index=${index}`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  });
}

async function updateUser(token, body) {
  return fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

export {
  signIn,
  signUp,
  getUser,
  getGames,
  getOpening,
  updateUser
}