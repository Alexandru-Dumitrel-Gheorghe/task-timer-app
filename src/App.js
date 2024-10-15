// src/App.js
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProductList from "./components/ProductList";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SnackbarProvider } from "notistack"; // Importieren von SnackbarProvider
import ScrollToTop from "./components/ScrollToTop/ScrollToTop"; // Importieren der ScrollToTop-Komponente

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <ScrollToTop /> {/* Einbinden der ScrollToTop-Komponente */}
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductList />
                </PrivateRoute>
              }
            />
          </Routes>
        </SnackbarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
