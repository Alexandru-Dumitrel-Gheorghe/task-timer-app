// src/components/Auth/Register.jsx

import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig"; // Verwenden der konfigurierten Axios-Instanz
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { AuthContext } from "../../context/AuthContext"; // Importiere AuthContext
import { useSnackbar } from "notistack"; // Importiere useSnackbar aus notistack
import { FaUserPlus, FaUserShield } from "react-icons/fa"; // Importiere Icons

const Register = () => {
  const { login } = useContext(AuthContext); // Zugriff auf die Login-Funktion aus AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Standardrolle ist 'user'
  const [loading, setLoading] = useState(false); // Ladezustand, um Mehrfachübermittlungen zu verhindern
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Verwendung des Snackbar-Hooks

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/register", {
        username,
        password,
        role, // Sende die ausgewählte Rolle mit
      });

      const { token, user } = response.data;

      // Wenn Token und Benutzer zurückgegeben werden, melde den Benutzer automatisch an
      if (token && user) {
        await login(token); // Verwende die Login-Funktion aus AuthContext
        localStorage.setItem("user", JSON.stringify(user));
        enqueueSnackbar("Erfolgreich registriert und angemeldet!", {
          variant: "success",
        }); // Erfolgsmeldung
        navigate("/products");
      } else {
        enqueueSnackbar(
          "Registrierung erfolgreich, bitte loggen Sie sich ein.",
          { variant: "info" }
        );
        navigate("/login");
      }
    } catch (error) {
      setLoading(false);
      console.error("Registrierung fehlgeschlagen", error);
      enqueueSnackbar(
        "Registrierung fehlgeschlagen: " +
          (error.response?.data?.message || error.message),
        { variant: "error" }
      ); // Fehlermeldung
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cube}>
        <div className={`${styles.face} ${styles.face1}`}></div>
        <div className={`${styles.face} ${styles.face2}`}></div>
        <div className={`${styles.face} ${styles.face3}`}></div>
        <div className={`${styles.face} ${styles.face4}`}></div>
        <div className={`${styles.face} ${styles.face5}`}></div>
        <div className={`${styles.face} ${styles.face6}`}></div>
      </div>
      <div className={styles.formWrapper}>
        <h2>Registrieren</h2>
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

          {/* Registrierungsoptionen */}
          <div className={styles.roleSelection}>
            <label className={styles.roleOption}>
              <input
                type="radio"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                disabled={loading}
              />
              <FaUserPlus className={styles.roleIcon} />
              Benutzer
            </label>
            <label className={styles.roleOption}>
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                disabled={loading}
              />
              <FaUserShield className={styles.roleIcon} />
              Administrator
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Lädt..." : "Registrieren"}
          </button>
        </form>
        <p>
          Bereits ein Konto? <Link to="/login">Hier anmelden</Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;
