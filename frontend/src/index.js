// deploy
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Zoom lock (solo escritorio): contrarresta el zoom del browser aplicando el inverso en <html>.
// Usa matchMedia(resolution) que es el evento más confiable para cambios de DPR.
;(function lockZoom() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const BASE_DPR = window.devicePixelRatio || 1;

  function applyCounterZoom() {
    const zoom = (window.devicePixelRatio || 1) / BASE_DPR;
    document.documentElement.style.zoom = Math.abs(zoom - 1) < 0.01 ? '' : String(1 / zoom);
    watchNextDprChange();
  }

  function watchNextDprChange() {
    window
      .matchMedia(`screen and (resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener('change', applyCounterZoom, { once: true });
  }

  watchNextDprChange();
}());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
