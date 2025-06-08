import * as React from "react";
import { Redirect, Router } from "@reach/router";

import * as Messages from "./Messages";
import * as Printers from "./Printers";

function NotFound() {
  return (
    <div>
      <h1>Something went wrong</h1>
    </div>
  );
}

export default ({ dispatch, state }) => {
  // Get the first printer ID from state
  const firstPrinterId = state.printers && Object.keys(state.printers).length > 0 ? Object.keys(state.printers)[0] : null;
  console.log("firstPrinterId", firstPrinterId);
  return (
    <Router>
      {firstPrinterId ? (
        <Redirect from="/" to={`/printers/${firstPrinterId}/messages`} noThrow />
      ) : (
        <Redirect from="/" to="printers" noThrow />
      )}

      <Printers.default path="printers">
        <Printers.List path="/" state={state} dispatch={dispatch} />
        <Printers.Detail path=":printerId" state={state} dispatch={dispatch} />
        <Printers.Add path="add" state={state} dispatch={dispatch} />

        <Messages.default path=":printerId/messages">
          <Messages.SelectType default state={state} dispatch={dispatch} />
          <Messages.Compose
            path=":messageType"
            state={state}
            dispatch={dispatch}
          />
        </Messages.default>
      </Printers.default>

      <NotFound default />
    </Router>
  );
};
