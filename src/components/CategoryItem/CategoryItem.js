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
  const isTimerActive = category.products.some(
    (product) => timers[product._id]?.isRunning
  );

  return (
    <div className={styles.categoryContainer}>
      <div className={styles.categoryHeader} onClick={onToggle}>
        <h2 className={styles.categoryTitle}>
          {category.category}
          {isTimerActive && <FaRegClock className={styles.timerIndicator} />}
        </h2>
        <span className={styles.toggleIcon}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
      {isExpanded && (
        <div className={styles.productContainer}>
          {category.products.length > 0 ? (
            category.products.map((product) => (
              <ProductItem
                key={product._id}
                product={product}
                category={category.category}
                timer={timers[product._id]}
                handleStart={handleStart}
                handlePause={handlePause}
                handleStop={handleStop}
                isCurrent={currentWorkingProduct === product._id}
                formatTime={formatTime}
              />
            ))
          ) : (
            <div className={styles.noProducts}>
              Es gibt keine Produkte, die den Suchkriterien entsprechen.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
