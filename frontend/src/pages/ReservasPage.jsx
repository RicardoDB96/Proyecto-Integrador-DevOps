// frontend/src/pages/ReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    api.get("/reservas/mis-reservas", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setReservas(response.data))
    .catch(error => console.error("Error al obtener reservas:", error));
  }, [token]);

  // 🔹 Cancelar una reserva
  const handleCancelarReserva = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta reserva?")) return;

    try {
      await api.delete(`/reservas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Reserva cancelada correctamente");
      
      // Actualizar lista de reservas después de cancelar
      setReservas(reservas.filter(reserva => reserva._id !== id));
    } catch (error) {
      alert("Error al cancelar la reserva");
      console.error("Error:", error);
    }
  };

  // 🔹 Iniciar proceso de pago con Stripe
  const handlePagar = async (reservaId) => {
    try {
      const response = await api.post("/pagos/checkout", { reservaId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirigir al usuario a Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      alert("Error al iniciar el pago");
      console.error("Error:", error);
    }
  };

  // 🔹 Confirmar pago (solo pruebas)
  const handleConfirmarPago = async (reservaId) => {
    try {
      const response = await api.put(`/reservas/${reservaId}/confirmar-pago`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Pago confirmado con éxito");
      setReservas(reservas.map(reserva => 
        reserva._id === reservaId ? { ...reserva, pagoRealizado: true } : reserva
      ));
    } catch (error) {
      alert("Error al confirmar el pago");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Mis Reservas</h2>
      {reservas.length === 0 ? (
        <p>No tienes reservas aún.</p>
      ) : (
        <ul>
          {reservas.map((reserva) => (
            <li key={reserva._id}>
              <strong>{reserva.salon.nombre}</strong> - {new Date(reserva.fecha).toLocaleDateString()}
              <p>Estado: {reserva.estado} - Total: ${reserva.total}</p>

              {/* 🔹 Mostrar botones de pago solo si la reserva está aprobada y aún no está pagada */}
              {reserva.estado === "aprobada" && !reserva.pagoRealizado ? (
                <>
                  <button onClick={() => handlePagar(reserva._id)}>Pagar Ahora</button>
                  <button onClick={() => handleConfirmarPago(reserva._id)}>Confirmar Pago (Solo Pruebas)</button>
                </>
              ) : reserva.pagoRealizado ? (
                <p>✅ Pago realizado</p>
              ) : (
                <p>🚫 No disponible para pago</p>
              )}

              {/* 🔹 Botón de cancelar: Solo si la reserva está pendiente */}
              {reserva.estado === "pendiente" && (
                <button onClick={() => handleCancelarReserva(reserva._id)}>
                  Cancelar Reserva
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReservasPage;
