// src/components/Sidebar/Sidebar.jsx
import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isSidebarOpen, closeSidebar }) => {
  return (
    <aside
      className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
    >
      <nav className={styles.sidebarNav}>
        <h2 className={styles.sidebarTitle}>Navigation</h2>{" "}
        {/* Titlu Sidebar */}
        <ul>
          <li>
            <a href="#products" onClick={closeSidebar}>
              Produkte
            </a>
          </li>
          <li>
            <a href="#settings" onClick={closeSidebar}>
              Einstellungen
            </a>
          </li>
          <li>
            <a href="#users" onClick={closeSidebar}>
              Benutzer
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
