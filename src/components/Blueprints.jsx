// Technical line drawings. Every stroke inside `.draw` gets animated with stroke-dashoffset.

export function HouseSection() {
  return (
    <svg className="blueprint" viewBox="0 0 400 520" aria-hidden="true">
      <g className="draw">
        <path d="M30 480H370" />
        <path d="M60 480V210L200 95L340 210V480" />
        <path d="M60 210H340" />
        <path d="M110 480V320H170V480M230 310H300V390H230Z" />
        <path d="M200 95V45M178 45H222" />
        <path className="thin" d="M60 270H340M60 350H340M60 430H340" />
        <path className="thin" d="M100 210V480M140 210V480M180 210V480M220 210V480M260 210V480M300 210V480" />
        <path className="thin" d="M30 500H370M30 494V506M370 494V506" />
      </g>
    </svg>
  );
}

export function SteelDetail() {
  return (
    <svg className="blueprint" viewBox="0 0 400 300" aria-hidden="true">
      <g className="draw">
        <path d="M40 60H360M40 84H360M196 84V216M204 84V216M40 216H360M40 240H360" />
        <circle cx="120" cy="150" r="10" />
        <circle cx="280" cy="150" r="10" />
        <path className="thin" d="M40 270H360M40 262V278M360 262V278" />
        <path className="thin" d="M380 60V240M372 60H388M372 240H388" />
      </g>
    </svg>
  );
}

export function RebarGrid() {
  return (
    <svg className="blueprint" viewBox="0 0 400 300" aria-hidden="true">
      <g className="draw">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`v${i}`} d={`M${40 + i * 40} 30V270`} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`h${i}`} className="thin" d={`M30 ${40 + i * 37}H370`} />
        ))}
      </g>
    </svg>
  );
}

const SERVICE_ART = [
  'M10 130H190M20 130V40H180V130M20 70H180M20 100H180M60 40V70M100 70V100M140 40V70M60 100V130M140 100V130',
  'M20 20V130H180V20M40 45C80 65 120 35 160 55M40 75C80 95 120 65 160 85M40 105C80 125 120 95 160 115',
  'M20 20H180V130H20ZM73 20V130M126 20V130M20 56H180M20 93H180',
  'M10 80L100 20L190 80M30 80V130H170V80M100 42C90 62 80 72 100 88C120 72 110 62 100 42Z'
];

export function ServiceArt({ index }) {
  return (
    <svg className="service__art blueprint" viewBox="0 0 200 140" aria-hidden="true">
      <g className="draw"><path d={SERVICE_ART[index]} /></g>
    </svg>
  );
}

// Five construction stages, each adds a layer to the same building
export function StageArt({ stage }) {
  return (
    <svg className="stage-art blueprint" viewBox="0 0 240 180" aria-hidden="true">
      <g className="draw">
        <path className="thin" d="M10 160H230" />
        {stage === 0 && <path d="M50 160V150M190 160V150M50 155H190M120 30V160" />}
        {stage >= 1 && <path className={stage === 1 ? '' : 'ghost'} d="M50 160H190V170H50Z" />}
        {stage === 1 && <path d="M40 20H200V100H40ZM60 40H120V80H60ZM140 40H180V60" />}
        {stage >= 2 && <path className={stage === 2 ? '' : 'ghost'} d="M60 160V80M120 160V80M180 160V80M55 80H185M55 120H185" />}
        {stage >= 3 && <path className={stage === 3 ? '' : 'ghost'} d="M60 80H180V160H60ZM80 105H105V130H80ZM140 115H162V160H140Z" />}
        {stage >= 4 && <path d="M50 82L120 35L190 82M120 35V20" />}
      </g>
    </svg>
  );
}
