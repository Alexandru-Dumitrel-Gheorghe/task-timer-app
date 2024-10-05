// src/components/ProductList.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import styles from "./ProductList.module.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ProductChart from "./ProductChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaFilePdf,
  FaSync,
  FaPlay,
  FaPause,
  FaStop,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timers, setTimers] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [currentWorkingProduct, setCurrentWorkingProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use environment variable for API base URL
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch categories and products
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      console.log("API Response:", response.data);
      setCategories(response.data);
      initializeTimers(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Kategorien:", error);
      toast.error("Fehler beim Laden der Kategorien.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log("Categories:", categories);
  }, [categories]);

  const initializeTimers = (categoriesData) => {
    const newTimers = {};
    if (Array.isArray(categoriesData)) {
      categoriesData.forEach((category) => {
        if (Array.isArray(category.products)) {
          category.products.forEach((product) => {
            newTimers[product._id] = { seconds: 0, isRunning: false };
          });
        }
      });
    }
    setTimers(newTimers);
  };

  const handleToggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Update product status in the DB
  const updateTimerInDB = useCallback(
    async (category, productId, updateData) => {
      try {
        const url = `${API_BASE_URL}/products/${encodeURIComponent(
          category
        )}/${productId}`;
        await axios.put(url, updateData);
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Timers in der DB:", error);
        throw error;
      }
    },
    [API_BASE_URL]
  );

  const handleStart = async (category, productId) => {
    // Check if another timer is running
    const runningProduct = Object.keys(timers).find(
      (id) => timers[id].isRunning
    );
    if (runningProduct && runningProduct !== productId) {
      toast.error(
        "Ein anderer Timer läuft bereits. Bitte stoppen Sie ihn zuerst."
      );
      return;
    }

    setCurrentWorkingProduct(productId);
    setTimers((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], isRunning: true },
    }));

    const updateData = { status: "In Progress", elapsedTime: 0 };
    try {
      await updateTimerInDB(category, productId, updateData);
      toast.success("Timer gestartet!");
    } catch (error) {
      toast.error("Fehler beim Starten des Timers.");
    }
  };

  const handlePause = async (category, productId) => {
    setTimers((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], isRunning: false },
    }));

    const updateData = {
      status: "Paused",
      elapsedTime: timers[productId].seconds,
    };
    try {
      await updateTimerInDB(category, productId, updateData);
      toast.info("Timer pausiert.");
    } catch (error) {
      toast.error("Fehler beim Pausieren des Timers.");
    }
  };

  const handleStop = async (category, productId) => {
    const elapsedTime = timers[productId].seconds;
    setTimers((prev) => ({
      ...prev,
      [productId]: { seconds: 0, isRunning: false },
    }));

    const currentDate = new Date();

    // Find the product to get its details
    const product = categories
      .find((cat) => cat.category === category)
      ?.products.find((prod) => prod._id === productId);

    const productName = product?.equipment || "";

    setDailyData((prev) => [
      ...prev,
      {
        productId,
        date: currentDate.toISOString(),
        elapsedTime,
        productName,
        category: category,
        articleNumber: product?.articleNumber || "",
        timeRequired: product?.timeRequired || "",
      },
    ]);

    const updateData = { status: "Completed", elapsedTime };
    try {
      await updateTimerInDB(category, productId, updateData);
      toast.success("Timer gestoppt und Daten gespeichert.");
      setCurrentWorkingProduct(null);
    } catch (error) {
      toast.error("Fehler beim Stoppen des Timers.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updatedTimers = { ...prev };
        Object.keys(updatedTimers).forEach((productId) => {
          if (updatedTimers[productId].isRunning) {
            updatedTimers[productId].seconds += 1;
          }
        });
        return updatedTimers;
      });
    }, 1000);

    const resetAtMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const timeUntilMidnight = midnight.getTime() - now.getTime();
      if (timeUntilMidnight > 0) {
        setTimeout(() => {
          setTimers((prev) => {
            const resetTimers = { ...prev };
            Object.keys(resetTimers).forEach((productId) => {
              resetTimers[productId].seconds = 0;
              resetTimers[productId].isRunning = false;
              // Find the category of the product
              const productCategory = categories.find((cat) =>
                cat.products.some((prod) => prod._id === productId)
              );
              if (productCategory) {
                updateTimerInDB(productCategory.category, productId, {
                  status: "Not Started",
                  elapsedTime: 0,
                }).catch((error) => {
                  console.error("Fehler beim Zurücksetzen des Timers:", error);
                });
              }
            });
            toast.info("Die Zeit wurde um Mitternacht zurückgesetzt.");
            return resetTimers;
          });
        }, timeUntilMidnight);
      }
    };

    resetAtMidnight();

    return () => {
      clearInterval(interval);
    };
  }, [categories, updateTimerInDB]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Produkt Timer Bericht", 14, 16);
    const tableColumn = [
      "Kategorie",
      "Produkt",
      "Artikelnummer",
      "Benötigte Zeit",
      "Verbrachte Zeit",
      "Datum und Uhrzeit",
    ];
    const tableRows = [];

    // Include only completed products in the PDF
    dailyData.forEach((item) => {
      const formattedDate = new Date(item.date).toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      tableRows.push([
        item.category,
        item.productName,
        item.articleNumber || "N/A",
        item.timeRequired,
        formatTime(item.elapsedTime),
        formattedDate,
      ]);
    });

    if (tableRows.length === 0) {
      toast.warn("Keine Daten zum Generieren des PDF-Berichts.");
      return;
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("produkt-timer-bericht.pdf");
    toast.success("PDF-Bericht erfolgreich generiert.");
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const resetDailyData = () => {
    setDailyData([]);
    toast.info("Die täglichen Daten wurden zurückgesetzt.");
  };

  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    if (!searchTerm) return categories;
    return categories
      .map((category) => ({
        ...category,
        products: Array.isArray(category.products)
          ? category.products.filter((product) =>
              product.equipment.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : [],
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, searchTerm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${styles.dashboard} ${isDarkMode ? styles.darkMode : ""}`}>
      <ToastContainer />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Produkt Timer</h2>
          <div className={styles.headerActions}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={styles.toggleThemeButton}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={styles.toggleSidebarButton}
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <nav className={styles.sidebarNav}>
          <ul>
            <li>
              <a href="#products">Produkte</a>
            </li>
            <li>
              <a href="#settings">Einstellungen</a>
            </li>
            <li>
              <a href="#users">Benutzer</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Controls Section */}
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Suche nach Task-Namen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
          <div className={styles.buttonGroup}>
            <button onClick={generatePDF} className={styles.pdfButton}>
              <FaFilePdf /> PDF-Bericht
            </button>
            <button onClick={resetDailyData} className={styles.resetButton}>
              <FaSync /> Daten Zurücksetzen
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className={styles.contentWrapper}>
          {/* Product List */}
          <section className={styles.productSection}>
            <div className={styles.categoryList}>
              {filteredCategories.map((category) => (
                <div key={category.category} className={styles.categoryItem}>
                  <h3 onClick={() => handleToggleCategory(category.category)}>
                    {category.category}
                    <span className={styles.toggleIcon}>
                      {expandedCategory === category.category ? "-" : "+"}
                    </span>
                  </h3>
                  {expandedCategory === category.category && (
                    <ul className={styles.productList}>
                      {category.products.length > 0 ? (
                        category.products.map((product) => (
                          <li key={product._id} className={styles.productItem}>
                            <div className={styles.productInfo}>
                              <strong>{product.equipment}</strong>{" "}
                              <span className={styles.article}>
                                (Artikel: {product.articleNumber || "N/A"})
                              </span>
                              <div>
                                <span>
                                  Benötigte Zeit: {product.timeRequired}
                                </span>
                              </div>
                              <div>
                                <span>
                                  Arbeitszeit:{" "}
                                  {formatTime(
                                    timers[product._id]?.seconds || 0
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className={styles.buttonContainer}>
                              <button
                                onClick={() =>
                                  handleStart(category.category, product._id)
                                }
                                disabled={timers[product._id]?.isRunning}
                                className={styles.startButton}
                                title="Timer starten"
                              >
                                <FaPlay /> Start
                              </button>
                              <button
                                onClick={() =>
                                  handlePause(category.category, product._id)
                                }
                                disabled={!timers[product._id]?.isRunning}
                                className={styles.pauseButton}
                                title="Timer pausieren"
                              >
                                <FaPause /> Pause
                              </button>
                              <button
                                onClick={() =>
                                  handleStop(category.category, product._id)
                                }
                                disabled={timers[product._id]?.seconds === 0}
                                className={styles.stopButton}
                                title="Timer stoppen"
                              >
                                <FaStop /> Stop
                              </button>
                            </div>
                            {currentWorkingProduct === product._id && (
                              <div className={styles.currentWorkingInfo}>
                                <strong>Aktuelle Arbeit:</strong>{" "}
                                {formatTime(timers[product._id]?.seconds || 0)}
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className={styles.noProducts}>
                          Es gibt keine Produkte, die den Suchkriterien
                          entsprechen.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Chart Section */}
          <section className={styles.chartSection}>
            <ProductChart dailyData={dailyData} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProductList;
