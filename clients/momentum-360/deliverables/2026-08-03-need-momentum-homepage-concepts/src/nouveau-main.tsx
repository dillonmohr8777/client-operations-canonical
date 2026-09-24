import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/archivo';
import '@fontsource-variable/manrope';
import './concepts/nouveau.css';
import { NouveauHomepage } from './concepts/NouveauHomepage';

document.title = 'Need Momentum — Local Homepage Preview';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NouveauHomepage />
  </React.StrictMode>
);
