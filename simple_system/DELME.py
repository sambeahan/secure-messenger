from flask import *
app = Flask(__name__)

@app.route('/')
def index():
    return "hello"

@app.route('/users')
def users_get():
    data = {'a':'hello'}
    return jsonify(data)

app.run(debug=True)