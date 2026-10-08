import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const [score, setScore] = useState(0);
  const [cactusCount, setCactusCount] = useState(1);

  const jump = () => {
    if (!!dinoRef.current && dinoRef.current.classList != "jump") {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        dinoRef.current.classList.remove("jump");
      }, 300);
    }
  };

  /* randomizing cactuses */
  const randomizeCactus = () => {
    const count = Math.floor(Math.random() * 3) + 1;
    setCactusCount(count);
  }

  useEffect(() => {
    const isAlive = setInterval(function () {
      // get current dino Y position
      const dinoTop = parseInt(
        getComputedStyle(dinoRef.current).getPropertyValue("top")
      );

      // get current cactus X position
      let cactusLeft = parseInt(
        getComputedStyle(cactusRef.current).getPropertyValue("left")
      );

      // detect collision
      if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
        // collision
        alert("Game Over! Your Score : " + score);
        setScore(0);
      } else {
        setScore(score + 1);
      }
    }, 10);

    return () => clearInterval(isAlive);
  });

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
