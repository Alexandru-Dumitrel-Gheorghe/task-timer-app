// Header.js
import React, { useState } from "react";
import styles from "./Header.module.css";
import {
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa"; // Importiere das Logout-Icon
import { useNavigate } from "react-router-dom"; // Importiere useNavigate für die Navigation
import { toast } from "react-toastify"; // Importiere toast für Benachrichtigungen

const Header = ({
  isDarkMode,
  toggleDarkMode,
  isSidebarOpen,
  toggleSidebar,
  notifications, // Benachrichtigungen als Prop
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate(); // Initialisiere navigate

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    // Entferne Token und andere Daten aus localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("timers");
    localStorage.removeItem("dailyData");
    // Zeige eine Erfolgsmeldung an
    toast.success("Du wurdest erfolgreich abgemeldet.");
    // Navigiere zur Login-Seite
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h2>Produkt Timer</h2>
        <div className={styles.headerActions}>
          <button
            onClick={toggleDarkMode}
            className={styles.toggleThemeButton}
            title="Dark Mode umschalten"
            aria-label="Dark Mode umschalten"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={toggleSidebar}
            className={styles.toggleSidebarButton}
            title="Seitenleiste umschalten"
            aria-label="Seitenleiste umschalten"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <button
            onClick={toggleNotifications}
            className={styles.toggleNotificationsButton}
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
          {/* Hinzufügen des Logout-Buttons */}
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            title="Abmelden"
            aria-label="Abmelden"
          >
            <FaSignOutAlt /> {/* Icon für Logout */}
            <span className={styles.logoutText}>Abmelden</span>
          </button>
        </div>
      </div>
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
    </header>
  );
};

export default Header;
