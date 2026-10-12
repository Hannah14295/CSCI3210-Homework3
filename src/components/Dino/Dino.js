import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef(null);
  const cactusRefs = useRef({});
  
  const scoreRef = useRef(0);
  const velocityY = useRef(0);
  const dinoY = useRef(0);
  const nextObstacleID = useRef(0);
  const obstaclesRef = useRef([]);

  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // physics settings
  const gravity = 2000;
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
  const createObstacle = (x) => {
    return {
      id: nextObstacleID.current++,
      x: x,
      count: Math.floor(Math.random() * 3) + 1,
    };
  };

  // start function
  const startGame = () => {
    // reset the dinosaur's physics
    dinoY.current = 0;
    velocityY.current = 0;

    // reset the cactus position
    const initialObstacles = [createObstacle(1000)];
    obstaclesRef.current = initialObstacles;
    setObstacles(initialObstacles);
    cactusRefs.current = {};

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

        // move all obstacles and remove those off-screen
        let nextObstacles = obstaclesRef.current.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - cactusSpeed * deltaTime,
        }));

        nextObstacles = nextObstacles.filter(
          (obstacle) => obstacle.x > -100
        );

        // spawn a new obstacles when the previous one reaches the threshold
        const lastObstacle = nextObstacles[nextObstacles.length - 1];

        if (!lastObstacle || lastObstacle.x < 650) {
          nextObstacles.push(createObstacle(1000));
        }

        // update React state so the obstacle positions render correctly
        obstaclesRef.current = nextObstacles;
        setObstacles(nextObstacles);

        // check for collisions
        const dino = dinoRef.current;

        if (dino) {
          const dinoRect = dino.getBoundingClientRect();

          for (const obstacle of nextObstacles) {
            const cactusGroup = cactusRefs.current[obstacle.id];

            if (!cactusGroup) continue;

            const cactuses = cactusGroup.querySelectorAll(".cactus");

            for (const cactus of cactuses) {
              const cactusRect = cactus.getBoundingClientRect();

              if (isColliding(dinoRect, cactusRect)) {
                setGameStarted(false);
                setGameOver(true);
                return;
              }
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

      {obstacles.map((obstacle) => (
        <div
          className="obstacle"
          key={obstacle.id}
          ref={(element) => {
            if (element) {
              cactusRefs.current[obstacle.id] = element;
            } else {
              delete cactusRefs.current[obstacle.id];
            }
          }}
          style={{ left: `${obstacle.x}px` }}
        >
          {Array.from({ length: obstacle.count }, (_, index) => (
            <div className="cactus" key={index}></div>
        ))}
        </div>
      ))}

    </div>
  );
}

export default Dino;
