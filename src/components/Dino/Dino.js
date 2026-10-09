import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef(null);
  const cactusRef = useRef(null);
  
  const scoreRef = useRef(0);
  const velocityY = useRef(0);
  const dinoY = useRef(0);
  const cactusX = useRef(1000);

  const [score, setScore] = useState(0);
  const [cactusCount, setCactusCount] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // physics settings
  const gravity = 2200;
  const jumpStrength = 550;
  const groundY = 0;
  const cactusSpeed = 400;

  const jump = () => {
    if (dinoY.current === groundY) {
      velocityY.current = -jumpStrength;
    }
  };

  const isColliding = (a, b) => {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  };

  // randomizing cactuses
  const randomizeCactus = () => {
    const count = Math.floor(Math.random() * 3) + 1;
    setCactusCount(count);
  };

  // start function
  const startGame = () => {
    // reset the dinosaur's physics
    dinoY.current = 0;
    velocityY.current = 0;

    // reset the cactus position
    cactusX.current = 1000;
    randomizeCactus();

    // reset the score
    setScore(0);
    scoreRef.current = 0;

    // start a fresh game
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    let animationId;
    let lastTime = null;

    const update = (timestamp) => {
      if (lastTime !== null) {
        const deltaTime = (timestamp - lastTime) / 1000;
        
        scoreRef.current += deltaTime * 10;
        setScore(Math.floor(scoreRef.current));

        // update veritical volocity using gravity
        velocityY.current += gravity * deltaTime;

        // update vertical position
        dinoY.current += velocityY.current * deltaTime;

        // stop the dino at the ground
        if (dinoY.current > groundY) {
          dinoY.current = groundY;
          velocityY.current = 0;
        }

        // apply the position to the dino element
        if (dinoRef.current) {
          dinoRef.current.style.transform = `translateY(${dinoY.current}px)`;
        }

        // move the cactus from right to left
        cactusX.current -= cactusSpeed * deltaTime;

        // reset the cactus after it leaves the screen
        if (cactusX.current < -(cactusRef.current?.offsetWidth ?? 20)) {
          cactusX.current = 1000;
          randomizeCactus();
        }

        // apply the cactus position
        if (cactusRef.current) {
          cactusRef.current.style.left = `${cactusX.current}px`;
        }

        // check for collisions
        const dino = dinoRef.current;
        const cactuses = cactusRef.current?.querySelectorAll(".cactus");

        if (dino && cactuses) {
          const dinoRect = dino.getBoundingClientRect();

          for (const cactus of cactuses) {
            const cactusRect = cactus.getBoundingClientRect();

            const collision = isColliding(dinoRect, cactusRect);

            if (collision) {
              setGameStarted(false);
              setGameOver(true);
              return;
            }
          }
        }
      }

      lastTime = timestamp;
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, [gameStarted]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        if (!gameStarted) {
          startGame();
        } else {
          jump();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted]);

  return (
    <div className="game">
      <button onClick={startGame}>
        {gameOver ? "Play Again" : "Start Game"}
      </button>
      Score: {score}
      <div id="dino" ref={dinoRef}></div>
      <div id="cactus" ref={cactusRef} className={gameStarted ? "running" : ""}>
        {Array.from({length: cactusCount}, (_, index) => (
          <div className="cactus" key={index}></div>
        ))}
      </div>
    </div>
  );
}

export default Dino;
