import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/archivo';
import '@fontsource-variable/manrope';
import './concepts/nouveau-service.css';
import { NouveauService } from './concepts/NouveauService';

document.title = 'Local SEO Service Preview | Need Momentum';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NouveauService />
  </React.StrictMode>
);
