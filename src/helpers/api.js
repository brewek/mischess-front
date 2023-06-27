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

async function getOpening(token) {
  return fetch(`${API_URL}/users/me/games/opening`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  });
}

export {
  signIn,
  signUp,
  getUser,
  getOpening
}