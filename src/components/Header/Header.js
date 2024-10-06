import React, { useState } from "react";
import styles from "./Header.module.css";
import { FaMoon, FaSun, FaBars, FaTimes, FaBell } from "react-icons/fa";

const Header = ({
  isDarkMode,
  toggleDarkMode,
  isSidebarOpen,
  toggleSidebar,
  notifications, // Add notifications as a prop
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h2>Produkt Timer</h2>
        <div className={styles.headerActions}>
          <button
            onClick={toggleDarkMode}
            className={styles.toggleThemeButton}
            title="Toggle Dark Mode"
            aria-label="Schimbare mod întunecat"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={toggleSidebar}
            className={styles.toggleSidebarButton}
            title="Toggle Sidebar"
            aria-label="Schimbare sidebar"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <button
            onClick={toggleNotifications}
            className={styles.toggleNotificationsButton}
            title="Notificări"
            aria-label="Notificări"
          >
            <FaBell />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>
                {notifications.length}
              </span>
            )}
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
