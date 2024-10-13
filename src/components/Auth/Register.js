import React, { useState, useContext } from "react";
import axiosInstance from "../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa"; // Import Icons
import styles from "./Register.module.css";
import { AuthContext } from "../../context/AuthContext";
import { useSnackbar } from "notistack";

const Register = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/register", {
        username,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        await login(token);
        localStorage.setItem("user", JSON.stringify(user));
        enqueueSnackbar("Erfolgreich registriert und angemeldet!", {
          variant: "success",
        });
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
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Konto Erstellen</h2>
        <p className={styles.subtitle}>
          Füllen Sie die Felder aus, um Ihr Konto zu erstellen.
        </p>
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername"
              required
              disabled={loading}
              className={styles.input}
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
              disabled={loading}
              className={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Lädt..." : "Registrieren"}
          </button>
        </form>
        <p className={styles.switchText}>
          Bereits ein Konto?{" "}
          <Link to="/login" className={styles.link}>
            Hier anmelden
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;
