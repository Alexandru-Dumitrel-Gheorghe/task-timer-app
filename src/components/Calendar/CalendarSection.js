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
  isSameDay, // Importă isSameDay
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
  deleteEvent, // Funcție pentru ștergerea unui eveniment
  updateEvent, // Funcție pentru actualizarea unui eveniment
}) => {
  // Obținem evenimentele pentru data selectată folosind isSameDay
  const getEventsForDate = (date) => {
    const stoppedEvents = dailyData.filter((item) => {
      const eventDate = new Date(item.date);
      const sameDay = isSameDay(eventDate, date);
      if (sameDay) {
        console.log(
          `Stopped Event Matched: ${item.date} with Selected Date: ${date}`
        );
      }
      return sameDay;
    });
    const runningEvents = runningData.filter((item) => {
      const eventDate = new Date(item.date);
      const sameDay = isSameDay(eventDate, date);
      if (sameDay) {
        console.log(
          `Running Event Matched: ${item.date} with Selected Date: ${date}`
        );
      }
      return sameDay;
    });
    return [...stoppedEvents, ...runningEvents];
  };

  // Obținem evenimentele pentru săptămâna selectată
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

  // Obținem evenimentele pentru luna selectată
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

  // Calculăm totalul orelor
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

  // Calculăm procentul de îndeplinire zilnică
  const getDailyPercentage = () => {
    const eventsForDay = getEventsForDate(selectedDate);
    const totalHours = getTotalHours(eventsForDay);
    const percentage = Math.min((totalHours / DAILY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  // Calculăm procentul de îndeplinire săptămânală
  const getWeeklyPercentage = () => {
    const eventsForWeek = getEventsForWeek(selectedDate);
    const totalHours = getTotalHours(eventsForWeek);
    const percentage = Math.min((totalHours / WEEKLY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  // Calculăm procentul de îndeplinire lunară
  const getMonthlyPercentage = () => {
    const eventsForMonth = getEventsForMonth(selectedDate);
    const totalHours = getTotalHours(eventsForMonth);
    const percentage = Math.min((totalHours / MONTHLY_TARGET_HOURS) * 100, 100);
    return percentage;
  };

  // Formatează denumirea scurtă a zilei săptămânii
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
              key={event.id} // Utilizează 'id' ca cheie unică
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

// Componentă pentru fiecare card de eveniment
const EventCard = ({ event, deleteEvent, updateEvent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");

  const handleDelete = () => {
    // Funcție pentru ștergerea evenimentului folosind 'id'
    deleteEvent(event.id);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedNotes(""); // Resetează câmpul de input când modul de editare este activat
    }
  };

  const handleSave = () => {
    const newNote = editedNotes.trim();
    if (newNote === "") {
      // Opțional: Nu salva notele goale
      return;
    }
    // Asigură-te că `event.notes` este un array înainte de a adăuga o nouă notă
    const updatedNotes = Array.isArray(event.notes)
      ? [...event.notes, newNote]
      : [newNote];
    // Apelează funcția de actualizare a evenimentului cu 'id' și noile note
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

// Funcție auxiliară pentru formatarea timpului din secunde sau milisecunde în HH:MM:SS
const formatTime = (time) => {
  const isMilliseconds = time > 100000;
  const totalSeconds = isMilliseconds ? Math.floor(time / 1000) : time;

  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export default CalendarSection;
