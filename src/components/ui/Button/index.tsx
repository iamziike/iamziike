import classes from './Button.module.scss';

type ButtonProps = {
  text: string;
  className?: string;
};

const Button = ({ text, className }: ButtonProps) => {
  return <button className={`${className} ${classes.button}`}>{text}</button>;
};

export default Button;
