// src/components/ProductList.jsx
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
import { useSnackbar } from "notistack"; // Importiere useSnackbar

// Importiere Komponenten
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import TimerCircle from "./TimerCircle/TimerCircle";
import Controls from "./Controls/Controls";
import CategoryList from "./CategoryList/CategoryList";
import ChartSection from "./ChartSection/ChartSection";
import CalendarSection from "./Calendar/CalendarSection";
import Loading from "./Loading/Loading";
import NoteModal from "./NoteModal/NoteModal"; // Importiere NoteModal
import { AuthContext } from "../context/AuthContext";

const ProductList = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Verwende Snackbar für Benachrichtigungen

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Zustand für ausgewähltes Datum
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Zustand für NoteModal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  // Funktion zum Abrufen der Kategorien
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products");
      console.log("API Antwort (Kategorien):", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Kategorien:", error);
      setCategories([]);
      enqueueSnackbar("Fehler beim Laden der Kategorien.", {
        variant: "error",
      }); // Fehlermeldung
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
          const parsedData = JSON.parse(savedDailyData).map((event) => ({
            ...event,
            notes: Array.isArray(event.notes) ? event.notes : [],
          }));
          setDailyData(parsedData);
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
    console.log("Kategorie umschalten:", category);
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleStart = async (category, productId) => {
    console.log(
      "Starte Timer für Kategorie:",
      category,
      "und Produkt:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(
        category
      )}/${productId}/start`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer gestartet!", { variant: "success" }); // Erfolgsmeldung
      fetchCategories();
    } catch (error) {
      console.error("Fehler beim Starten des Timers:", error);
      enqueueSnackbar("Fehler beim Starten des Timers.", { variant: "error" }); // Fehlermeldung
    }
  };

  const handlePause = async (category, productId) => {
    console.log(
      "Pausiere Timer für Kategorie:",
      category,
      "und Produkt:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(
        category
      )}/${productId}/pause`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer pausiert.", { variant: "info" }); // Infomeldung
      fetchCategories();
    } catch (error) {
      console.error("Fehler beim Pausieren des Timers:", error);
      enqueueSnackbar("Fehler beim Pausieren des Timers.", {
        variant: "error",
      }); // Fehlermeldung
    }
  };

  const handleStop = async (category, productId) => {
    console.log(
      "Beende Timer für Kategorie:",
      category,
      "und Produkt:",
      productId
    );
    try {
      const url = `/products/${encodeURIComponent(category)}/${productId}/stop`;
      await axiosInstance.post(url, {});
      enqueueSnackbar("Timer gestoppt und Daten gespeichert.", {
        variant: "success",
      }); // Erfolgsmeldung
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
        notes: [], // Notizen als leeres Array initialisieren
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

      // Öffne das NoteModal und setze currentEntryId
      setCurrentEntryId(newEntry.id);
      setIsNoteModalOpen(true);
    } catch (error) {
      console.error("Fehler beim Stoppen des Timers:", error);
      enqueueSnackbar("Fehler beim Stoppen des Timers.", { variant: "error" }); // Fehlermeldung
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
      enqueueSnackbar("Notiz hinzugefügt!", { variant: "success" }); // Erfolgsmeldung
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
        item.notes.length > 0 ? item.notes.join(", ") : "N/A",
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
    }); // Erfolgsmeldung
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
    }); // Infomeldung
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

  // Format ausgewähltes Datum
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

  // Leite runningData aus Kategorien ab
  const runningData = useMemo(() => {
    return categories.flatMap((category) =>
      category.products
        .filter((product) => product.isRunning)
        .map((product) => ({
          id: uuidv4(), // Eine eindeutige 'id' für jedes Ereignis in 'runningData' hinzufügen
          productId: product._id,
          category: category.category,
          date: product.date, // Angenommen, 'date' repräsentiert die Startzeit
          elapsedTime: product.elapsedTime, // Angenommen, Backend aktualisiert 'elapsedTime' periodisch
          productName: product.equipment,
          articleNumber: product.articleNumber,
          timeRequired: product.timeRequired,
          notes: Array.isArray(product.notes) ? product.notes : [],
        }))
    );
  }, [categories]);

  // Funktionen zum Löschen und Aktualisieren von Ereignissen
  const handleDeleteEvent = (id) => {
    setDailyData((prevData) => {
      const newData = prevData.filter((event) => event.id !== id);
      localStorage.setItem(`dailyData_${user._id}`, JSON.stringify(newData));
      return newData;
    });
    enqueueSnackbar("Ereignis erfolgreich gelöscht!", { variant: "success" }); // Erfolgsmeldung
  };

  const handleUpdateEvent = (id, updatedFields) => {
    setDailyData((prevData) => {
      const newData = prevData.map((event) =>
        event.id === id ? { ...event, ...updatedFields } : event
      );
      localStorage.setItem(`dailyData_${user._id}`, JSON.stringify(newData));
      return newData;
    });
    enqueueSnackbar("Ereignis erfolgreich aktualisiert!", {
      variant: "success",
    }); // Erfolgsmeldung
  };

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
        categories={categories} // Übergibt Kategorien, falls Header sie verwendet
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

          {/* Übergibt gefilterte Daten und laufende Daten an ChartSection */}
          <ChartSection dailyData={filteredData} runningData={runningData} />

          {/* Übergibt ausgewähltes Datum, setSelectedDate, dailyData und runningData an CalendarSection */}
          <CalendarSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dailyData={dailyData}
            runningData={runningData}
            deleteEvent={handleDeleteEvent} // Übermittlung der Löschfunktion
            updateEvent={handleUpdateEvent} // Übermittlung der Aktualisierungsfunktion
          />
        </div>
      </main>

      {/* Beinhaltet das NoteModal hier */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onRequestClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleSubmitNote}
      />
    </div>
  );
};

export default ProductList;
