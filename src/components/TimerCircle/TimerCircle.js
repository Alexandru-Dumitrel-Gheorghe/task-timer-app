import React from "react";
import styles from "./TimerCircle.module.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const TimerCircle = ({
  currentWorkingProduct,
  categories,
  timers,
  formatTime,
}) => {
  if (!currentWorkingProduct) return null;

  const category = categories.find((cat) =>
    cat.products.some((prod) => prod._id === currentWorkingProduct)
  );

  const product = category?.products.find(
    (prod) => prod._id === currentWorkingProduct
  );

  if (!product) return null;

  const elapsedTime = timers[currentWorkingProduct]?.seconds || 0;
  const timeRequired = product.timeRequiredInSeconds || 1;

  const percentage = Math.min((elapsedTime / timeRequired) * 100, 100);

  return (
    <div className={`${styles.timerContainer} ${styles.dynamicShadow}`}>
      <div className={styles.timerCircle}>
        <CircularProgressbar
          value={percentage}
          text={`${formatTime(elapsedTime)}`}
          styles={buildStyles({
            textColor: "#fff",
            pathColor: "#4b7bec",
            trailColor: "#ddd",
            pathTransitionDuration: 0.5, // Tranziție lină a progresului
          })}
        />
      </div>
      <div className={styles.timerContent}>
        <span className={styles.timerProductName}>{product.equipment}</span>
        {product.articleNumber && (
          <span className={styles.timerArticleNumber}>
            Artikel: {product.articleNumber}
          </span>
        )}
        {product.timeRequired && (
          <span className={styles.timerTimeRequired}>
            Benötigte Zeit: {product.timeRequired}
          </span>
        )}
        {product.notes && (
          <span className={styles.timerNotes}>Notizen: {product.notes}</span>
        )}
      </div>
    </div>
  );
};

export default TimerCircle;
