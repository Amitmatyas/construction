// Wraps each line (and optionally each word) in a masking span so it can slide up from below.
export default function SplitLines({ lines, as: Tag = 'h2', className = '', words = false }) {
  return (
    <Tag className={`split ${className}`}>
      {lines.map((line, i) => {
        const text = typeof line === 'string' ? line : line.text;
        const mod = typeof line === 'string' ? '' : line.className || '';
        return (
          <span className={`split__line ${mod}`} key={i}>
            {words
              ? text.split(' ').map((w, j) => (
                  <span className="split__mask" key={j}>
                    <span className="split__inner">{w}</span>{' '}
                  </span>
                ))
              : (
                <span className="split__mask">
                  <span className="split__inner">{text}</span>
                </span>
              )}
          </span>
        );
      })}
    </Tag>
  );
}
