import { useEffect, useState } from 'react';

import classes from './Header.module.scss';
import Logo from '../../ui/Logo';
import Button from '../../ui/Button';
import TextScrollable from '../../ui/Text-Scrollable';

const Header = () => {
  const [resumeURL, setResumeURL] = useState('');

  useEffect(() => {
    const api_key = import.meta.env.VITE_JSON_BIN_API_KEY;
    const binID = import.meta.env.VITE_JSON_BIN_ID;
    const url = 'https://api.jsonbin.io/v3/b/' + binID;

    const requestOptions = {
      method: 'GET',
      headers: {
        // 'X-Master-Key': '$2b$10$tAiQ2gpM0fO' + api_key,
        // have to use the above during development or some problems
        'X-Master-Key': api_key,
      },
    };

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setResumeURL(result.record.resume);
      });
  }, []);

  const keywords = [
    'a beardy dude π§πΎ',
    'a web developer π»',
    'an afro superman π¦ΈπΎββοΈ',
  ];

  const keywords2 = [
    'React Js',
    'all things Web πΈοΈ',
    'to code π»',
    'coffee β',
    'to build stuffs ποΈ',
  ];

  return (
    <header className={classes.header}>
      <nav className={classes.navbar}>
        <Logo />
        <ul>
          <li>
            <a href={resumeURL}>Resume</a>
          </li>
          <li>
            <a href='https://github.com/iamziike'>
              <Button text='Github' />
            </a>
          </li>
        </ul>
      </nav>
      <div className={classes.hero}>
        <div>
          <h1>
            Hello <br /> I&apos;m Wisdom Alajemba
          </h1>
          <div className={classes['hero-text']}>
            <p>I am just</p>
            <TextScrollable
              className={classes['text-scrollable']}
              values={keywords}
            />
            <p>
              who loves <br />
              <TextScrollable
                className={classes['text-scrollable']}
                values={keywords2}
                delay={2}
              />
            </p>
          </div>
        </div>
        <div></div>
      </div>
    </header>
  );
};

export default Header;
