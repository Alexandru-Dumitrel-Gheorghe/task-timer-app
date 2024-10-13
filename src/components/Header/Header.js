// src/components/Header/Header.js
import React, { useState } from "react";
import styles from "./Header.module.css";
import {
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack"; // Importăm hook-ul pentru notificări

const Header = ({
  isDarkMode,
  toggleDarkMode,
  isSidebarOpen,
  toggleSidebar,
  notifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Folosim hook-ul pentru notificări

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    // Eliminăm token-ul de autentificare din localStorage
    localStorage.removeItem("token");
    // Afișăm notificarea de succes la deconectare
    enqueueSnackbar("Du wurdest erfolgreich abgemeldet.", {
      variant: "success",
    });
    // Navigăm către pagina de login
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <h2>Arbeitszeit</h2>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={toggleDarkMode}
            className={styles.iconButton}
            title="Wechseln Sie den Dunkelmodus"
            aria-label="Wechseln Sie den Dunkelmodus"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={toggleSidebar}
            className={styles.iconButton}
            title="Seitenleiste umschalten"
            aria-label="Seitenleiste umschalten"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className={styles.notificationWrapper}>
            <button
              onClick={toggleNotifications}
              className={styles.iconButton}
              title="Benachrichtigungen"
              aria-label="Benachrichtigungen"
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <h4>Benachrichtigungen</h4>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className={styles.notificationItem}>
                      {notification}
                    </div>
                  ))
                ) : (
                  <div className={styles.notificationItem}>
                    Es gibt keine Benachrichtigungen.
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            title="Abmelden"
            aria-label="Abmelden"
          >
            <FaSignOutAlt />
            <span className={styles.logoutText}>Abmelden</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
