from logging import debug
from flask import *
import dataset
import json
import os

from werkzeug.exceptions import RequestedRangeNotSatisfiable

app = Flask(__name__)
if 'DATABASE_URL' in os.environ:
    db = dataset.connect(os.environ['DATABASE_URL'].replace('postgres:', 'postgresql:'))
else:
    db = dataset.connect('sqlite:///secure-messenger.db')


@app.route('/')
def main():
    return render_template('index.html')

@app.route('/send_username', methods=['post'])
def send_username():
    data = request.json
    # print("Data:",data)
    # print("Username:", data['username'])
    username = data['username']
    unique = db['users'].find_one(Username=username) == None
    if not unique:
        return jsonify({'success':False})
    elif unique:
        f = open("simple_system/prime.json", "r")
        primes = json.load(f)
        return jsonify({'success':True, 'primes':primes})

@app.route('/check_username', methods=['post'])
def check_username():
    data = request.json
    # print("Data:",data)
    # print("Username:", data['username'])
    username = data['username']
    user = db['users'].find_one(Username=username)
    if user == None:
        return jsonify({'success':False})
    else:
        return jsonify({'success':True, 'user_obj':user})
    
@app.route('/send_user', methods=['post'])
def send_user():
    data = request.json
    db['users'].insert({
    'Username': data['Username'],
    '#Password' : data['#Password'],
    'Public key': json.dumps(data['Public key']),
    'Profile colour' : data['Profile colour']
    })
    return jsonify({'success':True})

@app.route('/sign_up')
def sign_up():
    return render_template('signup.html')

@app.route('/messages')
def messages():
    return render_template('messages.html')

@app.route('/send_r_username', methods=['post'])
def send_r_username():
    data = request.json
    r_username = data['r_username']
    # print(r_username)
    exists = db['users'].find_one(Username=r_username) != None
    if exists:
        return jsonify({'success':True})
    else:
        return jsonify({'success':False})
    
@app.route('/messages/<s_username>/<r_username>')
def direct_messages(s_username, r_username):
    # get list of messages between sender and reciever and return them
    results1 = list(db['messages'].find(Sender=s_username, Reciever=r_username))
    results2 = list(db['messages'].find(Sender=r_username, Reciever=s_username))
    results = results1 + results2
    results.sort(key=lambda message: message['Datetime'])
    return(jsonify(results))

@app.route('/send_message', methods=['post'])
def send_message():
    data = request.json
    db['messages'].insert(data)
    return jsonify({'Success': True})

@app.route('/conversations/<username>')
def conversations(username):
    # get list of users that the user has talked to
    users = {}

    results1 = list(db['messages'].find(Sender=username))
    results1.sort(key=lambda message: message['Datetime'])  # sort a list of messages that the user has sent
    
    for message in results1:
        if message['Reciever'] not in users or users[message['Reciever']] < message['Datetime']:
            users[message['Reciever']] = message['Datetime']  # add these messages to a dictionary where key is user and value is date last sent

    results2 = list(db['messages'].find(Reciever=username))
    results2.sort(key=lambda message: message['Datetime'])  # repeat the process for messages recieved by the user
    
    for message in results2:
        if message['Sender'] not in users or users[message['Sender']] < message['Datetime']:
            users[message['Sender']] = message['Datetime']
    
    users = sorted(users, key=lambda user: users[user], reverse = True)  # sort by datetime and return

    return(jsonify(users))

@app.route('/colour/<username>')
def find_colour(username):
    user = db['users'].find_one(Username=username)
    # print(user['Profile colour'])
    if user != None:
        return(jsonify(user['Profile colour']))
    else:
        return(jsonify("blue"))

@app.route('/get_key', methods=['post'])
def get_key():
    data = request.json
    username = data['name']
    user = db['users'].find_one(Username=username)
    return(jsonify({'key': user['Public key']}))

@app.route('/welcome')
def welcome():
    return render_template('welcome.html')

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)