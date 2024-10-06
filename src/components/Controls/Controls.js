import React from "react";
import styles from "./Controls.module.css";
import { FaFilePdf, FaSync } from "react-icons/fa";

const Controls = ({
  searchTerm,
  setSearchTerm,
  generatePDF,
  resetDailyData,
}) => {
  return (
    <div className={styles.controls}>
      <input
        type="text"
        placeholder="Suche nach Task-Namen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBar}
      />
      <div className={styles.buttonGroup}>
        <button
          onClick={generatePDF}
          className={`${styles.button} ${styles.pdfButton}`}
        >
          <FaFilePdf /> PDF-Bericht
        </button>
        <button
          onClick={resetDailyData}
          className={`${styles.button} ${styles.resetButton}`}
        >
          <FaSync /> Daten Zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default Controls;
