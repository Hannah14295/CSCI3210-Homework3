import "./App.css";
import Game from "./components/Game/Game";

function App() {
  return (
    <div className="App">
      <header className="game-header">
        <h1>Butterfly Dash</h1>
        <p>Press the Space Bar to begin!</p>
      </header>

      <Game />
    </div>
  );
}

export default App;
