import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import axiosInstance from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "notistack"; // Import useSnackbar

// Import components
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import TimerCircle from "./TimerCircle/TimerCircle";
import Controls from "./Controls/Controls";
import CategoryList from "./CategoryList/CategoryList";
import ChartSection from "./ChartSection/ChartSection";
import CalendarSection from "./Calendar/CalendarSection";
import Loading from "./Loading/Loading";
import NoteModal from "./NoteModal/NoteModal"; // Import NoteModal
import { AuthContext } from "../context/AuthContext";

const ProductList = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Use Snackbar for notifications

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for NoteModal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  // Function to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products");
      console.log("API Antwort (categorii):", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Kategorien:", error);
      setCategories([]);
      enqueueSnackbar("Fehler beim Laden der Kategorien.", {
        variant: "error",
      }); // Error notification
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user && user._id) {
      const savedDailyData = localStorage.getItem(`dailyData_${user._id}`);
      if (savedDailyData) {
        try {
          setDailyData(JSON.parse(savedDailyData));
        } catch (error) {
          console.error("Fehler beim Parsen der täglichen Daten:", error);
          setDailyData([]);
          localStorage.removeItem(`dailyData_${user._id}`);
        }
      }
      fetchCategories();
    }
  }, [fetchCategories, isAuthenticated, navigate, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchCategories();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchCategories, isAuthenticated]);

  const handleToggleCategory = (category) => {
    console.log("Toggling category:", category);
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleStart = async (category, productId) => {
    console.log(
      "Starting timer for category:",
      category,
      "and product:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(
        category
      )}/${productId}/start`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer gestartet!", { variant: "success" }); // Success notification
      fetchCategories();
    } catch (error) {
      console.error("Fehler beim Starten des Timers:", error);
      enqueueSnackbar("Fehler beim Starten des Timers.", { variant: "error" }); // Error notification
    }
  };

  const handlePause = async (category, productId) => {
    console.log(
      "Pausing timer for category:",
      category,
      "and product:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(
        category
      )}/${productId}/pause`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer pausiert.", { variant: "info" }); // Info notification
      fetchCategories();
    } catch (error) {
      console.error("Fehler beim Pausieren des Timers:", error);
      enqueueSnackbar("Fehler beim Pausieren des Timers.", {
        variant: "error",
      }); // Error notification
    }
  };

  const handleStop = async (category, productId) => {
    console.log(
      "Stopping timer for category:",
      category,
      "and product:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(category)}/${productId}/stop`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer gestoppt und Daten gespeichert.", {
        variant: "success",
      }); // Success notification
      fetchCategories();

      const currentDate = new Date();
      const product = categories
        .find((cat) => cat.category === category)
        ?.products.find((prod) => prod._id === productId);

      const productName = product?.equipment || "";

      const newEntry = {
        id: uuidv4(),
        productId,
        date: currentDate.toISOString(),
        elapsedTime: product?.elapsedTime || 0,
        productName,
        category,
        articleNumber: product?.articleNumber || "",
        timeRequired: product?.timeRequired || "",
        notes: [], // Initialize notes as an empty array
      };

      setDailyData((prev) => {
        const newData = [...prev, newEntry];
        try {
          localStorage.setItem(
            `dailyData_${user._id}`,
            JSON.stringify(newData)
          );
        } catch (error) {
          console.error("Fehler beim Speichern der täglichen Daten:", error);
        }
        return newData;
      });

      setNotifications((prev) => [
        ...prev,
        `Timer für ${productName} erfolgreich gestoppt. Verstrichene Zeit: ${formatTime(
          product?.elapsedTime || 0
        )}`,
      ]);

      // Open the NoteModal and set currentEntryId
      setCurrentEntryId(newEntry.id);
      setIsNoteModalOpen(true);
    } catch (error) {
      console.error("Fehler beim Stoppen des Timers:", error);
      enqueueSnackbar("Fehler beim Stoppen des Timers.", { variant: "error" }); // Error notification
    }
  };

  const handleSubmitNote = (note) => {
    if (currentEntryId) {
      setDailyData((prevData) => {
        const updatedData = prevData.map((item) => {
          if (item.id === currentEntryId) {
            return {
              ...item,
              notes: [...(item.notes || []), note],
            };
          }
          return item;
        });
        localStorage.setItem(
          `dailyData_${user._id}`,
          JSON.stringify(updatedData)
        );
        return updatedData;
      });
      enqueueSnackbar("Notiz hinzugefügt!", { variant: "success" });
      setIsNoteModalOpen(false);
      setCurrentEntryId(null);
    }
  };

  const generatePDF = () => {
    if (dailyData.length === 0) {
      enqueueSnackbar(
        "Keine Daten verfügbar, um einen PDF-Bericht zu erstellen.",
        { variant: "warning" }
      );
      return;
    }

    const doc = new jsPDF();
    doc.text("Produkt-Timer-Bericht", 14, 16);

    const tableColumn = [
      "Kategorie",
      "Produkt",
      "Artikelnummer",
      "Benötigte Zeit",
      "Verstrichene Zeit",
      "Datum & Uhrzeit",
      "Notizen",
    ];

    const tableRows = dailyData.map((item) => {
      const formattedDate = new Date(item.date).toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        item.category,
        item.productName,
        item.articleNumber || "N/A",
        formatTime(item.timeRequired),
        formatTime(item.elapsedTime),
        formattedDate,
        item.notes ? item.notes.join(", ") : "N/A",
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Produkt-Timer-Bericht.pdf");
    enqueueSnackbar("PDF-Bericht erfolgreich erstellt.", {
      variant: "success",
    }); // Success notification
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const resetDailyData = () => {
    setDailyData([]);
    try {
      localStorage.removeItem(`dailyData_${user._id}`);
    } catch (error) {
      console.error("Fehler beim Entfernen der täglichen Daten:", error);
    }
    enqueueSnackbar("Tägliche Daten wurden zurückgesetzt.", {
      variant: "info",
    }); // Info notification
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

  // Format selected date
  const formattedSelectedDate = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    return dailyData.filter((item) =>
      item.date.startsWith(formattedSelectedDate)
    );
  }, [dailyData, formattedSelectedDate]);

  // Derive runningData from categories
  const runningData = useMemo(() => {
    return categories.flatMap((category) =>
      category.products
        .filter((product) => product.isRunning)
        .map((product) => ({
          productId: product._id,
          category: category.category,
          date: product.date, // Assuming 'date' represents the start time
          elapsedTime: product.elapsedTime, // Assuming backend updates 'elapsedTime' periodically
          productName: product.equipment,
          articleNumber: product.articleNumber,
          timeRequired: product.timeRequired,
          notes: product.notes,
        }))
    );
  }, [categories]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user || !user._id) {
    return <Loading />;
  }

  return (
    <div className={`${styles.dashboard} ${isDarkMode ? styles.darkMode : ""}`}>
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        notifications={notifications}
        categories={categories} // Pass categories if Header uses them
      />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        generatePDF={generatePDF}
        resetDailyData={resetDailyData}
      />

      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <TimerCircle categories={categories} formatTime={formatTime} />

      <main className={styles.mainContent}>
        <Controls searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className={styles.contentWrapper}>
          <CategoryList
            categories={filteredCategories}
            expandedCategory={expandedCategory}
            handleToggleCategory={handleToggleCategory}
            handleStart={handleStart}
            handlePause={handlePause}
            handleStop={handleStop}
            formatTime={formatTime}
          />

          {/* Pass filteredData and runningData to ChartSection */}
          <ChartSection dailyData={filteredData} runningData={runningData} />

          {/* Pass selectedDate, setSelectedDate, dailyData, and runningData to CalendarSection */}
          <CalendarSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dailyData={dailyData}
            runningData={runningData}
          />
        </div>
      </main>

      {/* Include the NoteModal here */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onRequestClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleSubmitNote}
      />
    </div>
  );
};

export default ProductList;
