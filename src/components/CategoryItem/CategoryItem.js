// src/components/CategoryItem/CategoryItem.jsx
import React from "react";
import styles from "./CategoryItem.module.css";
import { FaChevronDown, FaChevronUp, FaRegClock } from "react-icons/fa";
import ProductItem from "../ProductItem/ProductItem";

const CategoryItem = ({
  category,
  isExpanded,
  onToggle,
  timers,
  handleStart,
  handlePause,
  handleStop,
  currentWorkingProduct,
  formatTime,
}) => {
  // Verificăm dacă un timer este activ în categoria curentă
  const isTimerActive = category.products.some(
    (product) => timers[product._id]?.isRunning
  );

  return (
    <div className={styles.categoryContainer}>
      <div
        className={styles.categoryHeader}
        onClick={onToggle}
        aria-label={isExpanded ? "Kategorie geschlossen" : "Kategorie geöffnet"}
      >
        <h2 className={styles.categoryTitle}>
          {category.category}
          {/* Afișează simbolul ceasului dacă un timer este activ */}
          {isTimerActive && (
            <FaRegClock className={styles.timerIndicator} title="Timer aktiv" />
          )}
        </h2>
        <span className={styles.toggleIcon}>
          {/* Afișează simbolul pentru extindere/compresie */}
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {/* Afișează produsele dacă categoria este extinsă */}
      {isExpanded && (
        <div className={styles.productContainer}>
          {/* Verificăm dacă există produse în categorie */}
          {category.products.length > 0 ? (
            category.products.map((product) => (
              <ProductItem
                key={product._id}
                product={product}
                category={category.category}
                timer={timers[product._id]} // Statusul timerului pentru produsul curent
                handleStart={handleStart} // Funcția pentru a începe timerul
                handlePause={handlePause} // Funcția pentru a suspenda timerul
                handleStop={handleStop} // Funcția pentru a opri timerul
                isCurrent={currentWorkingProduct === product._id} // Verificăm dacă produsul curent este activ
                formatTime={formatTime} // Formatul timpului
              />
            ))
          ) : (
            <div className={styles.noProducts}>
              Keine Produkte entsprechen den Suchkriterien.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
