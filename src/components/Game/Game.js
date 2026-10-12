import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Game.css";

import summerDay from "./img/summer-day.png";
import summerNight from "./img/summer-night.png";
import springDay from "./img/spring-day.png";
import springNight from "./img/spring-night.png";
import winterDay from "./img/winter-day.png";
import winterNight from "./img/winter-night.png";

const scenes = [
  { name: "Summer Day", image: summerDay },
  { name: "Summer Night", image: summerNight },
  { name: "Spring Day", image: springDay },
  { name: "Spring Night", image: springNight },
  { name: "Winter Day", image: winterDay },
  { name: "Winter Night", image: winterNight },
];

const pointsPerScene = 40;

const obstacleHitBoxSettings = {
  flower: {
    insetX: 4,
    insetY: 4,
  },
};

function Game() {
  const playerRef = useRef(null);
  const obstacleGroupRefs = useRef({});
  
  const scoreRef = useRef(0);
  const velocityY = useRef(0);
  const playerY = useRef(0);
  const nextObstacleID = useRef(0);
  const obstaclesRef = useRef([]);

  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [bestScore, setBestScore] = useState(() => {
    try {
      const savedScore = Number(localStorage.getItem("butterflyDashBestScore"));
      return Number.isFinite(savedScore) && savedScore >= 0 ? Math.floor(savedScore) : 0;
    } catch {
      return 0;
    }
  });
  const [newBest, setNewBest] = useState(false);

  const sceneIndex = Math.floor(score / pointsPerScene) % scenes.length;
  const isSpring = sceneIndex === 2 || sceneIndex === 3;
  const isWinter = sceneIndex === 4 || sceneIndex === 5;

  // physics settings
  const gravity = 2000;
  const jumpStrength = 570;
  const groundY = 0;
  const obstacleSpeed = 400;

  const jump = () => {
    if (playerY.current === groundY) {
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

  const getHitBox = (element, insetX, insetY) => {
    const rect = element.getBoundingClientRect();

    return {
      left: rect.left + insetX,
      right: rect.right - insetX,
      top: rect.top + insetY,
      bottom: rect.bottom - insetY,
    };
  };

  // randomizing objects
  const createObstacle = (x) => {
    return {
      id: nextObstacleID.current++,
      type: "flower",
      x: x,
      count: Math.floor(Math.random() * 3) + 1,
    };
  };

  // start function
  const startGame = () => {
    // reset the players's physics
    playerY.current = 0;
    velocityY.current = 0;

    if (playerRef.current) {
      playerRef.current.style.transform = "translateY(0px)";
    }

    // reset the obstacle position
    const initialObstacles = [createObstacle(1000)];
    obstaclesRef.current = initialObstacles;
    setObstacles(initialObstacles);
    obstacleGroupRefs.current = {};

    // reset the score
    setScore(0);
    scoreRef.current = 0;

    // start a fresh game
    setNewBest(false);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameOver) return;

    const finalScore = Math.floor(scoreRef.current);

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      setNewBest(true);
    }
  }, [gameOver, bestScore]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "butterflyDashBestScore",
        String(bestScore)
      );
    } catch {

    }
  }, [bestScore]);


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
        playerY.current += velocityY.current * deltaTime;

        // stop the player at the ground
        if (playerY.current > groundY) {
          playerY.current = groundY;
          velocityY.current = 0;
        }

        // apply the position to the player element
        if (playerRef.current) {
          playerRef.current.style.transform = `translateY(${playerY.current}px)`;
        }

        // move all obstacles and remove those off-screen
        let nextObstacles = obstaclesRef.current.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - obstacleSpeed * deltaTime,
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
        const player = playerRef.current;

        if (player) {
          const playerRect = getHitBox(player, 10, 10);

          for (const obstacle of nextObstacles) {
            const obstacleGroup = obstacleGroupRefs.current[obstacle.id];

            if (!obstacleGroup) continue;

            const obstacleElements = obstacleGroup.querySelectorAll(".obstacle-sprite");
            const hitBoxSettings = obstacleHitBoxSettings[obstacle.type];

            for (const obstacleElement of obstacleElements) {
              const obstacleRect = getHitBox(obstacleElement, hitBoxSettings.insetX, hitBoxSettings.insetY);

              if (isColliding(playerRect, obstacleRect)) {
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
      if (event.code !== "Space") return;
      
      // let focused buttons handle Space normally
      if (event.target instanceof HTMLButtonElement) {
        return;
      }

      event.preventDefault();

      // ignore repeated events from holding down Space
      if (event.repeat) return;

      if (!gameStarted) {
        startGame();
      } else {
        jump();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted]);

  return (
    <div className="game">

      <div className="scene-backgrounds" aria-hidden="true">
        {scenes.map((scene, index) => (
          <div 
            key={scene.name}
            className="scene-background"
            style={{
              backgroundImage: `url(${scene.image})`,
              opacity: index === sceneIndex ? 1 : 0,
            }}
          />
        ))}
      </div>

      {isSpring && (
        <div 
          className={`weather-layer rain-layer ${gameStarted ? "" : "weather-paused"}`}
          aria-hidden="true"
        > 
        {Array.from({ length: 45}, (_, index) => (
          <span
            key={index}
            className="raindrop"
            style={{
              left: `${(index * 37) % 100}%`,
              animationDelay: `${-(index % 10) * 0.12}s`,
              animationDuration: `${0.6 + (index % 4) * 0.1}s`,
            }}
            />
        ))}
        </div>
      )}

      {isWinter && (
        <div 
          className={`weather-layer snow-layer ${gameStarted ? "" : "weather-paused"}`}
          aria-hidden="true"
        > 
        {Array.from({ length: 30}, (_, index) => (
          <span
            key={index}
            className="snowflake"
            style={{
              left: `${(index * 43) % 100}%`,
              width: `${3 + (index % 4)}px`,
              height: `${3 + (index % 4)}px`,
              animationDelay: `${-(index % 12) * 0.5}s`,
              animationDuration: `${3 + (index % 5) * 0.6}s`,
            }}
            />
        ))}
        </div>
      )}

      <div className="game-toolbar">
        <span className="score-display">Score: {score}</span>
      </div>

      <button
        className={`start-game-button ${
          gameStarted || gameOver ? "start-game-button-hidden" : ""
        }`}
        onClick={(event) => {
          event.currentTarget.blur();
          startGame();
        }}
        disabled={gameStarted || gameOver}
      >Start Game</button>

      <div className="best-score-display">Best: {bestScore}</div>

      <div id="player" ref={playerRef}></div>

      {obstacles.map((obstacle) => (
        <div
          className="obstacle"
          key={obstacle.id}
          ref={(element) => {
            if (element) {
              obstacleGroupRefs.current[obstacle.id] = element;
            } else {
              delete obstacleGroupRefs.current[obstacle.id];
            }
          }}
          style={{ left: `${obstacle.x}px` }}
        >
          {Array.from({ length: obstacle.count }, (_, index) => (
            <div className="obstacle-sprite flower" key={index}></div>
        ))}
        </div>
      ))}

      {gameOver && createPortal(
        <div className="game-over-overlay">
          <section
            className="game-over-popup"
            role="dialog"
            aria-labelledby="game-over-title"
            aria-describedby="game-over-description"
          >
            <h2 id="game-over-title">Oops! 🌸</h2>
            <p id="game-over-description">Your butterfly bumped into a flower!</p>
            <p className="final-score">Final score: {score}</p>
            <p>Best score: {bestScore}</p>

            {newBest && (
              <p className="new-best-message">New best score! 🏆</p>
            )}

            <button 
              className="try-again-button"
              onClick={startGame}
              autoFocus
            >Try Again 🦋</button>
          </section> 
        </div>,
        document.body
      )}
    </div>
  );
}

export default Game;
