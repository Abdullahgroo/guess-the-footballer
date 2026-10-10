import { useState } from "react";
import { clubGrid, clubs, DEMO_DATA_NOTICE, players, tournamentRuns, transferEvents } from "./footballDemoData";

const EXTRA_MODES = [
  ["career", "Career Trail"],
  ["teammates", "Teammate Link"],
  ["lineup", "Build the XI"],
  ["transfers", "Transfer Detective"],
  ["season", "Season Duel"],
  ["shirt", "Shirt Reveal"],
  ["tournament", "Tournament Run"],
  ["grid", "Tic-Tac-Toe variants"],
];

const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];
const getPlayer = (id) => players.find((player) => player.id === id);
const playerMatches = (player, guess) => [player.name, ...player.aliases].some((answer) => normalize(answer) === normalize(guess));

function PanelHeader({ eyebrow, title, action }) {
  return <div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function StatusLine({ children, className = "" }) {
  return <p className={`challenge-status ${className}`} role="status">{children}</p>;
}

function CareerTrail() {
  const [target, setTarget] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Follow a player's club journey, then name them.");
  const eligible = players.filter((player) => player.clubs.length >= 3);

  const start = () => {
    const next = pickRandom(eligible);
    setTarget(next);
    setRevealed(1);
    setGuess("");
    setStatus("First club revealed. Guess now for maximum points or reveal another stop.");
  };

  const submit = () => {
    if (!target || !guess.trim()) return;
    if (playerMatches(target, guess)) {
      const points = Math.max(1, target.clubs.length + 2 - revealed);
      setScore((previous) => previous + points);
      setStatus(`Correct: ${target.name}. +${points} points.`);
      setTarget(null);
    } else {
      setStatus("Not quite. Use another club clue or try again.");
      setGuess("");
    }
  };

  const reveal = () => {
    if (!target) return;
    if (revealed >= target.clubs.length) {
      setStatus(`Career trail complete: ${target.name}. Start another trail.`);
      setTarget(null);
      return;
    }
    setRevealed((previous) => previous + 1);
    setStatus("Next career stop revealed. Earlier guesses are worth more.");
  };

  return <section className="game-panel extra-panel"><PanelHeader eyebrow="CAREER CLUE RUN" title="Career Trail" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <p className="extra-intro">Clubs are revealed from earliest to latest. Name the player before the trail runs out.</p>
    <div className="career-track">{target ? target.clubs.slice(0, revealed).map((club, index) => <div className="career-stop" key={`${club}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{club}</strong></div>) : <p className="empty-hints">Start a trail to reveal the first club.</p>}</div>
    <div className="extra-answer-row"><input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Name the player" aria-label="Career Trail player guess" /><button className="primary-btn" onClick={submit} disabled={!target || !guess.trim()}>Guess</button></div>
    <div className="action-row"><button className="secondary-btn" onClick={start}>New trail</button><button className="secondary-btn" onClick={reveal} disabled={!target}>Reveal next club</button></div><StatusLine>{status}</StatusLine>
  </section>;
}

function getPairs() {
  const pairs = [];
  for (let first = 0; first < players.length; first += 1) {
    for (let second = first + 1; second < players.length; second += 1) {
      const shared = players[first].clubs.filter((club) => players[second].clubs.includes(club));
      if (shared.length) pairs.push({ first: players[first], second: players[second], shared });
    }
  }
  return pairs;
}

const TEAMMATE_PAIRS = getPairs();
const ALL_PROFILE_CLUBS = [...new Set(players.flatMap((player) => player.clubs))];

function makeClubChoices(sharedClubs) {
  const distractors = ALL_PROFILE_CLUBS.filter((club) => !sharedClubs.includes(club));
  const needed = Math.max(0, 4 - sharedClubs.length);
  const selectedDistractors = [];

  while (selectedDistractors.length < needed && distractors.length) {
    const index = Math.floor(Math.random() * distractors.length);
    selectedDistractors.push(distractors.splice(index, 1)[0]);
  }

  const options = [...sharedClubs, ...selectedDistractors];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return options;
}

function makeChain() {
  const candidates = [
    ["neymar", "messi", "suarez", "pique"],
    ["ronaldo", "kroos", "xabi", "lewandowski"],
  ];
  const chain = pickRandom(candidates).map(getPlayer);
  return chain.map((player, index) => index < chain.length - 1 ? {
    player,
    next: chain[index + 1],
    shared: player.clubs.filter((club) => chain[index + 1].clubs.includes(club)),
  } : null).filter(Boolean);
}

function TeammateLink() {
  const [chainMode, setChainMode] = useState(false);
  const [pair, setPair] = useState(null);
  const [chain, setChain] = useState([]);
  const [clubOptions, setClubOptions] = useState([]);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("Find a club these two players shared.");

  const start = () => {
    setAnswer("");
    setStep(0);
    setFeedback("");
    if (chainMode) {
      const nextChain = makeChain();
      setChain(nextChain);
      setPair(null);
      setClubOptions(makeClubChoices(nextChain[0].shared));
      setStatus("Choose the shared club from four options for each link.");
    } else {
      const nextPair = pickRandom(TEAMMATE_PAIRS);
      setPair(nextPair);
      setChain([]);
      setClubOptions(makeClubChoices(nextPair.shared));
      setStatus("Choose the shared club from four options.");
    }
  };

  const submit = () => {
    if (!answer) return;
    if (chainMode && chain.length) {
      const current = chain[step];
      if (current.shared.includes(answer)) {
        setAnswer("");
        if (step === chain.length - 1) {
          setScore((previous) => previous + chain.length * 2);
          setStreak((previous) => previous + 1);
          setFeedback("correct");
          setStatus(`Link complete. ${chain.length} connections made.`);
          setChain([]);
          setClubOptions([]);
        } else {
          setScore((previous) => previous + 2);
          setStreak((previous) => previous + 1);
          setFeedback("correct");
          setStep((previous) => previous + 1);
          setClubOptions(makeClubChoices(chain[step + 1].shared));
          setStatus("Correct link. Carry on to the next teammate.");
        }
      } else {
        setStreak(0);
        setFeedback("incorrect");
        setStatus("Wrong club. Your link streak resets. Try another option.");
      }
    } else if (pair) {
      if (pair.shared.includes(answer)) {
        setAnswer("");
        setScore((previous) => previous + 3);
        setStreak((previous) => previous + 1);
        setFeedback("correct");
        setStatus(`Correct: both played for ${answer}.`);
        setPair(null);
        setClubOptions([]);
      } else {
        setStreak(0);
        setFeedback("incorrect");
        setStatus("Wrong club. Your link streak resets. Try another option.");
      }
    }
  };

  const activePair = chainMode && chain.length ? chain[step] : pair;
  const choices = activePair ? clubOptions : [];
  const firstPlayer = activePair?.player || activePair?.first;
  const secondPlayer = activePair?.next || activePair?.second;

  return <section className="game-panel extra-panel teammate-panel"><PanelHeader eyebrow="SQUAD CONNECTIONS" title="Teammate Link" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <div className="mode-toggle"><button className={!chainMode ? "is-selected" : ""} onClick={() => { setChainMode(false); setPair(null); setChain([]); }}>One link</button><button className={chainMode ? "is-selected" : ""} onClick={() => { setChainMode(true); setPair(null); setChain([]); }}>Three-link chain</button></div>
    <p className="extra-intro">Spot the shared club, build a combo, and connect the whole chain before your rivals do.</p>
    <div className="link-round-hud"><span>{chainMode ? `LINK ${Math.min(step + 1, 3)} / 3` : "HEAD-TO-HEAD"}</span><span>COMBO <strong>{streak}×</strong></span></div>
    {activePair ? <div className="link-matchup"><div><span>PLAYER {chainMode ? step * 2 + 1 : "A"}</span><strong>{firstPlayer.name}</strong></div><b>LINK</b><div><span>PLAYER {chainMode ? step * 2 + 2 : "B"}</span><strong>{secondPlayer.name}</strong></div></div> : <p className="empty-hints">Start a link to draw footballers.</p>}
    <div className="link-choice-grid">{choices.map((club, index) => <button className={`link-choice ${answer === club ? "is-selected" : ""} ${answer === club ? feedback : ""}`} key={club} onClick={() => { setAnswer(club); setFeedback(""); }}><span>{String.fromCharCode(65 + index)}</span>{club}</button>)}</div>
    <div className="action-row"><button className="primary-btn" onClick={submit} disabled={!answer || !activePair}>Confirm link</button><button className="secondary-btn" onClick={start}>New link</button></div><StatusLine className={`link-status ${feedback}`}>{status}</StatusLine>
  </section>;
}

const FORMATIONS = {
  "4-3-3": ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"],
  "4-4-2": ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"],
};

function BuildXI() {
  const [formation, setFormation] = useState("4-3-3");
  const [lineup, setLineup] = useState(Array(11).fill(""));
  const [status, setStatus] = useState("Draft 11 players. Keep the squad under 280 fantasy credits.");
  const slots = FORMATIONS[formation];
  const rows = formation === "4-3-3" ? [[8, 9, 10], [5, 6, 7], [1, 2, 3, 4]] : [[9, 10], [5, 6, 7, 8], [1, 2, 3, 4]];
  const total = lineup.reduce((sum, id) => sum + (getPlayer(id)?.credits || 0), 0);
  const chemistry = lineup.filter(Boolean).reduce((totalLinks, id, index) => {
    const player = getPlayer(id);
    return totalLinks + lineup.slice(index + 1).filter((otherId) => {
      const other = getPlayer(otherId);
      return other && (other.nationality === player.nationality || player.clubs.some((club) => other.clubs.includes(club)));
    }).length;
  }, 0);

  const choose = (index, id) => {
    const next = [...lineup];
    next[index] = id;
    const nextTotal = next.reduce((sum, playerId) => sum + (getPlayer(playerId)?.credits || 0), 0);
    if (nextTotal > 280) {
      setStatus("That pick takes you over the 280-credit budget.");
      return;
    }
    setLineup(next);
    setStatus(next.every(Boolean) ? "XI complete. Check your chemistry links." : "Player added to your draft.");
  };

  return <section className="game-panel extra-panel"><PanelHeader eyebrow="SQUAD BUILDER · DEMO CREDITS" title="Build the XI" action={<div className="score-chip"><span>REMAINING</span><strong>{280 - total}</strong></div>} />
    <p className="extra-intro">Pick a formation and fill every position. Credits are fictional balance points, not player valuations.</p>
    <label className="challenge-difficulty">Formation<select value={formation} onChange={(event) => { setFormation(event.target.value); setLineup(Array(11).fill("")); }}><option>4-3-3</option><option>4-4-2</option></select></label>
    <div className="lineup-board"><div className="lineup-goal">ATTACK</div><div className="lineup-rows">{rows.map((row, rowIndex) => <div className={`lineup-row lineup-row-${rowIndex}`} key={`${formation}-${rowIndex}`}>{row.map((index) => {
      const position = slots[index];
      const selected = getPlayer(lineup[index]);
      return <label className="lineup-slot" key={index}><span>{position}</span><select value={lineup[index]} onChange={(event) => choose(index, event.target.value)}><option value="">Choose player</option>{players.filter((player) => player.positions.includes(position) && (!lineup.includes(player.id) || player.id === lineup[index])).map((player) => <option value={player.id} key={player.id}>{player.name} · {player.credits}cr</option>)}</select>{selected && <small>{selected.nationality}</small>}</label>;
    })}</div>)}</div><label className="lineup-slot lineup-goalkeeper"><span>GK</span><select value={lineup[0]} onChange={(event) => choose(0, event.target.value)}><option value="">Choose goalkeeper</option>{players.filter((player) => player.positions.includes("GK") && (!lineup.includes(player.id) || player.id === lineup[0])).map((player) => <option value={player.id} key={player.id}>{player.name} · {player.credits}cr</option>)}</select></label><div className="lineup-goal lineup-goal-bottom">GOAL</div></div>
    <div className="lineup-summary"><span>Spent <strong>{total} / 280 cr</strong></span><span>Links <strong>{chemistry}</strong></span><span>Filled <strong>{lineup.filter(Boolean).length} / 11</strong></span></div><StatusLine>{status}</StatusLine>
  </section>;
}

function TransferDetective() {
  const [transfer, setTransfer] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Reveal a transfer detail, then identify the player.");
  const target = transfer && getPlayer(transfer.playerId);
  const clues = transfer ? [`Moved from ${transfer.from}`, `Joined ${transfer.to}`, `Transfer season: ${transfer.season}`, `Reported fee: ${transfer.fee}`] : [];

  const start = () => {
    setTransfer(pickRandom(transferEvents));
    setRevealed(1);
    setGuess("");
    setStatus("The selling club is revealed. Guess now or reveal another detail.");
  };
  const reveal = () => {
    if (revealed >= clues.length) {
      setStatus(`Case solved: ${target?.name}. Start a new case.`);
      setTransfer(null);
      return;
    }
    setRevealed((previous) => previous + 1);
  };
  const submit = () => {
    if (!target || !guess.trim()) return;
    if (playerMatches(target, guess)) {
      const points = Math.max(1, 5 - revealed);
      setScore((previous) => previous + points);
      setStatus(`Correct: ${target.name}. +${points} points.`);
      setTransfer(null);
    } else {
      setStatus("Wrong lead. The next clue may help.");
      setGuess("");
    }
  };

  return <section className="game-panel extra-panel"><PanelHeader eyebrow="TRANSFER FILES · DEMO RECORDS" title="Transfer Detective" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <p className="extra-intro">Piece together the route, season, and reported fee. Fees are example records and can vary by source.</p>
    <div className="transfer-clues">{clues.slice(0, revealed).map((clue, index) => <p key={clue}><span>{String(index + 1).padStart(2, "0")}</span>{clue}</p>)}{!transfer && <p className="empty-hints">Start an investigation to reveal a transfer.</p>}</div>
    <div className="extra-answer-row"><input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Name the player" aria-label="Transfer Detective answer" /><button className="primary-btn" onClick={submit} disabled={!transfer || !guess.trim()}>Identify</button></div>
    <div className="action-row"><button className="secondary-btn" onClick={start}>New case</button><button className="secondary-btn" onClick={reveal} disabled={!transfer}>Reveal detail</button></div><StatusLine>{status}</StatusLine>
  </section>;
}

function SeasonDuel() {
  const matchups = [["haaland", "mbappe"], ["salah", "messi"], ["lewandowski", "neymar"], ["saka", "debruyne"]];
  const [pair, setPair] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Pick who scored more Champions League goals in 2022/23.");
  const start = () => { setPair(pickRandom(matchups).map(getPlayer)); setSelected(null); setStatus("Who had the higher goal tally?"); };
  const choose = (index) => {
    if (!pair || selected !== null) return;
    const correct = pair[index].uclGoals2324 > pair[1 - index].uclGoals2324;
    setSelected(index);
    setScore((previous) => previous + (correct ? 3 : -1));
    setStatus(correct ? "Correct pick. +3 points." : "Not this time. -1 point.");
  };
  return <section className="game-panel extra-panel"><PanelHeader eyebrow="HEAD-TO-HEAD · SAMPLE SEASON STATS" title="Who Had the Better Season?" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <p className="extra-intro">Compare Champions League goals in the 2022/23 season. Sample stats for this prototype.</p>
    <div className="duel-cards">{(pair || [getPlayer("haaland"), getPlayer("mbappe")]).map((player, index) => <button className={`duel-player ${selected === index ? "is-picked" : ""}`} key={player.id} onClick={() => choose(index)} disabled={!pair || selected !== null}><span>PLAYER {index + 1}</span><strong>{player.name}</strong><small>{selected !== null ? `${player.uclGoals2324} goals` : "Champions League · 2022/23"}</small></button>)}</div>
    <div className="action-row"><button className="primary-btn" onClick={start}>{pair && selected !== null ? "Next comparison" : "New comparison"}</button></div><StatusLine>{status}</StatusLine>
  </section>;
}

function ShirtReveal() {
  const [club, setClub] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Reveal the shirt clues and name the club.");
  const start = () => { setClub(pickRandom(clubs)); setRevealed(1); setGuess(""); setStatus("The shirt is masked. Reveal the design and club clues."); };
  const submit = () => {
    if (!club || !guess.trim()) return;
    if (normalize(guess) === normalize(club.name)) {
      const points = Math.max(1, 5 - revealed);
      setScore((previous) => previous + points);
      setStatus(`Correct: ${club.name}. +${points} points.`);
      setClub(null);
    } else { setStatus("That club doesn't match the shirt clues."); setGuess(""); }
  };
  const reveal = () => { if (revealed >= 4) return; setRevealed((previous) => previous + 1); };
  const shirtStyle = club ? { "--kit-main": club.colors[0], "--kit-trim": club.colors[1] } : undefined;

  return <section className="game-panel extra-panel"><PanelHeader eyebrow="KIT SPOTTER · STYLIZED DEMO SHIRTS" title="Badge or Shirt Reveal" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <p className="extra-intro">This prototype uses original color-block shirt illustrations, not official club marks.</p>
    <div className="shirt-game-body"><div className="shirt-stage"><div className={`demo-shirt reveal-${revealed}`} style={shirtStyle} aria-label="Stylized football shirt"><span>{club?.initials || "KIT"}</span></div><div className="shirt-clues">{club && revealed >= 2 && <p>Home city: <strong>{club.city}</strong></p>}{club && revealed >= 3 && <p>Primary color: <strong>{club.colors[0]}</strong></p>}{club && revealed >= 4 && <p>Club initials: <strong>{club.initials}</strong></p>}{!club && <p className="empty-hints">Start to reveal a mystery shirt.</p>}</div></div>
      <div className="shirt-answer"><input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Which club?" aria-label="Club name guess" /><button className="primary-btn" onClick={submit} disabled={!club || !guess.trim()}>Guess club</button><button className="secondary-btn" onClick={reveal} disabled={!club || revealed >= 4}>Reveal clue</button></div></div>
    <div className="action-row"><button className="secondary-btn" onClick={start}>New shirt</button></div><StatusLine>{status}</StatusLine>
  </section>;
}

function TournamentRun() {
  const [run, setRun] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Follow a national team's tournament route and name them.");
  const start = () => { setRun(pickRandom(tournamentRuns)); setRevealed(1); setGuess(""); setStatus("First match revealed. Guess the team or reveal another."); };
  const submit = () => {
    if (!run || !guess.trim()) return;
    if (normalize(guess) === normalize(run.team)) {
      const points = Math.max(1, 6 - revealed);
      setScore((previous) => previous + points);
      setStatus(`Correct: ${run.team}. +${points} points.`);
      setRun(null);
    } else { setStatus("Not the team. Follow the route a little further."); setGuess(""); }
  };
  const reveal = () => { if (!run || revealed >= run.route.length) return; setRevealed((previous) => previous + 1); };
  return <section className="game-panel extra-panel"><PanelHeader eyebrow="TOURNAMENT ARCHIVE · DEMO ROUTES" title="Tournament Run" action={<div className="score-chip"><span>POINTS</span><strong>{score}</strong></div>} />
    <p className="extra-intro">Identify the national team from its opponent-by-opponent 2022 World Cup route.</p>
    <div className="tournament-path"><strong>{run?.year || "FIFA WORLD CUP · 2022"}</strong>{run ? run.route.slice(0, revealed).map((match, index) => <p key={`${index}-${match}`}><span>{String(index + 1).padStart(2, "0")}</span>{match}</p>) : <p className="empty-hints">Start a route to reveal the opening match.</p>}</div>
    <div className="extra-answer-row"><input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Name the national team" aria-label="Tournament team guess" /><button className="primary-btn" onClick={submit} disabled={!run || !guess.trim()}>Guess team</button></div>
    <div className="action-row"><button className="secondary-btn" onClick={start}>New tournament</button><button className="secondary-btn" onClick={reveal} disabled={!run || revealed >= run.route.length}>Reveal next match</button></div><StatusLine>{status}</StatusLine>
  </section>;
}

const NATION_GRID = { rows: ["Brazil", "England", "Spain"], columns: ["GK", "DEF", "MID"] };
const GRID_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function findWinner(board) {
  for (const [a, b, c] of GRID_LINES) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return null;
}

function TicTacToeVariants() {
  const [variant, setVariant] = useState("clubs");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mark, setMark] = useState("X");
  const [selected, setSelected] = useState(null);
  const [guess, setGuess] = useState("");
  const [usedPlayers, setUsedPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("Pick a cell and name a player who matches both categories.");
  const categories = variant === "clubs" ? clubGrid : NATION_GRID;
  const criteria = selected === null ? null : {
    row: categories.rows[Math.floor(selected / 3)],
    column: categories.columns[selected % 3],
  };

  const changeVariant = (next) => {
    setVariant(next);
    setBoard(Array(9).fill(null));
    setMark("X");
    setSelected(null);
    setGuess("");
    setUsedPlayers([]);
    setWinner(null);
    setStatus("Pick a cell and name a player who matches both categories.");
  };

  const submit = () => {
    if (selected === null || !guess.trim() || winner) return;
    const player = players.find((candidate) => playerMatches(candidate, guess));
    if (!player || usedPlayers.includes(player.id)) {
      setStatus("That player is not available for another square. Try a different name.");
      setGuess("");
      return;
    }
    const valid = variant === "clubs"
      ? player.clubs.includes(criteria.row) && player.clubs.includes(criteria.column)
      : player.nationality === criteria.row && player.positions.includes(criteria.column);
    if (!valid) {
      setStatus(`${player.name} doesn't match ${criteria.row} + ${criteria.column}. Turn passes to ${mark === "X" ? "O" : "X"}.`);
      setMark((previous) => previous === "X" ? "O" : "X");
      setSelected(null);
      setGuess("");
      return;
    }

    const nextBoard = [...board];
    nextBoard[selected] = mark;
    setBoard(nextBoard);
    setUsedPlayers((previous) => [...previous, player.id]);
    setGuess("");
    const gameWinner = findWinner(nextBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setStatus(`Player ${gameWinner} wins the grid!`);
    } else if (nextBoard.every(Boolean)) {
      setWinner("draw");
      setStatus("The grid is full. It's a draw.");
    } else {
      const nextMark = mark === "X" ? "O" : "X";
      setMark(nextMark);
      setSelected(null);
      setStatus(`${player.name} fits. Player ${nextMark}, take the next square.`);
    }
  };

  const reset = () => changeVariant(variant);
  return <section className="game-panel extra-panel"><PanelHeader eyebrow="KNOW YOUR CLUBS" title="Tic-Tac-Toe Variants" action={<button className="secondary-btn" onClick={reset}>Reset grid</button>} />
    <div className="mode-toggle"><button className={variant === "clubs" ? "is-selected" : ""} onClick={() => changeVariant("clubs")}>Club connections</button><button className={variant === "nation" ? "is-selected" : ""} onClick={() => changeVariant("nation")}>Nationality + position</button></div>
    <p className="extra-intro">Claim a square by naming an unused demo player who fits its row and column.</p>
    <div className="matrix-grid"><div className="matrix-corner">PLAYER {mark}</div>{categories.columns.map((column) => <div className="matrix-column" key={column}>{column}</div>)}{categories.rows.map((row, rowIndex) => <div className="matrix-row-wrap" key={row}><div className="matrix-row-label">{row}</div>{categories.columns.map((column, columnIndex) => { const index = rowIndex * 3 + columnIndex; return <button className={`matrix-cell ${selected === index ? "is-selected" : ""} ${board[index] ? `mark-${board[index].toLowerCase()}` : ""}`} key={`${row}-${column}`} disabled={Boolean(board[index]) || Boolean(winner)} onClick={() => { setSelected(index); setStatus(`Selected ${row} + ${column}. Name a matching player.`); }} aria-label={`${row} and ${column}${board[index] ? ` claimed by ${board[index]}` : ""}`}>{board[index] || <span>{row}<i>+</i>{column}</span>}</button>; })}</div>)}</div>
    {selected !== null && !winner && <div className="extra-answer-row"><input value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Name a matching player" aria-label="Tic-tac-toe player answer" /><button className="primary-btn" onClick={submit} disabled={!guess.trim()}>Claim for {mark}</button></div>}
    <StatusLine>{status}</StatusLine>
  </section>;
}

export default function FootballExpandedGames() {
  const [activeMode, setActiveMode] = useState("career");
  const games = { career: <CareerTrail />, teammates: <TeammateLink />, lineup: <BuildXI />, transfers: <TransferDetective />, season: <SeasonDuel />, shirt: <ShirtReveal />, tournament: <TournamentRun />, grid: <TicTacToeVariants /> };

  return <div className="football-lab">
    <div className="lab-heading"><p className="eyebrow">THE FOOTBALL LAB</p><h2>More ways to play</h2><p>Eight fan-favorite formats, powered by a small local demo dataset.</p></div>
    <div className="lab-mode-tabs" role="tablist" aria-label="Football game modes">{EXTRA_MODES.map(([id, label], index) => <button key={id} role="tab" aria-selected={activeMode === id} className={activeMode === id ? "is-active" : ""} onClick={() => setActiveMode(id)}><span>{String(index + 1).padStart(2, "0")}</span>{label}</button>)}</div>
    <div className="demo-notice"><strong>DEMO DATA</strong><span>{DEMO_DATA_NOTICE}</span></div>
    {games[activeMode]}
  </div>;
}