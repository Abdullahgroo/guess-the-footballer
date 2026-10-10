from datetime import datetime, timezone
import hashlib
import secrets

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

names = ["ronaldo","dimaria","xabi alonso","neymar","sergio ramos","rooney","ibrahimovic",
    "messi","mbappe","haaland","modric","benzema","salah","kevin de bruyne","lewandowski",
    "griezmann","hakimi","courtois","kane","rashford","pedri","gavi","vinicius jr",
    "odegaard","casemiro","alisson","ter stegen","suarez","busquets","kroos","fernandes",
    "son heung-min","bellingham","valverde","martinez","gundogan","mount","foden",
    "saka", "gakpo", "isak", "caicedo", "ben white", "neves", "frenkie de jong",
    "tielemans", "oblak", "osimhen", "kvaratskhelia", "rafael leao",
    "theo hernandez", "raphinha"]
hints = [
    ["its a football player","played in spain","played with benzema"],
    ["won the world cup","played with ronaldo","played with messi"],
    ["coached by jose marinio","played for bayern","played with ronaldo","he is a coach himself"],
    ["barcelona player","won champions league","played in psg","played with ramos"],
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
    ["plays for man city","young english player","dribbler","plays under pep guardiola"],
    ["english winger", "plays for arsenal", "won premier league 2022\u201323",
     "won fa cup 2020", "arsenal player of the season 2020\u201321 and 2021\u201322",
     "played in euro 2020 and euro 2024 finals", "member of england squads at 2022 and 2026 world cups",
     "second youngest arsenal player to 50 premier league appearances"],

    # Cody Gakpo (Netherlands / Liverpool)
    ["dutch forward", "plays for liverpool", "netherlands international", 
     "won premier league 2024\u201325", "won eredivisie 2017\u201318 (psv)",
     "scored five world cup goals for netherlands (2022 & 2026)", "dutch footballer of the year 2021\u201322",
     "shared uefa euro 2024 golden boot"],

    # Alexander Isak (Sweden / Liverpool)
    ["swedish striker", "plays for liverpool", "sweden international", 
     "joined liverpool 2025 for £125m (british record)", "youngest goalscorer in swedish national team history",
     "played at euro 2020 and 2026 world cups", "won copa del rey 2020 with real sociedad",
     "won efl cup 2024\u201325 with newcastle"],

    # Moisés Caicedo (Ecuador / Chelsea)
    ["ecuadorian midfielder", "plays for chelsea", "captains ecuador national team",
     "joined chelsea in 2023 for £100m", "won europa conference league 2024\u201325",
     "top defensive midfielder (praise)", "played in 2 copa americas and 2 world cups",
     "over 60 caps for ecuador"],

    # Ben White (England / Arsenal)
    ["english defender", "plays for arsenal", "operates at center-back or right-back",
     "signed for arsenal 2021 for up to £50m (club record)", "won championship with leeds (2019\u201320)",
     "england international (Euro 2020 runner-up, WC 2022)", "started career at brighton",
     "part of england squad Euro 2020 (runner-up)"],

    # Rúben Neves (Portugal / Al-Hilal)
    ["portuguese defensive midfielder", "plays for al-hilal (saudi arabia)", "former wolves captain",
     "won championship 2018 with wolves", "transferred to al-hilal in 2023 for £47m",
     "played in euros 2020 & 2024 and world cups 2022 & 2026", "uefa nations league winner 2019 & 2025",
     "over 60 caps for portugal"],

    # Frenkie de Jong (Netherlands / Barcelona)
    ["dutch midfielder", "plays for barcelona", "netherlands national team",
     "won eredivisie and knvb cup with ajax (2019)", "transferred to barcelona for €75m in 2019",
     "uefa nations league runner-up 2019", "played at euro 2020, world cup 2022 & 2026",
     "fifa fifpro world11 in 2019"],

    # Youri Tielemans (Belgium / Manchester United)
    ["belgian midfielder", "plays for manchester united", "captains the belgium national team",
     "won 2 league titles with anderlecht", "scored winning goal in 2021 fa cup final (leicester)",
     "won uefa europa league 2025\u201326 with aston villa", "youngest belarus (sic) to play in champions league (age 16)",
     "part of belgium squads at 2018, 2022, 2026 WCs and euro 2020, 2024"],

    # Jan Oblak (Slovenia / Atlético Madrid)
    ["slovenian goalkeeper", "plays for atlético madrid", "captains the slovenia national team",
     "won la liga 2020\u201321", "won uefa europa league 2017\u201318", "won uefa super cup 2018",
     "la liga zamora trophy (best keeper) multiple times", "slovenian footballer of the year (multiple wins)"],

    # Victor Osimhen (Nigeria / Galatasaray)
    ["nigerian striker", "plays for galatasaray (on loan)", "nigeria international (vice-captain)",
     "joined napoli in 2020 for club-record €80m", "won serie a 2022\u201323 with napoli",
     "serie a top scorer 2022\u201323 (26 goals)", "won serie a best young player 2021\u201322",
     "2015 u17 world cup top scorer & champion"],

    # Khvicha Kvaratskhelia (Georgia / PSG)
    ["georgian left winger", "plays for paris saint-germain", "captains georgia national team",
     "won serie a 2022\u201323 with napoli", "serie a mvp 2022\u201323", "champions league young player 2023",
     "joined psg in 2025 for €70m", "continental treble with psg 2024\u201325 (CL, Ligue 1, Cup)"],

    # Rafael Leão (Portugal / Galatasaray)
    ["portuguese left winger", "plays for galatasaray", "portugal national team",
     "won serie a 2021\u201322 with milan", "serie a mvp 2021\u201322", "u17 european champion 2016 (portugal)",
     "won nations league 2024\u201325 (portugal)", "joined galatasaray in 2026"],

    # Théo Hernandez (France / Al-Hilal)
    ["french left-back", "plays for al hilal (saudi pro league)", "france national team",
     "won champions league 2017\u201318 with real madrid", "won serie a 2021\u201322 with ac milan",
     "played in wc 2022 final, euro 2024 and wc 2026", "won 2020\u201321 nations league with france",
     "brother of lucas hernandez"],

    # Raphinha (Brazil / Barcelona)
    ["brazilian winger", "plays for barcelona (captain)", "brazil national team",
     "won treble 2024\u201325 (la liga, copa del rey, supercopa)", "champions league top scorer 2025\u201326",
     "won portuguese double 2019 (sporting: taça de portugal & taça da liga)", "played for leeds and sporting",
     "part of brazil squads for 2022 wc and 2026 wc"]
]

