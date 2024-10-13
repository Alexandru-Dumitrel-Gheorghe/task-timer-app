import React, { useState, useEffect } from "react";
import styles from "./CategoryList.module.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaPause,
  FaStop,
  FaInfoCircle,
} from "react-icons/fa";
import NoteModal from "../NoteModal/NoteModal"; // Import the NoteModal

const CategoryList = ({
  categories,
  expandedCategory,
  handleToggleCategory,
  handleStart,
  handlePause,
  handleStop,
  formatTime,
  addNote, // Prop for adding notes
}) => {
  const [activeProduct, setActiveProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");

  // Load activeProduct from localStorage on mount
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

  // Save activeProduct to localStorage when it changes
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
    setCurrentProductId(productId);
    setIsModalOpen(true); // Open the modal when stopping
    handleStop(category, productId);
    setActiveProduct(null);
  };

  const handleSubmitNote = (note) => {
    addNote({
      productId: currentProductId,
      note,
    });
    setIsModalOpen(false); // Close the modal after submission
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
                <FaInfoCircle className={styles.headerIcon} />
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
                      <div className={styles.productDetails}>
                        <h4 className={styles.productName}>
                          {product.equipment}
                        </h4>
                        <div className={styles.productDetailItem}>
                          <FaInfoCircle className={styles.detailIcon} />
                          Artikelnummer: {product.articleNumber}
                        </div>
                        <div className={styles.productDetailItem}>
                          ⏱ Benötigte Zeit: {product.timeRequired}
                        </div>
                        <div className={styles.productDetailItem}>
                          ⏳ Verbrachte Zeit:{" "}
                          {formatTime(product.elapsedTime || 0)}
                        </div>
                        {product.notes && (
                          <div className={styles.productNotes}>
                            📝 {product.notes}
                          </div>
                        )}
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

      {/* Include the NoteModal for adding notes */}
      <NoteModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitNote}
      />
    </div>
  );
};

export default CategoryList;
