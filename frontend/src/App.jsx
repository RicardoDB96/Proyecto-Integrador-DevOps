import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import HomePage from "./pages/HomePage";
import SalonesPage from "./pages/SalonesPage";
import DetalleSalonPage from "./pages/DetalleSalonPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservasPage from "./pages/ReservasPage";
import AdminReservasPage from "./pages/AdminReservasPage";
import AdminSalonesPage from "./pages/AdminSalonesPage";
import AdminEditarSalonPage from "./pages/AdminEditarSalonPage";
import AdminAgregarSalonPage from "./pages/AdminAgregarSalonPage";
import PagoExitoso from "./pages/PagoExitoso";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      const usuarioGuardado = localStorage.getItem("usuario");
      setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    };
  
    checkUser();
  
    window.addEventListener("storage", checkUser); // Listen for localStorage changes
  
    return () => {
      window.removeEventListener("storage", checkUser);
    };
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.location.href = "/"; // Redirect to home
  };

  return (
    <Router>
      {/* 🔹 Bootstrap Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand as={Link} to="/">🎉 Reservo</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Inicio</Nav.Link>
              <Nav.Link as={Link} to="/salones">Salones</Nav.Link>
              <Nav.Link as={Link} to="/reservas">Reservas</Nav.Link>
              <Nav.Link as={Link} to="/admin/reservas">Admin Reservas</Nav.Link>
            </Nav>

            <Nav>
              {usuario ? (
                <>
                  <Navbar.Text className="me-3">👋 Hola, {usuario.nombre}</Navbar.Text>
                  {usuario.rol === "admin" && (
                    <>
                      <Nav.Link as={Link} to="/admin/reservas">Admin Reservas</Nav.Link>
                      <Nav.Link as={Link} to="/admin/salones">Gestionar Salones</Nav.Link>
                      <Nav.Link as={Link} to="/admin/agregar-salon">Agregar Salón</Nav.Link>
                    </>
                  )}
                  <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                  <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🔹 Routes */}
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/salones" element={<SalonesPage />} />
          <Route path="/salones/:id" element={<DetalleSalonPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/admin/reservas" element={<AdminReservasPage />} />
          <Route path="/admin/salones" element={<AdminSalonesPage />} />
          <Route path="/admin/agregar-salon" element={<AdminAgregarSalonPage />} />
          <Route path="/admin/editar-salon/:id" element={<AdminEditarSalonPage />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
