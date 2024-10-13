// src/components/Loading/Loading.js
import React from "react";
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>Lädt...</p>
    </div>
  );
};

export default Loading;
