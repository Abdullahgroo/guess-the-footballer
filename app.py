from flask import Flask, request, jsonify, render_template

app = Flask(__name__,template_folder='templates')

names = ["ronaldo","dimaria","xabi alonso","neymar","sergio ramos","rooney"]
hints = [
    ["its a football player who is close to score 1000 goals","played in spain","played with benzema"],
    ["won the world cup","played with ronaldo","played with messi"],
    ["coached by jose marinio","played for bayern","played with ronaldo","he is a coach himself"],
    ["barcelona player","won champions league","played in champions league"],
    ["played with xavi and iniesta","played with neymar","played with david beckham","played with ronaldo","he is a defender"],
    ["won champions league","played in man united","an attacking player","played with van nistelrooy","man united all time top goal scorer"]
]

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/get_hint', methods=['POST'])
def get_hint():
    data = request.json
    index = int(data['index'])
    hint_no = int(data['hint_no'])
    return jsonify({"hint": hints[index][hint_no]})

@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    index = int(data['index'])
    guess = data['guess'].lower()
    if guess == names[index]:
        return jsonify({"result": "You guessed it! WON"})
    else:
        return jsonify({"result": "No, wrong answer"})

if __name__ == "__main__":
    app.run(debug=True)
