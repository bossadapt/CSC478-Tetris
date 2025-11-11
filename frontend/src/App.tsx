import "./App.css";
import GameEngine from "./GameEngine";
import LeftPanel from "./panels/left_panel/LeftPanel";
import RightPanel from "./panels/right_panel/RightPanel";
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
      <div style={{ width: "40vw", height: "100vh" }}>
        <LeftPanel></LeftPanel>
      </div>
      <div>
        <GameEngine />
      </div>
      <div style={{ width: "40vw", height: "100vh" }}>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}

export default App;
