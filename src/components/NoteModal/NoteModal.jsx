import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./NoteModal.module.css";

const NoteModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (note.trim()) {
      onSubmit(note);
      setNote(""); // Reset the note field
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      ariaHideApp={false}
    >
      <h2 className={styles.title}>Notiz Hinzufügen</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Schreiben Sie hier Ihre Notizen..."
          className={styles.textarea}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Notiz Hinzufügen
          </button>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onRequestClose}
          >
            Schließen
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;
