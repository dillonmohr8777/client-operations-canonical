import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/archivo';
import '@fontsource-variable/manrope';
import '@fontsource-variable/unbounded';
import '@fontsource/instrument-serif/400-italic.css';
import './styles.css';
import { MapHomepage } from './concepts/MapHomepage';
import { SignalHomepage } from './concepts/SignalHomepage';

const concept = import.meta.env.VITE_CONCEPT === 'map' ? 'map' : 'signal';
document.title = concept === 'map'
  ? 'Need Momentum — Put Your Business on the Map'
  : 'Need Momentum — Kinetic Signal Field';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {concept === 'map' ? <MapHomepage /> : <SignalHomepage />}
  </React.StrictMode>
);
