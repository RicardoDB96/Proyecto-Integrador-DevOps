//frontend/src/pages/AdminReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminReservasPage() {
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (!token || usuario?.rol !== "admin") {
      alert("Acceso denegado. Debes ser administrador.");
      navigate("/");
      return;
    }

    api.get("/reservas", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setReservas(response.data))
    .catch(error => console.error("Error al obtener reservas:", error));
  }, [token, usuario, navigate]);

  const actualizarEstadoReserva = async (id, estado) => {
    if (!window.confirm(`¿Estás seguro de ${estado} esta reserva?`)) return;

    try {
      await api.put(`/reservas/${id}`, { estado }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Reserva ${estado} correctamente.`);
      setReservas(reservas.map(reserva => 
        reserva._id === id ? { ...reserva, estado } : reserva
      ));
    } catch (error) {
      alert("Error al actualizar la reserva");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Reservas (Administrador)</h2>
      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <ul>
          {reservas.map((reserva) => (
            <li key={reserva._id}>
              <strong>{reserva.salon.nombre}</strong> - {new Date(reserva.fecha).toLocaleDateString()}
              <p>Cliente: {reserva.cliente.nombre} ({reserva.cliente.email})</p>
              <p>Estado: <strong>{reserva.estado}</strong> - Total: ${reserva.total}</p>

              {reserva.estado === "pendiente" && (
                <>
                  <button onClick={() => actualizarEstadoReserva(reserva._id, "aprobada")}>
                    Aprobar
                  </button>
                  <button onClick={() => actualizarEstadoReserva(reserva._id, "rechazada")}>
                    Rechazar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminReservasPage;
