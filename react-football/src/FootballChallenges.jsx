import { useEffect, useState } from "react";

async function requestRound(apiUrl, mode, difficulty) {
  const response = await fetch(`${apiUrl}/start_round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, difficulty }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not start a round.");
  }
  return data;
}

async function requestHint(apiUrl, index, hintNo, difficulty) {
  const response = await fetch(`${apiUrl}/get_hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, hint_no: hintNo, difficulty }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "No more clues are available.");
  }
  return data;
}

async function requestAnswer(apiUrl, index, guess, difficulty) {
  const response = await fetch(`${apiUrl}/check_answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, guess, difficulty }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not check that answer.");
  }
  return data;
}

function DifficultyPicker({ value, onChange, disabled = false }) {
  return (
    <label className="challenge-difficulty">
      Difficulty
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        <option value="easy">Easy · all available clues</option>
        <option value="hard">Hard · lesser-known legends, 1 clue</option>
      </select>
    </label>
  );
}

export function FootballMultipleChoice({ apiUrl, difficulty, onDifficultyChange }) {
  const [round, setRound] = useState(null);
  const [hints, setHints] = useState([]);
  const [hasMoreHints, setHasMoreHints] = useState(true);
  const [hintNo, setHintNo] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Start a round, reveal clues, and choose the player.");

  const startRound = async () => {
    setBusy(true);
    try {
      const data = await requestRound(apiUrl, "multiple_choice", difficulty);
      setRound(data);
      setHints([]);
      setHasMoreHints(true);
      setHintNo(0);
      setSelectedOption(null);
      setStatus("Who is the footballer? Use a clue or trust your instincts.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const revealHint = async () => {
    if (!round || selectedOption !== null || busy) return;
    setBusy(true);
    try {
      const data = await requestHint(apiUrl, round.index, hintNo, difficulty);
      setHints((previous) => [...previous, data.hint]);
      setHintNo((previous) => previous + 1);
      setHasMoreHints(data.has_more);
      setStatus(data.has_more ? "Clue unlocked. Make your pick." : "Last clue unlocked. Make your pick.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const chooseOption = async (optionIndex) => {
    if (!round || selectedOption !== null || busy) return;
    setBusy(true);
    try {
      const result = await requestAnswer(apiUrl, round.index, round.options[optionIndex], difficulty);
      setSelectedOption(optionIndex);
      setScore((previous) => previous + result.points);
      setStatus(result.points > 0 ? `Correct. +${result.points} points.` : `Not this time. ${result.points} points. The correct option is highlighted.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="game-panel challenge-game-panel" aria-label="Four-choice footballer game">
      <div className="panel-heading">
        <div><p className="eyebrow">READ THE CLUES</p><h2>Four-choice face-off</h2></div>
        <div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>
      </div>
      <div className="challenge-toolbar">
        <DifficultyPicker value={difficulty} onChange={onDifficultyChange} disabled={Boolean(round && selectedOption === null)} />
        <button className="primary-btn" onClick={startRound} disabled={busy}>{busy && !round ? "Starting..." : round ? "New question" : "Start game"}</button>
      </div>
      <div className="choice-clues" aria-live="polite">
        {hints.length ? hints.map((hint, index) => <p className="hint-line" key={`${index}-${hint}`}><span>{String(index + 1).padStart(2, "0")}</span>{hint}</p>) : <p className="empty-hints">{round ? "No clues revealed yet." : "Your clues will appear here."}</p>}
      </div>
      <div className="choice-options">
        {(round?.options || ["Option A", "Option B", "Option C", "Option D"]).map((option, index) => {
          const isCorrect = selectedOption !== null && index === round?.correct_option;
          const isWrongPick = selectedOption === index && !isCorrect;
          return (
            <button
              className={`choice-option ${isCorrect ? "is-correct" : ""} ${isWrongPick ? "is-wrong" : ""}`}
              key={`${round?.index ?? "empty"}-${index}`}
              onClick={() => chooseOption(index)}
              disabled={!round || selectedOption !== null || busy}
            >
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>
          );
        })}
      </div>
      <div className="challenge-footer-row">
        <p className="challenge-status" role="status">{status}</p>
        <button className="secondary-btn" onClick={revealHint} disabled={!round || selectedOption !== null || busy || !hasMoreHints}>Reveal clue</button>
      </div>
    </section>
  );
}

