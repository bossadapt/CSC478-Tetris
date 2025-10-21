import React from "react";
import "./App.css";
import GameEngine from "./GameEngine";

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
      <div>
        <GameEngine />
      </div>
      <div
        style={{ width: "40vw", height: "100vh", background: "#00FF0F" }}
      ></div>
    </div>
  );
}

export default App;
