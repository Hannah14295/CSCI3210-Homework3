import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [cactusCount, setCactusCount] = useState(1);

  const jump = () => {
    if (dinoRef.current && !dinoRef.current.classList.contains("jump")) {
      dinoRef.current.classList.add("jump");

      setTimeout(() => {
        dinoRef.current.classList.remove("jump");
      }, 700);
    }
  };

  /* randomizing cactuses */
  const randomizeCactus = () => {
    const count = Math.floor(Math.random() * 3) + 1;
    setCactusCount(count);
  }

  useEffect(() => {
    const isAlive = setInterval(function () {
      const dino = dinoRef.current;
      const dinoRect = dino.getBoundingClientRect();
      const cactuses = document.querySelectorAll(".cactus");

      // detect collision
      let collision = false;

      cactuses.forEach((cactus) => {
        const cactusRect = cactus.getBoundingClientRect();

        if (
          dinoRect.left + 10 < cactusRect.right &&
          dinoRect.right - 10> cactusRect.left &&
          dinoRect.top + 10< cactusRect.bottom &&
          dinoRect.bottom - 5> cactusRect.top
        ) {
          collision = true;
        }
      })

      if (collision) {
        // collision
        alert("Game Over! Your Score : " + scoreRef.current);
        setScore(0);
        scoreRef.current = 0;
      } else {
        setScore((currentScore) => {
          const newScore = currentScore + 1;
          scoreRef.current = newScore;
          return newScore;
        });
      }
    }, 10);

    return () => clearInterval(isAlive);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", jump);
    return () => document.removeEventListener("keydown", jump);
  }, []);

  /* detecting when an animation restarts */
  useEffect(() => {
    const cactus = cactusRef.current;
    const handleAnimationIteration = () => {
      randomizeCactus();
    };

    cactus.addEventListener("animationiteration", handleAnimationIteration);

    return () => {
      cactus.removeEventListener("animationiteration", handleAnimationIteration);
    };
  }, []);

  return (
    <div className="game">
      Score : {score}
      <div id="dino" ref={dinoRef}></div>
      <div id="cactus" ref={cactusRef}>
        {Array.from({length: cactusCount}, (_, index) => (
          <div className="cactus" key={index}></div>
        ))}
      </div>
    </div>
  );
}

export default Dino;
