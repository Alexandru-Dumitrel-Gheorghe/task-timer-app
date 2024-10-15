// src/components/CategoryList.jsx
import React, { useState, useEffect } from "react";
import styles from "./CategoryList.module.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaPause,
  FaStop,
  FaStickyNote,
} from "react-icons/fa";
import PropTypes from "prop-types";

const CategoryList = ({
  categories,
  expandedCategory,
  handleToggleCategory,
  handleStart,
  handlePause,
  handleStop,
  formatTime,
}) => {
  const [activeProduct, setActiveProduct] = useState(null);

  // Load activeProduct from server or state if needed (Optional)
  useEffect(() => {
    const storedActiveProduct = localStorage.getItem("activeProduct");
    if (storedActiveProduct) {
      try {
        const parsedProduct = JSON.parse(storedActiveProduct);
        // Check if the product still exists in categories
        const productExists = categories.some((category) =>
          category.products.some(
            (product) => product._id === parsedProduct.productId
          )
        );
        if (productExists) {
          setActiveProduct(parsedProduct);
        } else {
          localStorage.removeItem("activeProduct");
        }
      } catch (error) {
        console.error("Error parsing activeProduct from localStorage:", error);
        localStorage.removeItem("activeProduct");
      }
    }
  }, [categories]);

  // Save activeProduct to localStorage when it changes (Optional)
  useEffect(() => {
    if (activeProduct) {
      localStorage.setItem("activeProduct", JSON.stringify(activeProduct));
    } else {
      localStorage.removeItem("activeProduct");
    }
  }, [activeProduct]);

  const handleStartClick = (category, productId) => {
    handleStart(category, productId);
    setActiveProduct({ category, productId });
  };

  const handlePauseClick = (category, productId) => {
    handlePause(category, productId);
    setActiveProduct(null);
  };

  const handleStopClick = (category, productId) => {
    handleStop(category, productId);
    setActiveProduct(null);
  };

  return (
    <div className={styles.categoryList}>
      {categories.map((category) => {
        const isExpanded = expandedCategory === category.category;
        const activeProductInCategory =
          activeProduct && activeProduct.category === category.category
            ? category.products.find(
                (product) => product._id === activeProduct.productId
              )
            : null;

        return (
          <div key={category._id} className={styles.categoryCard}>
            <div
              className={styles.categoryHeader}
              onClick={() => handleToggleCategory(category.category)}
            >
              <h3 className={styles.categoryTitle}>
                {category.category}
                {activeProductInCategory && (
                  <span className={styles.activeProductLabel}>
                    - {activeProductInCategory.equipment} läuft
                  </span>
                )}
              </h3>
              <span className={styles.toggleIcon}>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {isExpanded && (
              <div className={styles.productList}>
                {category.products.map((product) => (
                  <div
                    key={product._id}
                    className={`${styles.productCard} ${
                      activeProduct && activeProduct.productId === product._id
                        ? styles.active
                        : ""
                    }`}
                  >
                    <div className={styles.productInfo}>
                      <div className={styles.productHeader}>
                        <h4 className={styles.productName}>
                          {product.equipment}
                        </h4>
                        {product.notes && product.notes.length > 0 && (
                          <FaStickyNote
                            className={styles.noteIcon}
                            title={product.notes.join(", ")}
                          />
                        )}
                      </div>
                      <div className={styles.productDetails}>
                        {product.articleNumber && (
                          <div className={styles.productDetailItem}>
                            <strong>Artikelnummer:</strong>{" "}
                            {product.articleNumber}
                          </div>
                        )}
                        {product.timeRequired && (
                          <div className={styles.productDetailItem}>
                            <strong>Benötigte Zeit:</strong>{" "}
                            {product.timeRequired}
                          </div>
                        )}
                        <div className={styles.productDetailItem}>
                          <strong>Verbrachte Zeit:</strong>{" "}
                          {formatTime(product.elapsedTime || 0)}
                        </div>
                      </div>
                      <div className={styles.productActions}>
                        {product.isRunning ? (
                          <>
                            <button
                              className={`${styles.actionButton} ${styles.pauseButton}`}
                              onClick={() =>
                                handlePauseClick(category.category, product._id)
                              }
                            >
                              <FaPause /> Pause
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.stopButton}`}
                              onClick={() =>
                                handleStopClick(category.category, product._id)
                              }
                            >
                              <FaStop /> Stop
                            </button>
                          </>
                        ) : (
                          <button
                            className={`${styles.actionButton} ${styles.startButton}`}
                            onClick={() =>
                              handleStartClick(category.category, product._id)
                            }
                          >
                            <FaPlay /> Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
  expandedCategory: PropTypes.string,
  handleToggleCategory: PropTypes.func.isRequired,
  handleStart: PropTypes.func.isRequired,
  handlePause: PropTypes.func.isRequired,
  handleStop: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
};

export default CategoryList;
