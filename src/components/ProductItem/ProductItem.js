import React from "react";
import styles from "./ProductItem.module.css";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";

const ProductItem = ({
  product,
  category,
  timer,
  handleStart,
  handlePause,
  handleStop,
  isCurrent,
  formatTime,
  isActive,
}) => {
  // Calculăm procentajul de progres (presupunând că `timeRequired` este în secunde)
  const totalRequiredTime = product.timeRequiredInSeconds || 1; // Evităm divizarea la zero
  const elapsedTime = timer?.seconds || 0;
  const progressPercentage = Math.min(
    (elapsedTime / totalRequiredTime) * 100,
    100
  );

  return (
    <div className={`${styles.productCard} ${isActive ? styles.active : ""}`}>
      <div className={styles.productHeader}>
        <h3 className={styles.productTitle}>{product.equipment}</h3>
        {product.articleNumber && (
          <span className={styles.articleNumber}>
            Artikel: {product.articleNumber}
          </span>
        )}
      </div>
      <div className={styles.productBody}>
        <div className={styles.productDetails}>
          <div className={styles.detailItem}>
            <AiOutlineClockCircle className={styles.icon} />
            <span>Benötigte Zeit: {product.timeRequired || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <AiOutlineClockCircle className={styles.icon} />
            <span>Arbeitszeit: {formatTime(timer?.seconds || 0)}</span>
          </div>
          {isCurrent && (
            <div className={styles.currentWork}>
              <strong>Aktuelle Arbeit läuft...</strong>
            </div>
          )}
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className={styles.productFooter}>
        <button
          onClick={() => handleStart(category, product._id)}
          disabled={timer?.isRunning}
          className={styles.startButton}
          title="Timer starten"
        >
          <FaPlay /> Start
        </button>
        <button
          onClick={() => handlePause(category, product._id)}
          disabled={!timer?.isRunning}
          className={styles.pauseButton}
          title="Timer pausieren"
        >
          <FaPause /> Pause
        </button>
        <button
          onClick={() => handleStop(category, product._id)}
          disabled={elapsedTime === 0}
          className={styles.stopButton}
          title="Timer stoppen"
        >
          <FaStop /> Stop
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
