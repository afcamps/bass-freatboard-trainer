import { useState } from 'react';
const notes = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

type String = 1 | 2 | 3 | 4;
type Note = (typeof notes)[number];

type Fretboard = {
  [key in String]: Note[];
};

const fretboard: Fretboard = {
  4: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
  3: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
  2: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
  1: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
};

const getRandomPosition = (mode: number) => {
  const string = mode === 1 ? Math.floor(Math.random() * 4) + 1 : undefined;
  const note = notes[Math.floor(Math.random() * notes.length)];
  return { string, note };
};

const placeOnBoard = (
  index: number,
  shift: number,
  zeroShift?: number,
): number => {
  return index === 0 ? (zeroShift ?? 0) : (index + 1) * 40 - shift;
};

export default function App() {
  const [mode, setMode] = useState(1);
  const [target, setTarget] = useState(() => getRandomPosition(mode));
  const [score, setScore] = useState(0);
  const [debug, setDebug] = useState(false);
  const [hoveredFret, setHoveredFret] = useState<{
    string: number;
    fret: number;
  } | null>(null);

  const checkAnswer = (string: number, fret: number) => {
    const correct =
      mode === 1
        ? string === target.string &&
          fretboard[string as String][fret] === target.note
        : fretboard[string as String][fret] === target.note;
    if (correct) {
      setScore(score + 1);
      setTarget(getRandomPosition(mode));
    }
  };

  const mapStringToNote = {
    4: 'E (mi)',
    3: 'A (la)',
    2: 'D (ré)',
    1: 'G (sol)',
  };

  const mapEnglishNoteToFrenshNote = {
    C: 'Do',
    'C#': 'Do #',
    D: 'Ré',
    'D#': 'Ré #',
    E: 'Mi',
    F: 'Fa',
    'F#': 'Fa #',
    G: 'Sol',
    'G#': 'Sol #',
    A: 'La',
    'A#': 'La #',
    B: 'Si',
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-bold mb-2">
        Trouve la note : {target.note} -{' '}
        {mapEnglishNoteToFrenshNote[target.note]}
      </h2>
      {mode === 1 && (
        <p>Corde imposée : {mapStringToNote[target.string as String]}</p>
      )}
      <p>Score : {score}</p>
      <button
        onClick={() => setDebug(!debug)}
        className="mb-2 p-2 bg-gray-300 rounded"
      >
        {debug ? 'Désactiver' : 'Activer'} le mode debug
      </button>
      <button
        onClick={() => setMode(mode === 1 ? 2 : 1)}
        className="mb-2 p-2 bg-blue-300 rounded"
      >
        Mode : {mode === 1 ? 'Une seule corde' : 'Toutes les cordes'}
      </button>
      <svg
        width="550"
        height="160"
        viewBox="0 0 550 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points={`0,0 0,160 500,160 500,0`} fill="#8B5A2B" />
        <Nut />

        <Frets />
        <Strings />
        <Markers />
        {[...Array(4)].map((_, string) => (
          <circle
            key={`open-${string}`}
            cx={10}
            cy={string * 40 + 25}
            r="10"
            fill="gray"
            onMouseEnter={() =>
              setHoveredFret({ string: string + 1, fret: -1 })
            }
            onMouseLeave={() => setHoveredFret(null)}
            onClick={() => checkAnswer(string + 1, -1)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        {[...Array(4)].map((_, string) =>
          [...Array(13)].map((_, fret) => (
            <g key={`${string}-${fret}`}>
              <circle
                cx={placeOnBoard(fret, 40, 10)}
                cy={string * 40 + 25}
                r="8"
                fill={
                  hoveredFret?.string === string + 1 &&
                  hoveredFret?.fret === fret
                    ? 'red'
                    : 'transparent'
                }
                onMouseEnter={() =>
                  setHoveredFret({ string: string + 1, fret })
                }
                onMouseLeave={() => setHoveredFret(null)}
                onClick={() => checkAnswer(string + 1, fret)}
                style={{ cursor: 'pointer' }}
              />
              {debug && (
                <text
                  x={placeOnBoard(fret, 40, 10)}
                  y={string * 40 + 30}
                  fontSize="10"
                  fill="black"
                  textAnchor="middle"
                >
                  {fretboard[(string + 1) as String][fret]}
                </text>
              )}
            </g>
          )),
        )}
      </svg>
    </div>
  );
}

const Nut = () => {
  return <rect x="0" y="0" width="20" height="160" fill="#222" />;
};

const Strings = () => {
  const stringThickness = [3, 4, 5, 6];

  return [...Array(4)].map((_, i) => (
    <line
      key={i}
      x1="0"
      y1={i * 40 + 25}
      x2="500"
      y2={i * 40 + 25}
      stroke="silver"
      strokeWidth={stringThickness[i]}
    />
  ));
};

const Frets = () => {
  return [...Array(14)].map((_, i) => (
    <line
      key={i}
      x1={placeOnBoard(i, 60)}
      y1="0"
      x2={placeOnBoard(i, 60)}
      y2="160"
      stroke="black"
      strokeWidth="2"
    />
  ));
};

const Markers = () => {
  return [3, 5, 7, 9, 12].map(fret =>
    fret === 12 ? (
      <>
        <circle
          key={fret}
          cx={placeOnBoard(fret, 40)}
          cy="45"
          r="6"
          fill="white"
        />
        <circle
          key={fret}
          cx={placeOnBoard(fret, 40)}
          cy="125"
          r="6"
          fill="white"
        />
      </>
    ) : (
      <circle
        key={fret}
        cx={placeOnBoard(fret, 40)}
        cy="85"
        r="6"
        fill="white"
      />
    ),
  );
};
