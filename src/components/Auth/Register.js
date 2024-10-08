import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/register`, {
        username,
        password,
      });
      setLoading(false);
      alert("Benutzer erfolgreich registriert!");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.error("Registrierung fehlgeschlagen", error);
      alert("Registrierung fehlgeschlagen");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Registrieren</h2>
        {loading ? (
          <p>Lädt...</p>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
            />
            <button type="submit">Registrieren</button>
          </form>
        )}
        <p>
          Bereits ein Konto? <Link to="/login">Hier anmelden</Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;
