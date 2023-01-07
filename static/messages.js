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
  plaintext = msg.split(""); // separate the message letter by letter
  ciphertext = []
  key = JSON.parse(key)
  for (const index in plaintext) {
    char_n = plaintext[index].charCodeAt(0)  // convert the letter into its ASCII-128 character number
    ct_n = (BigInt(char_n) ** BigInt(key[0])) % BigInt(key[1]) // use this formula to encrypt each letter of the message using the provided key
    ct_n = Number(ct_n)
    ciphertext.push(ct_n)
  }
  return ciphertext
}

function decrypt(cipher, key) {
  cipher = JSON.parse(cipher)
  key = JSON.parse("[" + key + "]")
  plaintext = []
  for (const c_num of cipher) {
    pt_n = (BigInt(c_num) ** BigInt(key[0])) % BigInt(key[1]) // use formula to obtain decrypted integer
    pt_n = Number(pt_n)
    pt_n %= 128  // make this integer within the range of possible ASCII 128 characters
    pt = String.fromCharCode(pt_n)  // convert it to its ASCII equivalent
    plaintext.push(pt)
  }
  return plaintext.join('')
}

async function find_user() {
  var r_username = document.getElementById('r_username');
  localStorage['Recipient'] = r_username.value;
  r_username.value = '';
  postData('/send_r_username', { 'r_username': localStorage['Recipient'] })
    .then(async res => {
      //console.log(res); // JSON data parsed by `data.json()` call
      if (res.success == false) {
        document.getElementById('msg').innerText = 'That user does not exist';
        setTimeout(function() { clear_message(); }, 5000);
      }
      else if (res.success == true) {
        document.getElementById('msg').innerText = '';
        get_messages()
        state = 'm'
        update_div()
      }
    });
}

async function send_message() {
  message_text = document.getElementById('message').value;
  if (message_text != '') {
    postData('/get_key', { 'name': localStorage['Recipient'] })
      .then(async res => {
        // console.log(res['key'])
        encrypted_message = encrypt(message_text, res['key'])
        current_time = new Date()
        message = {
          'Sender': localStorage['Username'],
          'Reciever': localStorage['Recipient'],
          'Message': JSON.stringify(encrypted_message),
          'Datetime': current_time.toISOString()
        }
        //console.log(message)
        postData('/send_message', message)
          .then(async res => {
            document.getElementById('message').value = '';
            get_messages();
            message_box.scrollTop = message_box.scrollHeight; // scroll chat box to bottom
          });
      });


  }

}

async function get_messages() {
  document.getElementById('recipient').innerText = localStorage['Recipient'] // display the recipient's name on the page
  var messages = await fetch(`/messages/${localStorage['Username']}/${localStorage['Recipient']}`)
  var message_list = await messages.json() // get the list of messages between the users from server
  
  document.getElementById('message_box').innerHTML = '';
  for (const msg of message_list) {
    //console.log(msg)
    var message = document.createElement('div');
    
    if (d_messages[msg['Message']]) { // if a message is in the list of decrypted messages, display the decrypted version
      message.innerText = d_messages[msg['Message']];
    }
    else { // otherwise display the encrypted version
      message.innerText = msg['Message']
    }
    if (msg['Sender'] == localStorage['Recipient']) {
      message.classList.add('message_left');
      var dc_button = document.createElement('button')
      dc_button.innerText = 'Decrypt'
      dc_button.onclick = function () {
        d_messages = {}
        d_messages[msg['Message']] = decrypt(msg['Message'], localStorage['Private key'])
        // if the message is to the user, display it on the left side of the screen and include a button to decrypt
      }
      message.appendChild(dc_button)
    }
    else if (msg['Sender'] == localStorage['Username']) {
      message.classList.add('message_right');
    } // if it is from the sender display the message on the right

    document.getElementById('message_box').appendChild(message)
    
    
  }
  current_len = message_list.length
  console.log(current_len, old_len)
  if (current_len != old_len) {
    message_box.scrollTop = message_box.scrollHeight; // if there is a new message scroll chat box to bottom
  }
  old_len = current_len
}

async function get_conversations() {
  var conversations = await fetch(`/conversations/${localStorage['Username']}`)
  var conversations_list = await conversations.json() // get list of users that user has talked to
  //console.log(conversations_list.length)
  convo_list = document.createElement('div');


  for (const conv of conversations_list) {
    //console.log(conv)
    var conversation = document.createElement('div');
    var o_colour = await fetch(`/colour/${conv}`)
    other_colour = await o_colour.json()
    // console.log(other_colour);
    var colour = document.createElement('div');
    colour.classList.add('colours')
    colour.classList.add('med_round')
    colour.classList.add(other_colour)
    conversation.appendChild(colour)


    person_name = document.createElement('p');
    person_name.classList.add('name_text')
    person_name.innerText = conv;
    conversation.appendChild(person_name);
    conversation.classList.add('conv')
    conversation.onclick = function () {
      localStorage['Recipient'] = conv
      get_messages();
      state = 'm'
      update_div()
    }
    convo_list.appendChild(conversation)
  }
  document.getElementById('users_box').innerHTML = ''
  document.getElementById('users_box').appendChild(convo_list)
  setTimeout(get_conversations, 1)

}

function update_div() {
  if (state == 'c') {
    document.getElementById('list').style.display = "block";
    document.getElementById('dm').style.display = "none";
  }
  else if (state == 'm') {
    document.getElementById('list').style.display = "none";
    document.getElementById('dm').style.display = "block";
    message_box.scrollTop = message_box.scrollHeight; // scroll chat box to bottom
  }
}

function back() {
  state = 'c'
  update_div()
}

async function r_colour() {
  var r_colour = await fetch(`/colour/${localStorage['Recipient']}`)
  rec_colour = await r_colour.json()
  document.getElementById('reciever colour').className = '';
  document.getElementById('reciever colour').classList.add('colours')
  document.getElementById('reciever colour').classList.add('med_round')
  document.getElementById('reciever colour').classList.add(rec_colour)
}

function clear_message() {
  document.getElementById('msg').innerText = '';
}

old_len = 0
state = 'c';
update_div()
var d_messages = {}

send.onclick = send_message;
find_user_button.onclick = find_user;
document.getElementById('back').onclick = back

var input1 = document.getElementById("r_username");
input1.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('find_user_button').click();
    console.log('enter clicked')
  }
}); // when the enter key is pressed, simulate the 'find user' button being clicked

var input2 = document.getElementById("message");
input2.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('send').click();
    console.log('enter clicked')
  }
}); // when the enter key is pressed simulate the 'encrypt and send' key



setInterval(get_messages, 1000);
get_conversations();
setInterval(r_colour, 1000);

