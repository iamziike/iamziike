import classes from './App.module.scss';
import Header from './components/layouts/Header';

const App = () => {
  return (
    <div className={classes.app}>
      <Header />
    </div>
  );
};

export default App;
