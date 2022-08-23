import classes from './Logo.module.scss';

type LogoProps = {
  className?: string;
};

const Logo = ({ className = '' }: LogoProps) => {
  return <a className={`${className} ${classes.logo}`}>Ziike</a>;
};

export default Logo;
