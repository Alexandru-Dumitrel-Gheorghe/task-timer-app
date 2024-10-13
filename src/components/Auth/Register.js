// src/components/Auth/Register.jsx

import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig"; // Verwenden der konfigurierten Axios-Instanz
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { AuthContext } from "../../context/AuthContext"; // Importiere AuthContext
import { useSnackbar } from "notistack"; // Importiere useSnackbar aus notistack
import Tilt from "react-parallax-tilt"; // Import Tilt

const Register = () => {
  const { login } = useContext(AuthContext); // Zugriff auf die Login-Funktion aus AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <Tilt
        glareEnable={true}
        glareMaxOpacity={0.2}
        scale={1.05}
        transitionSpeed={2500}
        className={styles.tiltWrapper}
      >
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
            <button type="submit" disabled={loading}>
              {loading ? "Lädt..." : "Registrieren"}
            </button>
          </form>
          <p>
            Bereits ein Konto? <Link to="/login">Hier anmelden</Link>.
          </p>
        </div>
      </Tilt>
    </div>
  );
};

export default Register;