PLAYER_COUNT = len(names)

PLAYER_ALIASES = {
    "ronaldo": ["cristiano ronaldo", "cr7"],
    "dimaria": ["di maria", "angel di maria", "angel maria"],
    "xabi alonso": ["xabi", "xabi alonso"],
    "neymar": ["neymar jr", "neymar junior"],
    "sergio ramos": ["ramos"],
    "rooney": ["wayne rooney"],
    "ibrahimovic": ["zlatan ibrahimovic", "zlatan"],
    "messi": ["lionel messi"],
    "mbappe": ["kylian mbappe", "kylian mbappe lottin"],
    "haaland": ["erling haaland"],
    "modric": ["luka modric"],
    "benzema": ["karim benzema"],
    "salah": [" mo salah", "mohamed salah"],
    "kevin de bruyne": ["kevin debruyne", "kdb"],
    "lewandowski": ["robert lewandowski"],
    "griezmann": ["antoine griezmann"],
    "hakimi": ["achraf hakimi"],
    "courtois": ["thibaut courtois"],
    "kane": ["harry kane"],
    "rashford": ["marcus rashford"],
    "pedri": ["pedro gonzalez", "pedri gonzalez"],
    "gavi": ["pablo gavi"],
    "vinicius jr": ["vinicius junior", "vinicius"],
    "odegaard": ["martin odegaard"],
    "casemiro": ["carlos casemiro"],
    "alisson": ["alisson becker"],
    "ter stegen": ["marc andre ter stegen", "terstegen"],
    "suarez": ["luis suarez"],
    "busquets": ["sergio busquets"],
    "kroos": ["toni kroos"],
    "fernandes": ["bruno fernandes"],
    "son heung-min": ["son", "heung min", "son heung min"],
    "bellingham": ["jude bellingham"],
    "valverde": ["federico valverde"],
    "martinez": ["lautaro martinez"],
    "gundogan": ["ilkay gundogan"],
    "mount": ["mason mount"],
    "foden": ["phil foden"],
     "saka": ["bukayo saka"], 
    "gakpo": ["cody gakpo"],
    "isak": ["alexander isak"],
    "caicedo": ["moises caicedo"],
    "ben white": ["benjamin white"],
    "neves": ["ruben neves"],
    "frenkie de jong": ["frenkie de jong"],
    "tielemans": ["youri tielemans"],
    "oblak": ["jan oblak"],
    "osimhen": ["victor osimhen"],
    "kvaratskhelia": ["khvicha kvaratskhelia"],
    "rafael leao": ["rafael leão"],
    "theo hernandez": ["theo hernandez"],
    "raphinha": ["raphael dias belloli", "raphinha"],
}

