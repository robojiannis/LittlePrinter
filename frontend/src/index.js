import React from "react";
import ReactDOM from "react-dom";

import "pepjs";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import "./slab.css";


// Add Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Register service worker for PWA support
serviceWorker.register();