export function FootballQuickfire({ apiUrl, difficulty, onDifficultyChange }) {
  const [playing, setPlaying] = useState(false);
  const roundSeconds = difficulty === "hard" ? 45 : 60;
  const [timeLeft, setTimeLeft] = useState(roundSeconds);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [round, setRound] = useState(null);
  const [hints, setHints] = useState([]);
  const [hasMoreHints, setHasMoreHints] = useState(true);
  const [hintNo, setHintNo] = useState(0);
  const [guess, setGuess] = useState("");
  const [answered, setAnswered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("You have 60 seconds. How many players can you name?");

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setTimeLeft((previous) => Math.max(0, previous - 1)), 1000);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!playing || timeLeft !== 0) return undefined;
    const timeout = setTimeout(() => {
      setPlaying(false);
      setRound(null);
      setStatus(`Full time. Final score: ${score} points, best streak: ${bestStreak}.`);
    }, 0);
    return () => clearTimeout(timeout);
  }, [playing, timeLeft, score, bestStreak]);

  const loadNextRound = async () => {
    setBusy(true);
    try {
      const data = await requestRound(apiUrl, "random", difficulty);
      setRound(data);
      setHints([]);
      setHasMoreHints(true);
      setHintNo(0);
      setGuess("");
      setAnswered(false);
      setStatus("Name the player. Reveal clues if you need them.");
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startSession = async () => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(roundSeconds);
    setStatus(`The ${roundSeconds}-second clock is on. Good luck!`);
    const loaded = await loadNextRound();
    if (loaded) setPlaying(true);
  };

  const revealHint = async () => {
    if (!playing || !round || answered || busy) return;
    setBusy(true);
    try {
      const data = await requestHint(apiUrl, round.index, hintNo, difficulty);
      setHints((previous) => [...previous, data.hint]);
      setHintNo((previous) => previous + 1);
      setHasMoreHints(data.has_more);
      setStatus("Clue revealed. Keep the clock in mind.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitGuess = async () => {
    if (!round || answered || busy || !guess.trim()) {
      if (!guess.trim()) setStatus("Enter a player name first.");
      return;
    }
    setBusy(true);
    try {
      const result = await requestAnswer(apiUrl, round.index, guess, difficulty);
      setScore((previous) => previous + result.points);
      setGuess("");
      setAnswered(true);
      if (result.points > 0) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((previous) => Math.max(previous, nextStreak));
        setStatus(`Correct! +${result.points} points. Ready for the next player?`);
      } else {
        setStreak(0);
        setStatus(`Wrong answer. ${result.points} points. Take a breath, then go again.`);
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="game-panel challenge-game-panel quickfire-panel" aria-label="Quickfire footballer game">
      <div className="panel-heading">
        <div><p className="eyebrow">{difficulty === "hard" ? "HARD MODE · 45 SECONDS" : "ONE MINUTE. NO SUBSTITUTIONS."}</p><h2>Quickfire</h2></div>
        <div className={`quickfire-clock ${timeLeft <= 10 && playing ? "is-low" : ""}`}><small>TIME</small><strong>{playing || timeLeft === 0 ? timeLeft : roundSeconds}<i>s</i></strong></div>
      </div>
      <div className="quickfire-stats">
        <span>Score <strong>{score}</strong></span>
        <span>Streak <strong>{streak}</strong></span>
        <span>Best <strong>{bestStreak}</strong></span>
      </div>
      <div className="challenge-toolbar">
        <DifficultyPicker value={difficulty} onChange={onDifficultyChange} disabled={playing} />
        {!playing ? <button className="primary-btn" onClick={startSession} disabled={busy}>{busy ? "Starting..." : "Kick off"}</button> : null}
      </div>
      <div className="quickfire-clues" aria-live="polite">
        {hints.length ? hints.map((hint, index) => <p className="hint-line" key={`${index}-${hint}`}><span>{String(index + 1).padStart(2, "0")}</span>{hint}</p>) : <p className="empty-hints">{round ? "No clue used. Trust your football brain." : "Your first player is waiting on the whistle."}</p>}
      </div>
      {playing && round && (
        <>
          <div className="quickfire-answer-row">
            <input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitGuess(); }} placeholder="Name the player" aria-label="Footballer guess" disabled={answered || busy} />
            <button className="primary-btn" onClick={submitGuess} disabled={answered || busy || !guess.trim()}>Submit</button>
          </div>
          <div className="action-row">
            <button className="secondary-btn" onClick={revealHint} disabled={answered || busy || !hasMoreHints}>Reveal clue</button>
            {answered && <button className="primary-btn" onClick={loadNextRound} disabled={busy || timeLeft === 0}>Next player</button>}
          </div>
        </>
      )}
      <p className="challenge-status" role="status">{status}</p>
    </section>
  );
}