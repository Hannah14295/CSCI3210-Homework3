import "./App.css";
import Dino from "./components/Dino/Dino";

function App() {
  return (
    <div className="App">
      <header className="game-header">
        <h1>Butterfly Dash</h1>
        <p>Press the Space Bar to start!</p>
      </header>

      <Dino />
    </div>
  );
}

export default App;
