// src/components/Calendar/CalendarSection.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./CalendarSection.module.css";
import { de } from "date-fns/locale";
import {
  startOfWeek,
  startOfMonth,
  isSameWeek,
  isSameMonth,
  format,
} from "date-fns";
import {
  FaCalendarAlt,
  FaClock,
  FaTools,
  FaStickyNote,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaArrowRight,
  FaTrash,
  FaEdit,
  FaSave,
} from "react-icons/fa";

const DAILY_TARGET_HOURS = 8;
const WEEKLY_TARGET_HOURS = 40;
const MONTHLY_TARGET_HOURS = 160;

const CalendarSection = ({
  selectedDate,
  setSelectedDate,
  dailyData,
  runningData,
  deleteEvent, // Funktion zum Löschen eines Ereignisses
  updateEvent, // Funktion zum Aktualisieren eines Ereignisses
}) => {
  // Datum im Format YYYY-MM-DD formatieren
  const formatDate = (date) => format(date, "yyyy-MM-dd");

  // Ereignisse für das ausgewählte Datum abrufen
  const getEventsForDate = (date) => {
    const formattedDate = formatDate(date);
    const stoppedEvents = dailyData.filter((item) =>
      item.date.startsWith(formattedDate)
    );
    const runningEvents = runningData.filter(
      (item) =>
        new Date(item.date).toLocaleDateString("de-DE") ===
        date.toLocaleDateString("de-DE")
    );
    return [...stoppedEvents, ...runningEvents];
  };

  const getEventsForWeek = (date) => {
    const startWeek = startOfWeek(date, { weekStartsOn: 1 });
    const stoppedEvents = dailyData.filter((item) =>
      isSameWeek(new Date(item.date), startWeek, { weekStartsOn: 1 })
    );
    const runningEvents = runningData.filter((item) =>
      isSameWeek(new Date(item.date), startWeek, { weekStartsOn: 1 })
    );
    return [...stoppedEvents, ...runningEvents];
  };

  const getEventsForMonth = (date) => {
    const startMonth = startOfMonth(date);
    const stoppedEvents = dailyData.filter((item) =>
      isSameMonth(new Date(item.date), startMonth)
    );
    const runningEvents = runningData.filter((item) =>
      isSameMonth(new Date(item.date), startMonth)
    );
    return [...stoppedEvents, ...runningEvents];
  };

  const getTotalHours = (data) => {
    const isMilliseconds = data.some((event) => event.elapsedTime > 100000);
    const conversionFactor = isMilliseconds ? 3600000 : 3600;

    const totalSecondsOrMs = data.reduce(
      (total, event) => total + (event.elapsedTime || 0),
      0
    );
    const totalHours = totalSecondsOrMs / conversionFactor;

    return totalHours;
  };

  const getDailyPercentage = () => {
    const eventsForDay = getEventsForDate(selectedDate);
    const totalHours = getTotalHours(eventsForDay);
    const percentage = Math.min((totalHours / DAILY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  const getWeeklyPercentage = () => {
    const eventsForWeek = getEventsForWeek(selectedDate);
    const totalHours = getTotalHours(eventsForWeek);
    const percentage = Math.min((totalHours / WEEKLY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  const getMonthlyPercentage = () => {
    const eventsForMonth = getEventsForMonth(selectedDate);
    const totalHours = getTotalHours(eventsForMonth);
    const percentage = Math.min((totalHours / MONTHLY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  const formatShortWeekday = (locale, date) => {
    return format(date, "EEE", { locale });
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <FaCalendarAlt className={styles.headerIcon} />
        <h2>Arbeitszeitübersicht</h2>
      </div>
      <div className={styles.calendarWrapper}>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale={de}
          className={styles.customCalendar}
          nextLabel={<FaChevronRight />}
          prevLabel={<FaChevronLeft />}
          next2Label={<FaArrowRight />}
          prev2Label={<FaArrowLeft />}
          formatShortWeekday={(locale, date) =>
            formatShortWeekday(locale, date)
          }
        />
      </div>

      <div className={styles.usageOverview}>
        <h3>
          <FaClock className={styles.usageIcon} />
          Auslastung
        </h3>
        <div className={styles.progressBars}>
          <div className={styles.progressItem}>
            <span>Tägliche Zielerreichung:</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${getDailyPercentage()}%` }}
                data-label={`${getDailyPercentage().toFixed(2)}%`}
              ></div>
            </div>
          </div>
          <div className={styles.progressItem}>
            <span>Wöchentliche Zielerreichung:</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${getWeeklyPercentage()}%` }}
                data-label={`${getWeeklyPercentage().toFixed(2)}%`}
              ></div>
            </div>
          </div>
          <div className={styles.progressItem}>
            <span>Monatliche Zielerreichung:</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${getMonthlyPercentage()}%` }}
                data-label={`${getMonthlyPercentage().toFixed(2)}%`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.eventList}>
        <h3>
          <FaClock className={styles.eventIcon} />
          Arbeitszeiten am {selectedDate.toLocaleDateString("de-DE")}
        </h3>
        {getEventsForDate(selectedDate).length > 0 ? (
          getEventsForDate(selectedDate).map((event) => (
            <EventCard
              key={event.id} // Verwenden Sie 'id' als eindeutigen Schlüssel
              event={event}
              deleteEvent={deleteEvent}
              updateEvent={updateEvent}
            />
          ))
        ) : (
          <p className={styles.noEvents}>
            Keine Arbeitszeiten für diesen Tag gefunden.
          </p>
        )}
      </div>
    </div>
  );
};

// Komponente für jede Ereigniskarte
const EventCard = ({ event, deleteEvent, updateEvent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");

  const handleDelete = () => {
    // Funktion zum Löschen des Ereignisses mit 'id'
    deleteEvent(event.id);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedNotes(""); // Eingabefeld zurücksetzen, wenn der Bearbeitungsmodus aktiviert wird
    }
  };

  const handleSave = () => {
    const newNote = editedNotes.trim();
    if (newNote === "") {
      // Optional: Leere Notizen nicht speichern
      return;
    }
    // Sicherstellen, dass `event.notes` ein Array ist, bevor eine neue Notiz hinzugefügt wird
    const updatedNotes = Array.isArray(event.notes)
      ? [...event.notes, newNote]
      : [newNote];
    // Funktion zum Aktualisieren des Ereignisses mit 'id' und den neuen Notizen aufrufen
    updateEvent(event.id, { notes: updatedNotes });
    setIsEditing(false);
  };

  return (
    <div className={styles.eventItem}>
      <div className={styles.eventHeader}>
        <FaTools className={styles.eventIcon} />
        <strong>{event.productName}</strong>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Ereignis löschen"
        >
          <FaTrash />
        </button>
      </div>
      <p>
        <FaClock className={styles.detailIcon} /> Arbeitszeit:{" "}
        {formatTime(event.elapsedTime)} Stunden
      </p>
      <p>
        <FaTools className={styles.detailIcon} /> Kategorie: {event.category}
      </p>
      <p>
        <FaCalendarAlt className={styles.detailIcon} /> Datum:{" "}
        {new Date(event.date).toLocaleString("de-DE")}
      </p>
      <div className={styles.notesSection}>
        <FaStickyNote className={styles.detailIcon} /> Notizen:{" "}
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className={styles.notesInput}
              placeholder="Notiz hinzufügen"
            />
            <button
              className={styles.saveButton}
              onClick={handleSave}
              title="Notizen speichern"
            >
              <FaSave />
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleEditToggle}
              title="Bearbeitung abbrechen"
            >
              <FaEdit />
            </button>
          </>
        ) : (
          <>
            {Array.isArray(event.notes) && event.notes.length > 0
              ? event.notes.join(", ")
              : "Keine Notiz"}
            <button
              className={styles.editButton}
              onClick={handleEditToggle}
              title="Notizen bearbeiten"
            >
              <FaEdit />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Hilfsfunktion zur Formatierung der Zeit von Sekunden oder Millisekunden zu HH:MM:SS
const formatTime = (time) => {
  const isMilliseconds = time > 100000;
  const totalSeconds = isMilliseconds ? Math.floor(time / 1000) : time;

  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export default CalendarSection;
