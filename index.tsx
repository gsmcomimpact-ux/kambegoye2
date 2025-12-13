import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { db } from './services/db';

const startApp = () => {
  try {
    // Attempt to initialize DB
    try {
      db.init();
      console.log("DB Initialized successfully");
    } catch (dbError) {
      console.error("Database initialization failed:", dbError);
      // We continue even if DB fails, to show the UI
    }

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application failed to start:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h1 style="color: #dc2626;">Erreur de chargement</h1>
          <p>L'application n'a pas pu démarrer correctement.</p>
          <pre style="background: #f3f4f6; padding: 10px; border-radius: 5px; text-align: left; overflow: auto;">
            ${error instanceof Error ? error.message : String(error)}
          </pre>
          <button onclick="localStorage.clear(); window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            Réinitialiser et Recharger
          </button>
        </div>
      `;
    }
  }
};

startApp();