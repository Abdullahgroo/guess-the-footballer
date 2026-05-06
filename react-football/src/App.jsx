import { useState } from "react";

import './App.css';


function App() {
  const [choice, setChoice] = useState("");
  const [hintNo, setHintNo] = useState(0);
  const [hints, setHints] = useState([]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  const startGame = () => {
    setHints([]);
    setHintNo(0);
    setResult("");
  };

  const getHint = async () => {
    const res = await fetch("http://127.0.0.1:5000/get_hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index: choice, hint_no: hintNo }),
    });

    const data = await res.json();
    setHints([...hints, data.hint]);
    setHintNo(hintNo + 1);
  };

  const checkAnswer = async () => {
    const res = await fetch("http://127.0.0.1:5000/check_answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index: choice, guess: guess }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div style={{ textAlign: "center" }}>
      

      <h1 style={{fontSize: "50px"}}>⚽ Guess the Football Player ⚽</h1>
      <div>
        <p>write answer +3,wrong answer -1 </p>
        <p className="your_score_box">Your Score:- <p className="your_score">-5</p></p>
        </div>
      <input
        className="footballer_index"
        type="number"
        placeholder="0 - 37"
        onChange={(e) => setChoice(e.target.value)}
      />
      <button className="start_btn" onClick={startGame}>Start</button>

      <div>
        <button  className="get_hint_btn" onClick={getHint}>Get Hint</button>

        {hints.map((h, i) => (
          <p className="hints" key={i}>{i+1}:- {h}</p>
        ))}

        <input
          className="your_answer"
          type="text"
          placeholder="Enter player name"
          onChange={(e) => setGuess(e.target.value)}
        />
        <button className="submit_answer_btn" onClick={checkAnswer}>SUBMIT</button>

        <p>{result}</p>
      </div>
    </div>
  );
}

export default App;