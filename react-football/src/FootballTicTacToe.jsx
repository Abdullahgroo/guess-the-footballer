import { useState } from "react";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board) {
  for (const [first, second, third] of WIN_LINES) {
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return board[first];
    }
  }

  return null;
}

function FootballTicTacToe({ apiUrl, playerCount, difficulty, onDifficultyChange }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentMark, setCurrentMark] = useState("X");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(null);
  const [hints, setHints] = useState([]);
  const [hasMoreHints, setHasMoreHints] = useState(true);
  const [hintNo, setHintNo] = useState(0);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState("Choose an open square, then earn it with a correct guess.");
  const [busy, setBusy] = useState(false);
  const [winner, setWinner] = useState(null);
  const [wins, setWins] = useState({ X: 0, O: 0 });

  const startChallenge = async () => {
    if (selectedSquare === null || challengeIndex !== null || winner) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${apiUrl}/start_round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "random", difficulty }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "Could not start the footballer challenge.");
        return;
      }

      setChallengeIndex(data.index);
      setHints([]);
      setHasMoreHints(true);
      setHintNo(0);
      setGuess("");
      setStatus(`Player ${currentMark} is up. Guess the footballer to claim square ${selectedSquare + 1}.`);
    } catch {
      setStatus("Could not connect to the game server.");
    } finally {
      setBusy(false);
    }
  };

  const revealHint = async () => {
    if (challengeIndex === null || busy) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${apiUrl}/get_hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: challengeIndex, hint_no: hintNo, difficulty }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "No more hints are available.");
        return;
      }

      setHints((previous) => [...previous, data.hint]);
      setHintNo((previous) => previous + 1);
      setHasMoreHints(data.has_more);
      setStatus(data.has_more ? "Clue revealed. Make your guess." : "Final clue revealed. Make your guess.");
    } catch {
      setStatus("Could not connect to the game server.");
    } finally {
      setBusy(false);
    }
  };

  const submitGuess = async () => {
    if (challengeIndex === null || !guess.trim() || busy) {
      if (!guess.trim()) {
        setStatus("Type a player name before submitting.");
      }
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${apiUrl}/check_answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: challengeIndex, guess, difficulty }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "Could not check that answer.");
        return;
      }

      setGuess("");
      setChallengeIndex(null);
      setHints([]);
      setHasMoreHints(true);
      setHintNo(0);

      if (data.points > 0 && selectedSquare !== null) {
        const nextBoard = [...board];
        nextBoard[selectedSquare] = currentMark;
        setBoard(nextBoard);

        const winningMark = getWinner(nextBoard);
        if (winningMark) {
          setWinner(winningMark);
          setWins((previous) => ({ ...previous, [winningMark]: previous[winningMark] + 1 }));
          setStatus(`Player ${winningMark} wins the match!`);
        } else if (nextBoard.every(Boolean)) {
          setWinner("draw");
          setStatus("A full-time draw. Rematch?");
        } else {
          const nextMark = currentMark === "X" ? "O" : "X";
          setCurrentMark(nextMark);
          setSelectedSquare(null);
          setStatus(`Correct! Player ${currentMark} claims the square. Player ${nextMark}, choose your move.`);
        }
      } else {
        const nextMark = currentMark === "X" ? "O" : "X";
        setCurrentMark(nextMark);
        setSelectedSquare(null);
        setStatus(`Not quite. The square stays open. Player ${nextMark}, your turn.`);
      }
    } catch {
      setStatus("Could not connect to the game server.");
    } finally {
      setBusy(false);
    }
  };

  const newMatch = () => {
    setBoard(Array(9).fill(null));
    setCurrentMark("X");
    setSelectedSquare(null);
    setChallengeIndex(null);
    setHints([]);
    setHasMoreHints(true);
    setHintNo(0);
    setGuess("");
    setWinner(null);
    setStatus("Choose an open square, then earn it with a correct guess.");
  };

  const chooseSquare = (index) => {
    if (!board[index] && challengeIndex === null && !winner) {
      setSelectedSquare(index);
      setStatus(`Square ${index + 1} selected. Start a player challenge to claim it.`);
    }
  };

  return (
    <section className="game-panel ttt-panel" aria-label="Football tic-tac-toe">
      <div className="panel-heading">
        <div><p className="eyebrow">HEAD-TO-HEAD</p><h2>Football tic-tac-toe</h2></div>
        <button className="new-match-btn" onClick={newMatch} disabled={busy}>New match</button>
      </div>

      <div className="ttt-scoreboard" aria-label="Match score">
        <div className={currentMark === "X" && !winner ? "is-turn" : ""}><span className="mark-x">X</span><span>PLAYER 1</span><strong>{wins.X}</strong></div>
        <span className="versus">VS</span>
        <div className={currentMark === "O" && !winner ? "is-turn" : ""}><span className="mark-o">O</span><span>PLAYER 2</span><strong>{wins.O}</strong></div>
      </div>

      <div className="ttt-layout">
        <div className="ttt-board" role="group" aria-label="Tic-tac-toe board">
          {board.map((mark, index) => (
            <button
              className={`ttt-square ${mark ? `marked mark-${mark.toLowerCase()}` : ""} ${selectedSquare === index ? "selected" : ""}`}
              key={index}
              onClick={() => chooseSquare(index)}
              disabled={Boolean(mark) || challengeIndex !== null || Boolean(winner) || busy}
              aria-label={`Square ${index + 1}${mark ? `, ${mark}` : selectedSquare === index ? ", selected" : ", empty"}`}
              aria-pressed={selectedSquare === index}
            >
              {mark || <span>{String(index + 1).padStart(2, "0")}</span>}
            </button>
          ))}
        </div>

        <div className="challenge-panel">
          <div className="turn-indicator"><span className={`turn-mark mark-${currentMark.toLowerCase()}`}>{currentMark}</span><span>{winner ? "FULL TIME" : `PLAYER ${currentMark} TO PLAY`}</span></div>
          <label className="ttt-difficulty">Difficulty
            <select value={difficulty} onChange={(event) => onDifficultyChange(event.target.value)} disabled={challengeIndex !== null || Boolean(winner)}>
              <option value="easy">Easy · all available clues</option>
              <option value="hard">Hard · lesser-known legends, 1 clue</option>
            </select>
          </label>
          <p className="ttt-status" role="status">{status}</p>
          {selectedSquare !== null && challengeIndex === null && !winner && (
            <button className="primary-btn challenge-start" onClick={startChallenge} disabled={busy || !playerCount}>
              {busy ? "Setting up..." : `Challenge for square ${selectedSquare + 1}`}
            </button>
          )}
          {challengeIndex !== null && (
            <>
              <div className="ttt-hints">
                {hints.map((hint, index) => <p className="ttt-hint" key={`${index}-${hint}`}><span>{index + 1}</span>{hint}</p>)}
                {!hints.length && <p className="ttt-hint-empty">No clues yet. Reveal one to get started.</p>}
              </div>
              <div className="ttt-answer-row">
                <input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitGuess(); }} placeholder="Who is it?" aria-label="Footballer guess" />
                <button className="primary-btn" onClick={submitGuess} disabled={busy || !guess.trim()}>Guess</button>
              </div>
              <button className="secondary-btn" onClick={revealHint} disabled={busy || !hasMoreHints}>Reveal a clue</button>
            </>
          )}
          {winner && <button className="primary-btn rematch-btn" onClick={newMatch}>Play rematch</button>}
        </div>
      </div>
      <p className="ttt-rules">Pick a square, solve the footballer, place your mark. First to three in a row wins.</p>
    </section>
  );
}

export default FootballTicTacToe;