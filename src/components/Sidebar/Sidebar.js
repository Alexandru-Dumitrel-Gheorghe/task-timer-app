import React from "react";
import styles from "./Sidebar.module.css";
import { FaFilePdf, FaSync } from "react-icons/fa";

const Sidebar = ({
  isSidebarOpen,
  closeSidebar,
  generatePDF,
  resetDailyData,
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
    >
      <nav className={styles.sidebarNav}>
        <h2 className={styles.sidebarTitle}>Navigation</h2>
        <ul className={styles.navList}>
          <li>
            <a
              href="#products"
              className={styles.navItem}
              onClick={closeSidebar}
            >
              Produkte
            </a>
          </li>
          <li>
            <a
              href="#settings"
              className={styles.navItem}
              onClick={closeSidebar}
            >
              Einstellungen
            </a>
          </li>
          <li>
            <a href="#users" className={styles.navItem} onClick={closeSidebar}>
              Benutzer
            </a>
          </li>
        </ul>
        <div className={styles.buttonGroup}>
          <button
            onClick={generatePDF}
            className={`${styles.button} ${styles.pdfButton}`}
            aria-label="PDF-Bericht generieren"
          >
            <FaFilePdf className={styles.buttonIcon} /> PDF-Bericht
          </button>
          <button
            onClick={resetDailyData}
            className={`${styles.button} ${styles.resetButton}`}
            aria-label="Daten zurücksetzen"
          >
            <FaSync className={styles.buttonIcon} /> Daten Zurücksetzen
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
