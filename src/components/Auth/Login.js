import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";
import { AuthContext } from "../../context/AuthContext";
import { useSnackbar } from "notistack";
import { FaUser, FaLock } from "react-icons/fa"; // Import Icons

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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
        enqueueSnackbar("Erfolgreich angemeldet!", { variant: "success" });
        navigate("/products");
      } else {
        throw new Error("Ungültige Anmeldedaten");
      }
    } catch (error) {
      console.error("Anmeldung fehlgeschlagen", error);
      enqueueSnackbar("Anmeldung fehlgeschlagen", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2>Anmelden</h2>
        <p>Füllen Sie die Felder aus, um sich anzumelden.</p>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername"
              required
              className={styles.input}
              disabled={loading}
            />
          </div>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              className={styles.input}
              disabled={loading}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Lädt..." : "Anmelden"}
          </button>
        </form>
        <p className={styles.switchText}>
          Noch kein Konto?{" "}
          <Link to="/register" className={styles.link}>
            Hier registrieren
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
