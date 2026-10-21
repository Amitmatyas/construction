export default function SectionHead({ num, name, light = false }) {
  return (
    <div className={`section-head${light ? ' section-head--light' : ''}`}>
      <span className="section-head__num">({num})</span>
      <span className="section-head__rule" />
      <span className="section-head__name">{name}</span>
    </div>
  );
}