PLAYER_DATA = [
    {
        "id": index + 1,
        "name": name,
        "aliases": [name, *PLAYER_ALIASES.get(name, [])],
        "hints": player_hints,
    }
    for index, (name, player_hints) in enumerate(zip(names, hints))
]


def normalize_answer(value):
    return "".join(character for character in value.casefold() if character.isalnum())


def hint_limit(index, difficulty):
    limits = {"easy": 4, "medium": 3, "hard": 2}
    return min(limits[difficulty], len(PLAYER_DATA[index]["hints"]))


def parse_player_index(data):
    try:
        index = int(data.get("index"))
    except (AttributeError, TypeError, ValueError):
        return None

    if index < 0 or index >= PLAYER_COUNT:
        return None
    return index

@app.route('/')
def main_page():
    return render_template('main_html.html')

@app.route('/game')
def game_page():
    return render_template('index.html')

@app.route('/game_info', methods=['GET'])
def game_info():
    return jsonify({"player_count": PLAYER_COUNT})

@app.route('/start_round', methods=['POST'])
def start_round():
    data = request.get_json(silent=True) or {}
    mode = str(data.get("mode", "random")).lower()
    difficulty = str(data.get("difficulty", "medium")).lower()

    if mode not in {"random", "daily", "multiple_choice"}:
        return jsonify({"error": "Mode must be random, daily, or multiple_choice"}), 400
    if difficulty not in {"easy", "medium", "hard"}:
        return jsonify({"error": "Difficulty must be easy, medium, or hard"}), 400

    today = datetime.now(timezone.utc).date().isoformat()
    if mode == "daily":
        daily_seed = int.from_bytes(hashlib.sha256(today.encode("ascii")).digest()[:8], "big")
        index = daily_seed % PLAYER_COUNT
    else:
        index = secrets.randbelow(PLAYER_COUNT)

    round_data = {
        "index": index,
        "player_count": PLAYER_COUNT,
        "mode": mode,
        "difficulty": difficulty,
        "max_hints": hint_limit(index, difficulty),
        "challenge_date": today if mode == "daily" else None,
    }
    if mode == "multiple_choice":
        distractors = secrets.SystemRandom().sample(
            [player_index for player_index in range(PLAYER_COUNT) if player_index != index],
            3,
        )
        option_indexes = [index, *distractors]
        secrets.SystemRandom().shuffle(option_indexes)
        round_data["options"] = [names[player_index] for player_index in option_indexes]
        round_data["correct_option"] = option_indexes.index(index)

    return jsonify(round_data)

@app.route('/get_hint', methods=['POST'])
def get_hint():
    data = request.get_json(silent=True) or {}
    index = parse_player_index(data)

    try:
        hint_no = int(data.get("hint_no"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid hint number"}), 400

    if index is None:
        return jsonify({"error": f"Player number must be between 1 and {PLAYER_COUNT}"}), 400
    difficulty = str(data.get("difficulty", "easy")).lower()
    if difficulty not in {"easy", "medium", "hard"}:
        return jsonify({"error": "Difficulty must be easy, medium, or hard"}), 400
    available_hints = hint_limit(index, difficulty)
    if hint_no < 0 or hint_no >= available_hints:
        return jsonify({"error": "No more hints available"}), 404

    return jsonify({"hint": hints[index][hint_no], "has_more": hint_no + 1 < available_hints})

@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.get_json(silent=True) or {}
    index = parse_player_index(data)
    guess = str(data.get("guess", "")).strip()

    if index is None:
        return jsonify({"error": f"Player number must be between 1 and {PLAYER_COUNT}"}), 400
    if not guess:
        return jsonify({"error": "A guess is required"}), 400

    accepted_answers = {normalize_answer(answer) for answer in PLAYER_DATA[index]["aliases"]}
    if normalize_answer(guess) in accepted_answers:
        return jsonify({"result": "You guessed it! WON", "points": 3})
    else:
        return jsonify({"result": "No, wrong answer", "points": -1})

if __name__ == "__main__":
    app.run(debug=True)
