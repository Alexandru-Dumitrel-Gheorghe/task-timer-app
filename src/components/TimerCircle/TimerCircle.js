// src/components/TimerCircle/TimerCircle.js
import React from "react";
import styles from "./TimerCircle.module.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const TimerCircle = ({ categories, formatTime }) => {
  // Finde das Produkt, das gerade läuft oder pausiert ist
  let runningProduct = null;
  for (const category of categories) {
    runningProduct = category.products.find(
      (product) => product.isRunning || product.status === "Pausiert"
    );
    if (runningProduct) break;
  }

  if (!runningProduct) return null;

  const elapsedTime = runningProduct.elapsedTime || 0;
  const timeRequiredInSeconds = convertTimeToSeconds(
    runningProduct.timeRequired
  );
  const percentage = timeRequiredInSeconds
    ? Math.min((elapsedTime / timeRequiredInSeconds) * 100, 100)
    : 0;

  // Bestimme die Farbe basierend auf dem Timerstatus
  const isPaused = runningProduct.status === "Pausiert";
  const pathColor = isPaused ? "#ff9800" : "#4b7bec"; // Farbe für Pause
  const displayText = isPaused ? "Pausiert" : formatTime(elapsedTime); // Anzuzeigender Text

  return (
    <div className={`${styles.timerContainer} ${styles.dynamicShadow}`}>
      <div className={styles.timerCircle}>
        <CircularProgressbar
          value={percentage}
          text={displayText} // Zeige den entsprechenden Text an
          styles={buildStyles({
            textColor: "#fff",
            pathColor: pathColor,
            trailColor: "#ddd",
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      <div className={styles.timerContent}>
        <span className={styles.timerProductName}>
          {runningProduct.equipment}
        </span>
        {runningProduct.articleNumber && (
          <span className={styles.timerArticleNumber}>
            Artikel: {runningProduct.articleNumber}
          </span>
        )}
        {runningProduct.timeRequired && (
          <span className={styles.timerTimeRequired}>
            Benötigte Zeit: {runningProduct.timeRequired}
          </span>
        )}
        {runningProduct.notes && (
          <span className={styles.timerNotes}>
            Notizen: {runningProduct.notes}
          </span>
        )}
      </div>
    </div>
  );
};

// Hilfsfunktion zur Umwandlung der Zeit in Sekunden
const convertTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const [hrs, mins, secs] = timeStr.split(":").map(Number);
  return hrs * 3600 + mins * 60 + secs;
};

export default TimerCircle;
