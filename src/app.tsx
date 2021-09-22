import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";

import pages from "./pages";
import React from "react";
import { PagesContextProvider } from "./context/page";

export const App = () => {
  return (
    <LocalizationProvider dateAdapter={DateFnsUtils}>
      <Router>
        <PagesContextProvider>
          <Switch>
            {Object.keys(pages).map((page) => (
              <Route path={page === "/" ? page : `/${page}`}>
                {React.createElement(pages[page])}
              </Route>
            ))}
          </Switch>
        </PagesContextProvider>
      </Router>
    </LocalizationProvider>
  );
};
