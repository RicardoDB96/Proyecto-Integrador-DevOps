//frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SalonesPage from "./pages/SalonesPage";
import DetalleSalonPage from "./pages/DetalleSalonPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservasPage from "./pages/ReservasPage";
import AdminReservasPage from "./pages/AdminReservasPage"; // Nueva página
import PagoExitoso from "./pages/PagoExitoso"; // Stripe

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.location.href = "/"; // Redirigir a la página de inicio
  };

  return (
    <Router>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/salones">Salones</Link>
        <Link to="/reservas">Reservas</Link>

        {usuario ? (
          <>
            <span>Hola, {usuario.nombre} 👋</span>
            {usuario.rol === "admin" && <Link to="/admin/reservas">Admin Reservas</Link>}
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/salones" element={<SalonesPage />} />
        <Route path="/salones/:id" element={<DetalleSalonPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/admin/reservas" element={<AdminReservasPage />} /> {/* Nueva ruta */}
        <Route path="/pago-exitoso" element={<PagoExitoso />} />;
      </Routes>
    </Router>
  );
}

export default App;

