import React from "react";
import "./App.css";
import Game from "./Game";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <div
        style={{ width: "40vw", height: "100vh", background: "#FF1100" }}
      ></div>
      <Game />
      <div
        style={{ width: "40vw", height: "100vh", background: "#00FF0F" }}
      ></div>
    </div>
  );
}

export default App;
