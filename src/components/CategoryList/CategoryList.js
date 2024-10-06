import React from "react";
import styles from "./CategoryList.module.css";
import CategoryItem from "../CategoryItem/CategoryItem";

const CategoryList = ({
  categories,
  expandedCategory,
  handleToggleCategory,
  timers,
  handleStart,
  handlePause,
  handleStop,
  currentWorkingProduct,
  formatTime,
}) => {
  return (
    <section className={styles.productSection}>
      <h2 className={styles.sectionTitle}>Kategorien</h2>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <CategoryItem
            key={category.category}
            category={category}
            isExpanded={expandedCategory === category.category}
            onToggle={() => handleToggleCategory(category.category)}
            timers={timers}
            handleStart={handleStart}
            handlePause={handlePause}
            handleStop={handleStop}
            currentWorkingProduct={currentWorkingProduct}
            formatTime={formatTime}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
