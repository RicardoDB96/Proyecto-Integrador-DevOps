// frontend/src/pages/ReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Table, Button, Badge, Alert } from "react-bootstrap";

function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    api
      .get("/reservas/mis-reservas", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setReservas(response.data))
      .catch((error) => console.error("Error al obtener reservas:", error));
  }, [token]);

  // 🔹 Cancelar una reserva
  const handleCancelarReserva = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta reserva?")) return;

    try {
      await api.delete(`/reservas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Reserva cancelada correctamente");
      setReservas(reservas.filter((reserva) => reserva._id !== id));
    } catch (error) {
      alert("Error al cancelar la reserva");
      console.error("Error:", error);
    }
  };

  // 🔹 Iniciar proceso de pago con Stripe
  const handlePagar = async (reservaId) => {
    try {
      const response = await api.post(
        "/pagos/checkout",
        { reservaId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.href = response.data.url; // Redirigir a Stripe Checkout
    } catch (error) {
      alert("Error al iniciar el pago");
      console.error("Error:", error);
    }
  };

  // 🔹 Confirmar pago (solo pruebas)
  const handleConfirmarPago = async (reservaId) => {
    try {
      await api.put(`/reservas/${reservaId}/confirmar-pago`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Pago confirmado con éxito");
      setReservas(reservas.map((reserva) =>
        reserva._id === reservaId ? { ...reserva, pagoRealizado: true } : reserva
      ));
    } catch (error) {
      alert("Error al confirmar el pago");
      console.error("Error:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">📅 Mis Reservas</h2>

      {reservas.length === 0 ? (
        <Alert variant="info" className="text-center mt-3">
          No tienes reservas aún.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr className="text-center">
              <th>Salón</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva._id} className="text-center">
                <td>{reserva.salon.nombre}</td>
                <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
                <td>
                  <Badge
                    bg={
                      reserva.estado === "aprobada"
                        ? "success"
                        : reserva.estado === "pendiente"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {reserva.estado}
                  </Badge>
                </td>
                <td>${reserva.total}</td>
                <td>
                  {/* 🔹 Botones de Pago */}
                  {reserva.estado === "aprobada" && !reserva.pagoRealizado ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handlePagar(reserva._id)} className="me-2">
                        💳 Pagar Ahora
                      </Button>
                      <Button variant="success" size="sm" onClick={() => handleConfirmarPago(reserva._id)}>
                        ✅ Confirmar Pago (Pruebas)
                      </Button>
                    </>
                  ) : reserva.pagoRealizado ? (
                    <Badge bg="success">✅ Pago realizado</Badge>
                  ) : (
                    <Badge bg="secondary ">🚫 No disponible para pago</Badge>
                  )}

                  {/* 🔹 Botón de Cancelar Reserva */}
                  {reserva.estado === "pendiente" && (
                    <Button
                      variant="primary "
                      size="sm"
                      className="ms-2"
                      onClick={() => handleCancelarReserva(reserva._id)}
                    >
                      ❌ Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ReservasPage;
