// src/components/Auth/Register.js
import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig"; // Verwenden der konfigurierten Axios-Instanz
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { AuthContext } from "../../context/AuthContext"; // Importiere AuthContext

const Register = () => {
  const { login } = useContext(AuthContext); // Zugriff auf die Login-Funktion aus AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Ladezustand, um Mehrfachübermittlungen zu verhindern
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/register", {
        username,
        password,
      });

      const { token, user } = response.data;

      // Wenn Token und Benutzer zurückgegeben werden, melde den Benutzer automatisch an
      if (token && user) {
        await login(token); // Verwende die Login-Funktion aus AuthContext
        navigate("/products");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setLoading(false);
      console.error("Registrierung fehlgeschlagen", error);
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
              disabled={loading} // Deaktiviere Eingaben beim Laden
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              disabled={loading} // Deaktiviere Eingaben beim Laden
            />
            <button type="submit" disabled={loading}>
              {loading ? "Lädt..." : "Registrieren"}
            </button>
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
