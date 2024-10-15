// src/components/ScrollToTop.jsx
import React, { useState, useEffect } from "react";
import styles from "./ScrollToTop.module.css";
import { FaArrowUp } from "react-icons/fa"; // Icon für den Button

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId = null;

    const toggleVisibility = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.pageYOffset > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 100); // Verzögerung von 100ms
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={styles.scrollToTop}
          aria-label="Nach oben scrollen"
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
