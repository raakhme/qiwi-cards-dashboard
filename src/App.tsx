import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { QiwiApi } from "./utils/api";

function App() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function fetchInfo() {
      const info = await QiwiApi.profileInfo();
      setInfo(info);
    }
    QiwiApi.getCards();
    fetchInfo();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={QiwiApi.payPackage}>Pay package</button>
        {info ? <pre>{JSON.stringify(info, null, 2)}</pre> : null}
      </header>
    </div>
  );
}

export default App;
