from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

names = ["ronaldo","dimaria","xabi alonso","neymar","sergio ramos","rooney","ibrahimovic",
    "messi","mbappe","haaland","modric","benzema","salah","kevin de bruyne","lewandowski",
    "griezmann","hakimi","courtois","kane","rashford","pedri","gavi","vinicius jr",
    "odegaard","casemiro","alisson","ter stegen","suarez","busquets","kroos","fernandes",
    "son heung-min","bellingham","valverde","martinez","gundogan","mount","foden"]
hints = [
    ["its a football player who is close to score 1000 goals","played in spain","played with benzema"],
    ["won the world cup","played with ronaldo","played with messi"],
    ["coached by jose marinio","played for bayern","played with ronaldo","he is a coach himself"],
    ["barcelona player","won champions league","played in champions league"],
    ["played with xavi and iniesta","played with neymar","played with david beckham","played with ronaldo","he is a defender"],
    ["won champions league","played in man united","an attacking player","played with van nistelrooy","man united all time top goal scorer"],
    ["played in both rival clubs of italy","player of sweden","also played with messi","played in man united"],
    ["won world cup","played all career in barcelona","argentina player","7 time ballon d'or winner"],
    ["won world cup","played in psg","fastest footballer","france national team player"],
    ["norway player","plays for man city","strong and fast striker","known for scoring hat-tricks"],
    ["croatia captain","won ballon d'or 2018","plays for real madrid","midfielder"],
    ["played with ronaldo and zidane","played in real madrid","french striker","won ballon d'or"],
    ["played in chelsea and liverpool","egypt player","fast winger","left-footed"],
    ["plays for man city","belgium player","excellent passer","midfielder"],
    ["poland striker","played for bayern and barcelona","goal machine","won fifa best award"],
    ["france player","played for atletico madrid and barcelona","won world cup","creative forward"],
    ["moroccan player","played for psg","defender","very fast right-back"],
    ["goalkeeper of belgium","played in real madrid","won ucl","very tall"],
    ["england striker","plays for bayern munich","captain of england","great finisher"],
    ["man united winger","english player","fast and skillful","plays under ten hag"],
    ["young spanish midfielder","plays for barcelona","very talented","won golden boy award"],
    ["barcelona player","youngest spain international","midfielder","plays with pedri"],
    ["brazilian winger","plays for real madrid","known for samba celebrations","fast dribbler"],
    ["norwegian midfielder","captain of arsenal","played for real madrid","creative player"],
    ["brazilian midfielder","played for real madrid and man united","defensive mid","won 5 ucl titles"],
    ["goalkeeper of liverpool","brazilian player","won ucl and premier league","very calm under pressure"],
    ["barcelona goalkeeper","german player","great reflexes","plays in la liga"],
    ["uruguayan striker","played with messi and neymar","played in barcelona","nicknamed el pistolero"],
    ["barcelona midfielder","played with messi","spanish player","defensive midfielder"],
    ["german midfielder","plays for real madrid","won world cup","excellent passer"],
    ["portuguese midfielder","plays for man united","excellent in penalties","creative playmaker"],
    ["south korean winger","plays for tottenham","fast and two-footed","very humble"],
    ["english midfielder","plays for real madrid","young and talented","former dortmund player"],
    ["uruguayan midfielder","plays for real madrid","box-to-box midfielder","plays with bellingham"],
    ["argentine goalkeeper","world cup winner 2022","plays for aston villa","nicknamed dibu"],
    ["german midfielder","played for man city and barcelona","won treble","very smart player"],
    ["english midfielder","played for chelsea and man united","young player","box-to-box type"],
    ["plays for man city","young english player","dribbler","plays under pep guardiola"]
]

@app.route('/')
def main_page():
    return render_template('main_html.html')

@app.route('/game')
def game_page():
    return render_template('index.html')

@app.route('/get_hint', methods=['POST'])
def get_hint():
    data = request.json
    index = int(data['index'])

    hint_no = int(data['hint_no'])
    print("hindi is generated" + hints[index][hint_no])
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
