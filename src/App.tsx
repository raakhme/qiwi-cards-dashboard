import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MainPage } from "./pages/main";
import { PaymentsPage } from "./pages/payments";

import { LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";
import { useState, useEffect } from "react";
import { initApi, QiwiApi } from "./utils/api";

export const App = () => {
  const [token, setToken] = useState(localStorage.getItem("qiwi-token"));

  useEffect(() => {
    async function setTokenPrompt() {
      if (!token || token === "") {
        const result = prompt("Enter Qiwi API Token", "");
        if (result === null) {
          alert("You must enter api token");
          await setTokenPrompt();
        }
        if (result === "") {
          alert("You entered empty api token");
          await setTokenPrompt();
        }
        try {
          if (result && result !== "") {
            QiwiApi.setToken(result as string);
            await QiwiApi.profileInfo();
            setToken(result);
            return;
          }
        } catch (err) {
          alert(
            "You entered an incorrect api token or have problems with the api"
          );
          QiwiApi.setToken("");
          setToken("");
          await setTokenPrompt();
        }
      }
    }

    setTokenPrompt();

    if (token) {
      QiwiApi.setToken(token);
      initApi();
    }
  }, [token]);

  return token ? (
    <LocalizationProvider dateAdapter={DateFnsUtils}>
      <Router>
        <Switch>
          <Route path="/payments">
            <PaymentsPage />
          </Route>
          <Route path="/">
            <MainPage />
          </Route>
        </Switch>
      </Router>
    </LocalizationProvider>
  ) : null;
};
