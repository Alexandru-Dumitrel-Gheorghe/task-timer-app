// src/components/Calendar/EventCard.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./EventCard.module.css";
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaClock,
  FaTools,
  FaCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";
import { useSnackbar } from "notistack";

const EventCard = ({ event, deleteEvent, updateEvent, formatTime }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");

  const handleDelete = () => {
    if (window.confirm("Möchten Sie dieses Ereignis wirklich löschen?")) {
      deleteEvent(event._id);
      enqueueSnackbar("Ereignis erfolgreich gelöscht!", { variant: "success" });
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedNotes("");
    }
  };

  const handleSave = () => {
    const newNote = editedNotes.trim();
    if (newNote === "") {
      enqueueSnackbar("Leere Notizen werden nicht gespeichert.", {
        variant: "warning",
      });
      return;
    }
    const updatedNotes = Array.isArray(event.notes)
      ? [...event.notes, newNote]
      : [newNote];
    updateEvent(event._id, { notes: updatedNotes });
    setIsEditing(false);
    enqueueSnackbar("Notiz hinzugefügt!", { variant: "success" });
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
          aria-label="Ereignis löschen"
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
              aria-label="Notizen speichern"
            >
              <FaSave />
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleEditToggle}
              title="Bearbeitung abbrechen"
              aria-label="Bearbeitung abbrechen"
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
              aria-label="Notizen bearbeiten"
            >
              <FaEdit />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    elapsedTime: PropTypes.number.isRequired,
    notes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  updateEvent: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
};

export default EventCard;
