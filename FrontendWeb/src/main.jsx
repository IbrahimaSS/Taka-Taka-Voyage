// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/notifications/ToastProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <NotificationProvider>
          <App />
          <ToastProvider />
        </NotificationProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
