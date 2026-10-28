import { useEffect, useState } from "react";
import FootballTicTacToe from "./FootballTicTacToe";
import { FootballMultipleChoice, FootballQuickfire } from "./FootballChallenges";
import FootballExpandedGames from "./FootballExpandedGames";

import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function App() {
  const [choice, setChoice] = useState("");
  const [hintNo, setHintNo] = useState(0);
  const [hints, setHints] = useState([]);
  const [hasMoreHints, setHasMoreHints] = useState(true);
  const [maxHints, setMaxHints] = useState(4);
  const [easyHintLimits, setEasyHintLimits] = useState([]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [gameMode, setGameMode] = useState("manual");
  const [difficulty, setDifficulty] = useState("easy");
  const [challengeDate, setChallengeDate] = useState("");
  const [activeGame, setActiveGame] = useState("classic");
  const displayTime = !roundStarted && !roundComplete && !result
    ? difficulty === "hard" ? 45 : 60
    : timeLeft;

  useEffect(() => {
    fetch(`${API_URL}/game_info`)
      .then((response) => response.json())
    .then((data) => {
      setPlayerCount(Number(data.player_count) || 0);
      setEasyHintLimits(Array.isArray(data.easy_hint_limits) ? data.easy_hint_limits : []);
    })
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
    setHasMoreHints(true);
  };

  const beginRound = (selectedNumber, date = "", roundMaxHints) => {
    setChoice(String(selectedNumber));
    resetHints();
    setMaxHints(roundMaxHints ?? (difficulty === "hard" ? 1 : easyHintLimits[selectedNumber - 1] || 4));
    setGuess("");
    setResult("");
    setRoundComplete(false);
    setRoundStarted(true);
    setTimeLeft(difficulty === "hard" ? 45 : 60);
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

      beginRound(data.index + 1, data.challenge_date || "", data.max_hints);
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
      setHasMoreHints(data.has_more);
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
        body: JSON.stringify({ index: selectedNumber - 1, guess, difficulty }),
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
      <div className="stadium-background" aria-hidden="true">
        <div className="stadium-pitch">
          <span className="stadium-goal stadium-goal-left" />
          <span className="stadium-goal stadium-goal-right" />
          <span className="stadium-player team-home player-one" />
          <span className="stadium-player team-away player-two" />
          <span className="stadium-player team-home player-three" />
          <span className="stadium-player team-away player-four" />
          <span className="stadium-player team-home player-five" />
          <span className="stadium-player team-away player-six" />
          <span className="stadium-player team-home player-seven" />
          <span className="stadium-player team-away player-eight" />
          <span className="stadium-player team-home player-nine" />
          <span className="stadium-player team-away player-ten" />
          <span className="stadium-ball" />
        </div>
      </div>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Touchline home">
          <span className="brand-mark">T</span>
          <span><strong>TOUCHLINE</strong><small>FOOTBALL GAMES</small></span>
        </a>
        <div className="header-meta"><span className="live-dot" /> {playerCount || "..."} players</div>
      </header>

      <main className="game-hub" id="top">
        <section className="hub-intro">
          <p className="eyebrow">MATCHDAY</p>
          <h1>Pick your game. <em>Own the pitch.</em></h1>
        </section>

        <div className="game-hub-layout">
          <nav className="game-picker" aria-label="Choose a game">
            <button className={`game-pick ${activeGame === "classic" ? "is-active" : ""}`} onClick={() => setActiveGame("classic")} aria-pressed={activeGame === "classic"}>
              <span className="pick-number">01</span>
              <span className="pick-copy"><strong>Guess the player</strong></span>
            </button>
            <button className={`game-pick ${activeGame === "tictactoe" ? "is-active" : ""}`} onClick={() => setActiveGame("tictactoe")} aria-pressed={activeGame === "tictactoe"}>
              <span className="pick-number">02</span>
              <span className="pick-copy"><strong>Tic-tac-toe</strong></span>
            </button>
            <button className={`game-pick ${activeGame === "multiple" ? "is-active" : ""}`} onClick={() => setActiveGame("multiple")} aria-pressed={activeGame === "multiple"}>
              <span className="pick-number">03</span>
              <span className="pick-copy"><strong>Face-off</strong></span>
            </button>
            <button className={`game-pick ${activeGame === "quickfire" ? "is-active" : ""}`} onClick={() => setActiveGame("quickfire")} aria-pressed={activeGame === "quickfire"}>
              <span className="pick-number">04</span>
              <span className="pick-copy"><strong>Quickfire</strong></span>
            </button>
            <button className={`game-pick ${activeGame === "lab" ? "is-active" : ""}`} onClick={() => setActiveGame("lab")} aria-pressed={activeGame === "lab"}>
              <span className="pick-number">05</span>
              <span className="pick-copy"><strong>Football Lab</strong></span>
            </button>
          </nav>

          <div className="active-game-content" key={activeGame}>
            {activeGame === "classic" ? (
          <section className="game-panel classic-panel" aria-label="Guess the footballer game">
            <div className="match-card-heading">
              <div><h2>Guess the footballer</h2></div>
              <div className={`match-clock ${roundStarted && displayTime <= 10 ? "is-urgent" : ""}`} aria-live="polite">
                <span>TIME LEFT</span><strong>{displayTime}<i>SEC</i></strong>
              </div>
            </div>
            <div className="round-scoreboard" aria-label="Round scoreboard">
              <div><span>YOUR SCORE</span><strong>{score}</strong></div>
              <div><span>STREAK</span><strong>{streak}<small>×</small></strong></div>
            </div>
            <div className="match-setup">
              <select aria-label="Game mode" value={gameMode} onChange={(event) => setGameMode(event.target.value)} disabled={roundStarted}>
                <option value="manual">Choose number</option>
                <option value="random">Random player</option>
                <option value="daily">Daily challenge</option>
              </select>
              <div className={`difficulty-selector ${difficulty === "hard" ? "is-hard" : ""}`} role="radiogroup" aria-label="Choose difficulty">
                <button type="button" role="radio" aria-checked={difficulty === "easy"} className={difficulty === "easy" ? "is-selected" : ""} onClick={() => setDifficulty("easy")} disabled={roundStarted}>
                  <span>EASY</span><small>60 sec · all clues</small>
                </button>
                <button type="button" role="radio" aria-checked={difficulty === "hard"} className={difficulty === "hard" ? "is-selected" : ""} onClick={() => setDifficulty("hard")} disabled={roundStarted}>
                  <span>HARD <i>★</i></span><small>45 sec · 1 clue</small>
                </button>
              </div>
            </div>
            <p className={`difficulty-note ${difficulty === "hard" ? "is-hard" : ""}`}>{difficulty === "hard" ? "Correct +5 · Miss −2" : "Correct +3 · Miss −1"}</p>
            {gameMode === "daily" && challengeDate && <p className="daily-date">Daily · {challengeDate}</p>}
            <div className="controls-row">
              {gameMode === "manual" ? (
                <input className="footballer-index" type="number" min="1" max={playerCount || undefined} placeholder="Player #" aria-label={`Player number, 1 to ${playerCount || "loading"}`} value={choice} onChange={(e) => handleChoiceChange(e.target.value)} disabled={roundStarted} />
              ) : null}
              <button className="primary-btn" onClick={startGame} disabled={loading || roundStarted}>{loading ? "Starting..." : "Start round"}</button>
            </div>
            <div className="clue-heading"><span>CLUES</span><strong>{hints.length}<i> / {maxHints}</i></strong></div>
            <div className="clue-action-row">
              <div className="hints-wrap">
                {hints.map((hint, index) => <p className="hint-line" key={`${index}-${hint}`}><span>{String(index + 1).padStart(2, "0")}</span>{hint}</p>)}
                {!hints.length && <p className="empty-hints">{roundStarted ? "Guess now or reveal a clue." : "Your clue will appear here."}</p>}
              </div>
              <button className="secondary-btn give-clue-btn" onClick={getHint} disabled={loading || !roundStarted || roundComplete || !hasMoreHints}>
                {loading ? "Loading..." : "Give clue"}
              </button>
            </div>
            <div className="answer-row">
              <input className="your-answer" type="text" placeholder="Player name" aria-label="Player name" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") checkAnswer(); }} disabled={!roundStarted || loading || roundComplete} />
              <button className="submit-answer-btn" onClick={checkAnswer} disabled={loading || roundComplete || !roundStarted}>Guess</button>
            </div>
            <div className="action-row">
              <button className="skip-btn" onClick={skipRound} disabled={loading || !roundStarted}>Skip</button>
            </div>
            {result && <p className="result-message" role="status">{result}</p>}
          </section>
            ) : activeGame === "tictactoe" ? (
          <FootballTicTacToe apiUrl={API_URL} playerCount={playerCount} difficulty={difficulty} onDifficultyChange={setDifficulty} />
            ) : activeGame === "multiple" ? (
          <FootballMultipleChoice apiUrl={API_URL} difficulty={difficulty} onDifficultyChange={setDifficulty} />
            ) : activeGame === "quickfire" ? (
          <FootballQuickfire apiUrl={API_URL} difficulty={difficulty} onDifficultyChange={setDifficulty} />
            ) : (
          <FootballExpandedGames difficulty={difficulty} onDifficultyChange={setDifficulty} />
            )}
          </div>
        </div>
      </main>
      <footer className="site-footer"><span>TOUCHLINE</span></footer>
    </div>
  );
}

export default App;