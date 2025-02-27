import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Badge, Alert } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Íconos

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
    <Container className="mt-5">
      <h2 className="text-center mb-4">📅 Gestión de Reservas (Administrador)</h2>

      {reservas.length === 0 ? (
        <Alert variant="warning" className="text-center">No hay reservas registradas.</Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-lg">
          <thead className="table-dark">
            <tr>
              <th>Salón</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva._id}>
                <td>{reserva.salon?.nombre || "Sin salón"}</td>
                <td>{reserva.fecha ? new Date(reserva.fecha).toLocaleDateString() : "Fecha desconocida"}</td>
                <td>
                  {reserva.cliente?.nombre || "Desconocido"} 
                  <br/>
                  <small className="text-muted">({reserva.cliente?.email || "Correo no disponible"})</small>
                </td>
                <td>
                  <Badge 
                    bg={
                      reserva.estado === "pendiente" ? "warning" :
                      reserva.estado === "aprobada" ? "success" :
                      "danger"
                    }
                  >
                    {reserva.estado}
                  </Badge>
                </td>
                <td>${reserva.total}</td>
                <td>
                  {reserva.estado === "pendiente" && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => actualizarEstadoReserva(reserva._id, "aprobada")}
                      >
                        <FaCheckCircle /> Aprobar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => actualizarEstadoReserva(reserva._id, "rechazada")}
                      >
                        <FaTimesCircle /> Rechazar
                      </Button>
                    </>
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

export default AdminReservasPage;