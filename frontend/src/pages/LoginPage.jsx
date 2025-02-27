//frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });

      // Save user details
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      setMensaje("✅ Inicio de sesión exitoso. Redirigiendo...");

      // Reload page to update user info
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      setMensaje("❌ Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-4">🔐 Iniciar Sesión</h2>

        {mensaje && <Alert variant={mensaje.includes("Error") ? "danger" : "success"}>{mensaje}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>📧 Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🔒 Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Iniciar Sesión
          </Button>
        </Form>

        <p className="text-center mt-3">
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </Card>
    </Container>
  );
}

export default LoginPage;
