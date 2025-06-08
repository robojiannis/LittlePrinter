import React from "react";
import ReactDOM from "react-dom";

import "pepjs";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import "./slab.css";


// Add Roboto font from Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,900;1,900&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
