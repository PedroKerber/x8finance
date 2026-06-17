import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { NotifProvider } from './context/NotifContext';
import { MobileProvider } from './context/MobileContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <MobileProvider>
      <NotifProvider>
        <App />
      </NotifProvider>
    </MobileProvider>
  </ThemeProvider>
);
