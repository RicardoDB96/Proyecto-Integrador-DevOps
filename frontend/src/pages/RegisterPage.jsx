// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Container, Form, Button, Alert, Card, Spinner } from "react-bootstrap";

function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(""); // Limpiar mensaje previo

    try {
      const { data } = await api.post("/auth/register", {
        nombre,
        email,
        telefono,
        password,
      });

      // Si tu backend devuelve un token lo guardamos
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
      } else {
        console.warn("No se recibió token en register:", data);
      }

      setMensaje("✅ Registro exitoso. Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      // Extraemos mensaje de 'message' o de 'mensaje' según tu backend
      const msg =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        error.message ||
        "❌ Error al registrarse.";
      setMensaje(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-3">📝 Registro</h2>
        <p className="text-muted text-center">Crea una cuenta para comenzar</p>

        {mensaje && (
          <Alert variant={mensaje.startsWith("❌") ? "danger" : "success"}>
            {mensaje}
          </Alert>
        )}

        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>🙍 Nombre</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📧 Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📞 Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              pattern="\d{10}"
              placeholder="Ejemplo: 5512345678"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🔒 Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Registrarse"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default RegisterPage;
