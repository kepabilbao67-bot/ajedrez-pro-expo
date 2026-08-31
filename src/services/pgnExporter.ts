import type { GameStatus, MoveRecord } from '@/chess';

export interface PgnExportOptions {
  readonly history: readonly MoveRecord[];
  readonly status: GameStatus;
  readonly event?: string;
  readonly site?: string;
  readonly date?: string;
  readonly white?: string;
  readonly black?: string;
  readonly whiteElo?: string;
  readonly blackElo?: string;
  readonly eco?: string;
  readonly opening?: string;
}

export interface ParsedPgnGame {
  readonly headers: Record<string, string>;
  readonly moves: string[]; // SAN array
  readonly result: string;
  readonly openingName?: string;
}

export const MASTER_GAMES: readonly {
  readonly id: string;
  readonly title: string;
  readonly white: string;
  readonly black: string;
  readonly date: string;
  readonly event: string;
  readonly eco: string;
  readonly result: string;
  readonly pgn: string;
  readonly description: string;
}[] = [
  {
    id: 'opera-1858',
    title: 'La Partida de la Ópera',
    white: 'Paul Morphy',
    black: 'Duque de Brunswick & Conde Isouard',
    date: '1858.11.02',
    event: 'París, Teatro de la Ópera',
    eco: 'C41',
    result: '1-0',
    description: 'La obra maestra de desarrollo rápido, diagonales abiertas y sacrificios deslumbrantes por Paul Morphy.',
    pgn: `[Event "Teatro de la Ópera de París"]
[Site "París, Francia"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duque de Brunswick & Conde Isouard"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    id: 'immortal-1851',
    title: 'La Inmortal de Anderssen',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    date: '1851.06.21',
    event: 'Londres (Casual)',
    eco: 'C33',
    result: '1-0',
    description: 'Anderssen entrega un alfil, las dos torres y finalmente la dama para dar un jaque mate inmortal con piezas menores.',
    pgn: `[Event "Londres"]
[Site "Londres, Inglaterra"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]
[ECO "C33"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`,
  },
  {
    id: 'fischer-century-1956',
    title: 'La Partida del Siglo',
    white: 'Donald Byrne',
    black: 'Bobby Fischer (13 años)',
    date: '1956.10.17',
    event: 'Rosenwald Memorial, New York',
    eco: 'D92',
    result: '0-1',
    description: 'Un joven Bobby Fischer de 13 años sacrifica su dama en la jugada 17 para desatar un molino táctico demoledor.',
    pgn: `[Event "Rosenwald Memorial"]
[Site "New York, USA"]
[Date "1956.10.17"]
[White "Donald Byrne"]
[Black "Bobby Fischer"]
[Result "0-1"]
[ECO "D92"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
  },
  {
    id: 'kasparov-topalov-1999',
    title: 'La Inmortal de Kasparov',
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    date: '1999.01.20',
    event: 'Wijk aan Zee, Holanda',
    eco: 'B07',
    result: '1-0',
    description: 'Considerada por muchos como la mejor partida de la historia moderna, con un sacrificio de torre de cálculo profundo.',
    pgn: `[Event "Hoogovens Tournament"]
[Site "Wijk aan Zee, Holanda"]
[Date "1999.01.20"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]
[ECO "B07"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`,
  },
];

export function exportGameToPgn(options: PgnExportOptions): string {
  const {
    history,
    status,
    event = 'Partida Amistosa',
    site = 'AjedrezPro App',
    date = new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    white = 'Blancas',
    black = 'Negras',
    whiteElo = '?',
    blackElo = '?',
    eco = '?',
    opening = 'Apertura Abierta',
  } = options;

  let resultStr = '*';
  if (status.gameOver) {
    if (status.checkmate) {
      resultStr = status.winner === 'w' ? '1-0' : '0-1';
    } else if (status.draw || status.stalemate) {
      resultStr = '1/2-1/2';
    }
  }

  const headers = [
    `[Event "${event}"]`,
    `[Site "${site}"]`,
    `[Date "${date}"]`,
    `[Round "1"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${resultStr}"]`,
    `[WhiteElo "${whiteElo}"]`,
    `[BlackElo "${blackElo}"]`,
    `[ECO "${eco}"]`,
    `[Opening "${opening}"]`,
  ];

  const moveStrings: string[] = [];
  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = history[i]?.san ?? '';
    const blackMove = history[i + 1]?.san ?? '';

    if (blackMove) {
      moveStrings.push(`${moveNumber}. ${whiteMove} ${blackMove}`);
    } else if (whiteMove) {
      moveStrings.push(`${moveNumber}. ${whiteMove}`);
    }
  }

  const movesBody = moveStrings.join(' ') + (moveStrings.length > 0 ? ` ${resultStr}` : '');
  return `${headers.join('\n')}\n\n${movesBody}`;
}

export function parsePgn(pgnString: string): ParsedPgnGame {
  const headers: Record<string, string> = {};
  const lines = pgnString.trim().split('\n');
  const movesLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const match = trimmed.slice(1, -1).match(/^(\w+)\s+"(.*)"$/);
      if (match) {
        headers[match[1]] = match[2];
      }
    } else {
      movesLines.push(trimmed);
    }
  }

  const rawMovesText = movesLines.join(' ');
  // Clean comments like { ... } and annotations like $1, $2
  const cleanedMovesText = rawMovesText
    .replace(/\{[^}]*\}/g, '')
    .replace(/\$\d+/g, '')
    .replace(/\r?\n/g, ' ');

  // Extract individual SAN tokens
  const tokens = cleanedMovesText.split(/\s+/).filter(Boolean);
  const moves: string[] = [];
  let result = headers.Result ?? '*';

  for (const token of tokens) {
    // If it is result termination
    if (token === '1-0' || token === '0-1' || token === '1/2-1/2' || token === '*') {
      result = token;
      continue;
    }

    // Skip move numbers like "1.", "12...", "14."
    if (/^\d+\.+$/.test(token)) {
      continue;
    }

    // Strip leading number if merged like "1.e4"
    const cleaned = token.replace(/^\d+\.+/, '');
    if (cleaned) {
      moves.push(cleaned);
    }
  }

  return {
    headers,
    moves,
    result,
    openingName: headers.Opening,
  };
}
