import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./typography.css";
import "./styles.css";
import "./reading-hierarchy.css";
import "./typography-roles.css";

if (location.pathname === '/' && location.hash === '#home-history') {
  const lang = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
  history.replaceState(history.state, '', '/company?lang=' + lang + '#cd-history-title');
}
document.documentElement.dataset.booting="true";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
