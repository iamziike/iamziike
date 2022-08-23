import { useState } from 'react';
import classes from './Text-Scrollable.module.scss';

type TextScrollableProps = {
  values: string[];
  delay?: number;
  className: string;
};

const TextScrollable = ({
  className = '',
  values,
  delay = 0,
}: TextScrollableProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleAnimationIteration = () => {
    if (values.length === 0) return;

    setFocusedIndex((prev) => (prev === values.length - 1 ? 0 : prev + 1));
  };

  const handleAnimationStart = () => {
    if (delay) handleAnimationIteration();
  };

  return (
    <span className={`${className} ${classes['text-scrollable']}`}>
      <span
        style={{
          animationDelay: `${delay}s`,
        }}
        onAnimationStart={handleAnimationStart}
        onAnimationIteration={handleAnimationIteration}
      >
        {values[focusedIndex] || 'Empty Text'}
      </span>
    </span>
  );
};

export default TextScrollable;
