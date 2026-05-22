import type { ReactElement } from 'react';
import { PencilFilters } from './components/PencilFilters';
import { Divider } from './components/ui/Divider';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { Work } from './sections/Work';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

/** Root component — composes the portfolio's sections. */
function App(): ReactElement {
  return (
    <>
      <PencilFilters />
      <div className="mx-auto w-full max-w-[880px] px-6 max-[540px]:px-4">
        <Nav />
        <main>
          <Hero />
          <Divider />
          <Work />
          <Divider />
          <About />
          <Divider />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
