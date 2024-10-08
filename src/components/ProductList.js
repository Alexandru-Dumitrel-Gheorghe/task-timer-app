import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components correctly according to your project structure
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import TimerCircle from "./TimerCircle/TimerCircle";
import Controls from "./Controls/Controls";
import CategoryList from "./CategoryList/CategoryList";
import ChartSection from "./ChartSection/ChartSection";
import Loading from "./Loading/Loading";

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
  const [notifications, setNotifications] = useState([]);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const savedTimers = localStorage.getItem("timers");
      const savedDailyData = localStorage.getItem("dailyData");

      if (savedTimers) {
        setTimers(JSON.parse(savedTimers));
      }

      if (savedDailyData) {
        setDailyData(JSON.parse(savedDailyData));
      }

      fetchCategories();
    }
  }, [fetchCategories, navigate]);

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

  const updateTimerInDB = useCallback(
    async (category, productId, updateData) => {
      try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/products/${encodeURIComponent(
          category
        )}/${productId}`;
        await axios.put(url, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Timers in der DB:", error);
        throw error;
      }
    },
    [API_BASE_URL]
  );

  const handleStart = async (category, productId) => {
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
    setTimers((prev) => {
      const updatedTimers = {
        ...prev,
        [productId]: { ...prev[productId], isRunning: true },
      };
      localStorage.setItem("timers", JSON.stringify(updatedTimers));
      return updatedTimers;
    });

    const updateData = { status: "In Bearbeitung", elapsedTime: 0 };
    try {
      await updateTimerInDB(category, productId, updateData);
      toast.success("Timer gestartet!");
    } catch (error) {
      toast.error("Fehler beim Starten des Timers.");
    }
  };

  const handlePause = async (category, productId) => {
    setTimers((prev) => {
      const updatedTimers = {
        ...prev,
        [productId]: { ...prev[productId], isRunning: false },
      };
      localStorage.setItem("timers", JSON.stringify(updatedTimers));
      return updatedTimers;
    });

    const updateData = {
      status: "Pausiert",
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
    setTimers((prev) => {
      const updatedTimers = {
        ...prev,
        [productId]: { seconds: 0, isRunning: false },
      };
      localStorage.setItem("timers", JSON.stringify(updatedTimers));
      return updatedTimers;
    });

    const currentDate = new Date();
    const product = categories
      .find((cat) => cat.category === category)
      ?.products.find((prod) => prod._id === productId);

    const productName = product?.equipment || "";

    setDailyData((prev) => {
      const newData = [
        ...prev,
        {
          productId,
          date: currentDate.toISOString(),
          elapsedTime,
          productName,
          category: category,
          articleNumber: product?.articleNumber || "",
          timeRequired: product?.timeRequired || "",
          notes: product?.notes || "",
        },
      ];
      localStorage.setItem("dailyData", JSON.stringify(newData));
      return newData;
    });

    const updateData = { status: "Abgeschlossen", elapsedTime };
    try {
      await updateTimerInDB(category, productId, updateData);
      toast.success("Timer gestoppt und Daten gespeichert.");
      setCurrentWorkingProduct(null);
      setNotifications((prev) => [
        ...prev,
        `Timer für ${productName} wurde erfolgreich gestoppt. Verbrachte Zeit: ${formatTime(
          elapsedTime
        )}`,
      ]);
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
        localStorage.setItem("timers", JSON.stringify(updatedTimers));
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
              const productCategory = categories.find((cat) =>
                cat.products.some((prod) => prod._id === productId)
              );
              if (productCategory) {
                updateTimerInDB(productCategory.category, productId, {
                  status: "Nicht gestartet",
                  elapsedTime: 0,
                }).catch((error) => {
                  console.error("Fehler beim Zurücksetzen des Timers:", error);
                });
              }
            });
            toast.info("Die Zeit wurde um Mitternacht zurückgesetzt.");
            localStorage.setItem("timers", JSON.stringify(resetTimers));
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
    doc.text("Produkt-Timer-Bericht", 14, 16);
    const tableColumn = [
      "Kategorie",
      "Produkt",
      "Artikelnummer",
      "Benötigte Zeit",
      "Verbrachte Zeit",
      "Datum und Uhrzeit",
      "Notizen",
    ];
    const tableRows = [];

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
        item.notes || "N/A",
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
    localStorage.setItem("dailyData", JSON.stringify([]));
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
    return <Loading />;
  }

  return (
    <div className={`${styles.dashboard} ${isDarkMode ? styles.darkMode : ""}`}>
      <ToastContainer />

      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        notifications={notifications}
      />

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Timer Circle */}
      <TimerCircle
        currentWorkingProduct={currentWorkingProduct}
        categories={categories}
        timers={timers}
        formatTime={formatTime}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Controls Section */}
        <Controls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          generatePDF={generatePDF}
          resetDailyData={resetDailyData}
        />

        {/* Content Wrapper */}
        <div className={styles.contentWrapper}>
          {/* Product List */}
          <CategoryList
            categories={filteredCategories}
            expandedCategory={expandedCategory}
            handleToggleCategory={handleToggleCategory}
            timers={timers}
            handleStart={handleStart}
            handlePause={handlePause}
            handleStop={handleStop}
            currentWorkingProduct={currentWorkingProduct}
            formatTime={formatTime}
          />

          {/* Chart Section */}
          <ChartSection dailyData={dailyData} />
        </div>
      </main>
    </div>
  );
};

export default ProductList;
