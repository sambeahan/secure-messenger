// Sourced from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function encrypt(msg, key) {
  plaintext = msg.split("");
  ciphertext = []
  key = JSON.parse(key)
  for (const index in plaintext) {
    char_n = plaintext[index].charCodeAt(0)
    ct_n = (BigInt(char_n) ** BigInt(key[0])) % BigInt(key[1]) // use BigInt, then convert back to normal
    ct_n = Number(ct_n)
    //console.log(ct_n)
    ciphertext.push(ct_n)
  }
  return ciphertext
}

function decrypt(cipher, key) {
  cipher = JSON.parse(cipher)
  key = JSON.parse("[" + key + "]")
  plaintext = []
  for (const c_num of cipher) {
    pt_n = (BigInt(c_num) ** BigInt(key[0])) % BigInt(key[1])
    pt_n = Number(pt_n)
    pt_n %= 128
    pt = String.fromCharCode(pt_n)
    plaintext.push(pt)
  }
  debugger;
  return plaintext.join('')
}

async function login() {
  var u_name = document.getElementById('username').value;

  var password = document.getElementById('password').value;

  var priv_key = document.getElementById('private_key').value;

  postData('/check_username', { 'username': u_name })
    .then(res => {
      // console.log(res); // JSON data parsed by `data.json()` call
      if (res.success == false) {
        msg.innerText = 'That username does not exist'
      }
      else {
        user_obj = res.user_obj
        // console.log(user_obj)
        var hashObj1 = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
        hashObj1.update(password);
        var hash1 = hashObj1.getHash("HEX");
        // console.log(hash1)
        if (user_obj['#Password'] != hash1) {
          msg.innerText = 'Incorrect Password'
        }
        else {
          test_msg = 'hello'
          test_e = encrypt(test_msg, user_obj['Public key']) // encrypt the test message with the users public key
          test_d = decrypt('[' + test_e.toString() + ']', priv_key) // decrypt this with the entered private key
          if (test_msg != test_d) {
            msg.innerText = 'Incorrect private key' // if the decrypted message is different the private key entered is wrong
          }
          else {
            localStorage['isLoggedIn'] = true;
            localStorage['Private key'] = priv_key;
            localStorage['Username'] = u_name;
            localStorage['Profile colour'] = user_obj['Profile colour'];
            window.location.replace("/messages");
          }
        }
      }
    });
}


login_button.onclick = login;

var input = document.getElementById("private_key");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('login_button').click();
    console.log('enter clicked')
  }
}); // when the enter key is pressed attempt to log the user in 