// src/components/Login/Login.jsx

import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import { useSnackbar } from "notistack"; // Import useSnackbar aus notistack
import Tilt from "react-parallax-tilt"; // Import Tilt

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Verwendung des Snackbar-Hooks

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/login", {
        username,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        await login(token);
        localStorage.setItem("user", JSON.stringify(user));
        enqueueSnackbar("Erfolgreich angemeldet!", { variant: "success" }); // Erfolgsmeldung
        navigate("/products");
      } else {
        throw new Error("Ungültige Anmeldedaten");
      }
    } catch (error) {
      console.error("Anmeldung fehlgeschlagen", error);
      enqueueSnackbar("Anmeldung fehlgeschlagen", { variant: "error" }); // Fehlermeldung
    } finally {
      setLoading(false);
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
          <h2>Anmelden</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername"
              required
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Lädt..." : "Anmelden"}
            </button>
          </form>
          <p>
            Noch kein Konto? <Link to="/register">Hier registrieren</Link>.
          </p>
        </div>
      </Tilt>
    </div>
  );
};

export default Login;
