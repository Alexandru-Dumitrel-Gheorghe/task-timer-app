// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../axiosConfig"; // Importiere die konfigurierte Axios-Instanz
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(); // Erstelle einen Authentifizierungskontext

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // Hook für Navigation
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") // Überprüfe, ob ein Token im Local Storage vorhanden ist
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user"); // Lade den gespeicherten Benutzer
    if (savedUser) {
      try {
        return JSON.parse(savedUser); // Parst die Benutzerdaten
      } catch (error) {
        console.error("Fehler beim Parsen der Benutzerinformationen:", error);
        localStorage.removeItem("user"); // Entferne den Benutzer aus dem Storage bei einem Fehler
        return null;
      }
    }
    return null; // Rückgabe von null, wenn kein gespeicherter Benutzer vorhanden ist
  });

  const [loading, setLoading] = useState(true); // Ladezustand

  // Überprüfe das Token, wenn die Komponente gemountet wird
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token"); // Hole das Token aus dem Local Storage
      if (token) {
        try {
          const response = await axiosInstance.get("/me"); // Endpoint zum Abrufen der Benutzerdaten
          setUser(response.data.user); // Setze den Benutzer
          setIsAuthenticated(true); // Setze die Authentifizierung auf true
          localStorage.setItem("user", JSON.stringify(response.data.user)); // Speichere den Benutzer im Local Storage
        } catch (error) {
          console.error("Ungültiges oder abgelaufenes Token:", error);
          // Behandle ein ungültiges Token: melde den Benutzer ab und bereinige den Storage
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login"); // Navigiere den Benutzer zur Login-Seite
        }
      }
      setLoading(false); // Stoppe das Laden nach der Token-Überprüfung
    };
    verifyToken(); // Rufe die Funktion zur Token-Überprüfung auf
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funktion zur Authentifizierung des Benutzers
  const login = async (token) => {
    localStorage.setItem("token", token); // Speichere das Token
    setIsAuthenticated(true); // Setze die Authentifizierung auf true
    try {
      const response = await axiosInstance.get("/me"); // Hole die Benutzerdaten nach der Authentifizierung
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Speichere den Benutzer im Local Storage
    } catch (error) {
      console.error("Fehler beim Abrufen der Benutzerdaten:", error);
      // Wenn das Abrufen der Benutzerdaten fehlschlägt, melde den Benutzer ab
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // Funktion zum Abmelden des Benutzers
  const logout = () => {
    localStorage.removeItem("token"); // Entferne das Token
    localStorage.removeItem("user"); // Entferne den Benutzer
    setIsAuthenticated(false); // Setze die Authentifizierung auf false
    setUser(null); // Setze den Benutzer auf null
    navigate("/login"); // Navigiere den Benutzer zur Login-Seite
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {!loading && children}{" "}
      {/* Rendere die Kinder erst, nachdem der Ladezustand abgeschlossen ist */}
    </AuthContext.Provider>
  );
};
