import {routeHref, routePathname} from './site-routes.js';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./typography.css";
import "./styles.css";
import "./reading-hierarchy.css";
import "./typography-roles.css";

if (routePathname() === '/' && location.hash === '#home-history') {
  const lang = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
  history.replaceState(history.state, '', routeHref('/company#cd-history-title', lang));
}
document.documentElement.dataset.booting="true";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
