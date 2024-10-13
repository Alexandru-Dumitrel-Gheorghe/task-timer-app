import React from "react";
import styles from "./Controls.module.css";
import { FaSearch, FaTimes } from "react-icons/fa"; // Import clear icon

const Controls = ({ searchTerm, setSearchTerm }) => {
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={styles.controls}>
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Suche nach Produktnamen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchBar}
          aria-label="Produktnamen suchen"
        />
        {searchTerm && (
          <FaTimes
            className={styles.clearIcon}
            onClick={handleClearSearch}
            aria-label="Suche löschen"
          />
        )}
      </div>
    </div>
  );
};

export default Controls;
