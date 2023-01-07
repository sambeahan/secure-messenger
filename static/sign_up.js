// var firebaseConfig = {
//     apiKey: "AIzaSyAHINsdqgeZ7YAj-Fq-YzNF5xiN6V6KpTY",
//     authDomain: "messenger-e2f98.firebaseapp.com",
//     projectId: "messenger-e2f98",
//     storageBucket: "messenger-e2f98.appspot.com",
//     messagingSenderId: "409588942081",
//     appId: "1:409588942081:web:36a317d03c3f0d29e74700",
//     measurementId: "G-XQY8LGQT10"
//   };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);
//   firebase.analytics();
//   var db = firebase.firestore();

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

// the greatest common denominator using Euclinean Algorithm
function gcd(a, b) {
  while (b != 0) {
    t = b
    b = a % b
    a = t
  }
  return a
}

function generateKeys(primes) { // adapted from https://www.youtube.com/watch?v=oOcTVTpUsPQ&t=615s
  var p_index = Math.floor(Math.random() * primes.length);
  p = primes[p_index]
  q = p
  while (q == p) {
    var q_index = Math.floor(Math.random() * primes.length);
    q = primes[q_index]
  } // choose 2 unique primes from the provided list of prime numbers from 2 to 100

  var n = q * p
  phi = (q - 1) * (p - 1) // these values are required in the generation of the keys

  var e_candidates = []
  for (let i = 2; i < phi; i++) {
    if (gcd(i, phi) == 1 && gcd(i, n) == 1) {
      e_candidates.push(i)
    }
  } // generate a list of candidates for the public key using the formula
  var e_index = Math.floor(Math.random() * e_candidates.length); // choose a random option from these candidates
  e = e_candidates[e_index]
  public_key = [e, n]

  d_candidates = []
  i = 2
  while (d_candidates.length < 5) { // generate list of candidates for private key
    d_cand_mod = (i * phi + 1) % e  // using formula from https://simple.wikipedia.org/wiki/RSA_algorithm#Generating_keys
    if (d_cand_mod == 0) {
      d_candidates.push(Math.floor((i * phi + 1) / e)) // if the formula results in a factor of e, add the integer of the result to list
    }
    i = i + 1
  }
  if (e in d_candidates) {
    d_candidates.remove(e) // remove e from list
  }
  var d_index = Math.floor(Math.random() * d_candidates.length); // choose candidate for d
  d = d_candidates[d_index]
  private_key = [d, n]
  
  keys = {
    'Public key': public_key,
    'Private key': private_key
  }
  return keys
}

function createUser() {
  // console.log('👀👀✔✔')
  var username = document.getElementById('username');
  postData('/send_username', { 'username': username.value })
    .then(res => {
      console.log(res); // JSON data parsed by `data.json()` call
      if (res.success == false) {
        document.getElementById('msg').innerText = 'That username is taken';
      }
      else if (res.success == true) {
        var pwdObj1 = document.getElementById('password1');
        var hashObj1 = new jsSHA("SHA-512", "TEXT", { numRounds: 1 }); // encode the password with SHA-512
        hashObj1.update(pwdObj1.value);
        var hash1 = hashObj1.getHash("HEX");

        var pwdObj2 = document.getElementById('password2');
        var hashObj2 = new jsSHA("SHA-512", "TEXT", { numRounds: 1 }); // encode the password with SHA-512
        hashObj2.update(pwdObj2.value);
        var hash2 = hashObj2.getHash("HEX");

        if (hash1 != hash2) { // check if the passwords do not match
          document.getElementById('msg').innerText = 'Passwords do not match';
        }
        else {
          keys = generateKeys(res['primes']);

          // code from https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/ 
          const rbs = document.querySelectorAll('input[name="profile_colour"]');
          let selectedValue;
          for (const rb of rbs) {
              if (rb.checked) {
                  selectedValue = rb.value;
                  break;
              }
          }
          debugger;
          profile_colour = selectedValue;
          
          
          var userObj = {
            'Username': username.value,
            '#Password': hash1,
            'Public key': keys['Public key'], 
            'Profile colour': selectedValue
          }
          postData('/send_user', userObj)
            .then(res2 => {
              console.log(res2); // JSON data parsed by `data.json()` call
              debugger;
              if (res2.success == true) {
                localStorage['isLoggedIn'] = true;
                localStorage['Private key'] = keys['Private key'];
                localStorage['Username'] = username.value;
                localStorage['Profile colour'] = selectedValue;
                window.location.replace("/welcome");
              }
            });
        }


      }
    });


}

user_submit.onclick = createUser;