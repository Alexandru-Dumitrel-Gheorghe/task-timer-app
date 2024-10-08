import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      alert("Erfolgreich angemeldet!");
      navigate("/products");
    } catch (error) {
      console.error("Anmeldung fehlgeschlagen", error);
      alert("Anmeldung fehlgeschlagen");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Anmelden</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Anmelden</button>
        </form>
        <p>
          Noch kein Konto? <Link to="/register">Hier registrieren</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
