import { useEffect, useState } from "react";
import FootballTicTacToe from "./FootballTicTacToe";
import { FootballMultipleChoice, FootballQuickfire } from "./FootballChallenges";
import FootballExpandedGames from "./FootballExpandedGames";

import "./App.css";

const ROUND_SECONDS = 60;
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function App() {
  const [choice, setChoice] = useState("");
  const [hintNo, setHintNo] = useState(0);
  const [hints, setHints] = useState([]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [streak, setStreak] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [gameMode, setGameMode] = useState("manual");
  const [difficulty, setDifficulty] = useState("medium");
  const [challengeDate, setChallengeDate] = useState("");
  const [activeGame, setActiveGame] = useState("classic");

  useEffect(() => {
    fetch(`${API_URL}/game_info`)
      .then((response) => response.json())
      .then((data) => setPlayerCount(Number(data.player_count) || 0))
      .catch(() => setResult("Could not connect to the game server."));
  }, []);

  useEffect(() => {
    if (!roundStarted || roundComplete || timeLeft <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStarted, roundComplete, timeLeft]);

  useEffect(() => {
    if (roundStarted && timeLeft === 0) {
      const timeout = setTimeout(() => {
        setRoundComplete(true);
        setRoundStarted(false);
        setResult("Time is up. Start again to play this number.");
      }, 0);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [roundStarted, timeLeft]);

  const resetHints = () => {
    setHints([]);
    setHintNo(0);
  };

  const beginRound = (selectedNumber, date = "") => {
    setChoice(String(selectedNumber));
    resetHints();
    setGuess("");
    setResult("");
    setRoundComplete(false);
    setRoundStarted(true);
    setTimeLeft(ROUND_SECONDS);
    setChallengeDate(date);
  };

  const startGame = async () => {
    setChallengeDate("");
    if (gameMode === "manual") {
      const selectedNumber = Number(choice);
      if (!Number.isInteger(selectedNumber) || selectedNumber < 1 || selectedNumber > playerCount) {
        setResult(`Choose a player number from 1 to ${playerCount || "the available players"}.`);
        return;
      }

      beginRound(selectedNumber);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/start_round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: gameMode, difficulty }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResult(data.error || "Unable to start a new round.");
        return;
      }

      beginRound(data.index + 1, data.challenge_date || "");
    } catch {
      setResult("Could not connect to the game server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (value) => {
    setChoice(value);
  };

  const getHint = async () => {
    const selectedNumber = Number(choice);
    if (!Number.isInteger(selectedNumber) || selectedNumber < 1 || selectedNumber > playerCount) {
      setResult(`Choose a player number from 1 to ${playerCount || "the available players"}, then click Start.`);
      return;
    }
    if (!roundStarted) {
      setResult("Click Start before requesting a hint.");
      return;
    }
    if (roundComplete) {
      setResult("This round is complete. Choose another number and click Start.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/get_hint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({ index: selectedNumber - 1, hint_no: hintNo, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(data.error || "Unable to load a hint.");
        return;
      }

      setHints((prev) => [...prev, data.hint]);
      setHintNo((prev) => prev + 1);
      if (!data.has_more) {
        setResult("That was the last hint. Submit your answer.");
      }
    } catch {
      setResult("Could not connect to the game server.");
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    const selectedNumber = Number(choice);
    if (!Number.isInteger(selectedNumber) || selectedNumber < 1 || selectedNumber > playerCount) {
      setResult(`Choose a player number from 1 to ${playerCount || "the available players"}, then click Start.`);
      return;
    }
    if (!roundStarted) {
      setResult("Click Start before submitting an answer.");
      return;
    }
    if (!guess.trim()) {
      setResult("Enter a guess before submitting.");
      return;
    }
    if (roundComplete) {
      setResult("This round is complete. Choose another number and click Start.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/check_answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({ index: selectedNumber - 1, guess }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(data.error || "Unable to check the answer.");
        return;
      }

      setScore((prev) => prev + Number(data.points || 0));
      setResult(`${data.result} (${data.points > 0 ? "+" : ""}${data.points})`);
      setGuess("");
      if (data.points > 0) {
        setRoundComplete(true);
        setRoundStarted(false);
        setStreak((previous) => previous + 1);
      } else {
        setStreak(0);
      }
    } catch {
      setResult("Could not connect to the game server.");
    } finally {
      setLoading(false);
    }
  };

  const skipRound = () => {
    if (!roundStarted) {
      setResult("Start a round before skipping it.");
      return;
    }

    setRoundComplete(true);
    setRoundStarted(false);
    setStreak(0);
    setResult("Round skipped. Start again to play this number.");
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Touchline home">
          <span className="brand-mark">T</span>
          <span><strong>TOUCHLINE</strong><small>FOOTBALL GAMES</small></span>
        </a>
        <div className="header-meta"><span className="live-dot" /> {playerCount || "..."} players · 12 games</div>
      </header>

      <main className="game-hub" id="top">
        <section className="hub-intro">
          <p className="eyebrow">PICK YOUR MATCHDAY</p>
          <h1>Football knowledge.<br /><em>Game on.</em></h1>
          <p className="intro-copy">Put your player knowledge to work. Play solo or challenge a friend on the same screen.</p>
        </section>

        <nav className="game-picker" aria-label="Choose a game">
          <button className={`game-pick ${activeGame === "classic" ? "is-active" : ""}`} onClick={() => setActiveGame("classic")} aria-pressed={activeGame === "classic"}>
            <span className="pick-number">01</span>
            <span className="pick-copy"><strong>Guess the footballer</strong><small>Clues, guesses, and a ticking clock.</small></span>
            <span className="pick-arrow" aria-hidden="true">→</span>
          </button>
          <button className={`game-pick ${activeGame === "tictactoe" ? "is-active" : ""}`} onClick={() => setActiveGame("tictactoe")} aria-pressed={activeGame === "tictactoe"}>
            <span className="pick-number">02</span>
            <span className="pick-copy"><strong>Football tic-tac-toe</strong><small>Guess right to claim a square. Two-player.</small></span>
            <span className="pick-arrow" aria-hidden="true">→</span>
          </button>
          <button className={`game-pick ${activeGame === "multiple" ? "is-active" : ""}`} onClick={() => setActiveGame("multiple")} aria-pressed={activeGame === "multiple"}>
            <span className="pick-number">03</span>
            <span className="pick-copy"><strong>Four-choice face-off</strong><small>Use the clues, then pick the right player.</small></span>
            <span className="pick-arrow" aria-hidden="true">→</span>
          </button>
          <button className={`game-pick ${activeGame === "quickfire" ? "is-active" : ""}`} onClick={() => setActiveGame("quickfire")} aria-pressed={activeGame === "quickfire"}>
            <span className="pick-number">04</span>
            <span className="pick-copy"><strong>60-second quickfire</strong><small>Stack points and keep your streak alive.</small></span>
            <span className="pick-arrow" aria-hidden="true">→</span>
          </button>
          <button className={`game-pick ${activeGame === "lab" ? "is-active" : ""}`} onClick={() => setActiveGame("lab")} aria-pressed={activeGame === "lab"}>
            <span className="pick-number">05</span>
            <span className="pick-copy"><strong>Football Lab</strong><small>Eight more ways to test your football brain.</small></span>
            <span className="pick-arrow" aria-hidden="true">→</span>
          </button>
        </nav>

        {activeGame === "classic" ? (
          <section className="game-panel classic-panel" aria-label="Guess the footballer game">
            <div className="panel-heading">
              <div><p className="eyebrow">SOLO CHALLENGE</p><h2>Guess the footballer</h2></div>
              <div className="score-chip"><span>YOUR SCORE</span><strong>{score}</strong></div>
            </div>
            <div className="mode-controls">
              <label>Game mode
                <select value={gameMode} onChange={(event) => setGameMode(event.target.value)} disabled={roundStarted}>
                  <option value="manual">Choose player</option>
                  <option value="random">Random player</option>
                  <option value="daily">Daily challenge</option>
                </select>
              </label>
              <label>Difficulty
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={roundStarted}>
                  <option value="easy">Easy · up to 4 hints</option>
                  <option value="medium">Medium · up to 3 hints</option>
                  <option value="hard">Hard · up to 2 hints</option>
                </select>
              </label>
            </div>
            {gameMode === "manual" && <p className="selection-prompt">Choose a player number from 1 to {playerCount || "..."}</p>}
            {gameMode === "daily" && challengeDate && <p className="daily-date">Daily challenge · {challengeDate} UTC</p>}
            <div className="game-stats" aria-live="polite">
              <span><small>TIME</small><strong>{timeLeft}<i>s</i></strong></span>
              <span><small>STREAK</small><strong>{streak}</strong></span>
            </div>
            <div className="controls-row">
              {gameMode === "manual" ? (
                <input className="footballer-index" type="number" min="1" max={playerCount || undefined} placeholder="Player number" value={choice} onChange={(e) => handleChoiceChange(e.target.value)} disabled={roundStarted} />
              ) : (
                <p className="selected-mode">{gameMode === "daily" ? "Today’s shared player" : "A random player will be selected"}</p>
              )}
              <button className="primary-btn" onClick={startGame} disabled={loading || roundStarted}>{loading ? "Starting..." : "Start round"}</button>
            </div>
            <div className="action-row">
              <button className="secondary-btn" onClick={getHint} disabled={loading || !roundStarted || roundComplete}>{loading ? "Loading..." : "Get hint"}</button>
              <button className="skip-btn" onClick={skipRound} disabled={loading || !roundStarted}>Skip round</button>
            </div>
            <div className="hints-wrap">
              {hints.map((hint, index) => <p className="hint-line" key={`${index}-${hint}`}><span>{String(index + 1).padStart(2, "0")}</span>{hint}</p>)}
              {!hints.length && <p className="empty-hints">Start a round, then reveal clues one at a time.</p>}
            </div>
            <div className="answer-row">
              <input className="your-answer" type="text" placeholder="Type a player's name" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") checkAnswer(); }} />
              <button className="submit-answer-btn" onClick={checkAnswer} disabled={loading || roundComplete || !roundStarted}>Submit guess</button>
            </div>
            {result && <p className="result-message" role="status">{result}</p>}
          </section>
        ) : activeGame === "tictactoe" ? (
          <FootballTicTacToe apiUrl={API_URL} playerCount={playerCount} />
        ) : activeGame === "multiple" ? (
          <FootballMultipleChoice apiUrl={API_URL} />
        ) : activeGame === "quickfire" ? (
          <FootballQuickfire apiUrl={API_URL} />
        ) : (
          <FootballExpandedGames />
        )}
      </main>
      <footer className="site-footer"><span>TOUCHLINE / EST. FOR FOOTBALL FANS</span><span>Know the game. Claim the grid.</span></footer>
    </div>
  );
}

export default App;