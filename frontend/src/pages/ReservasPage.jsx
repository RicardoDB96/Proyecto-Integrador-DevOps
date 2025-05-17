// frontend/src/pages/ReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Button, Alert, Row, Col, Card, Form } from "react-bootstrap";
import StarRating from "../components/Estrellas"

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

  const handlePagar = async (reservaId) => {
    try {
      const response = await api.post(
        "/pagos/checkout",
        { reservaId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.href = response.data.url;
    } catch (error) {
      alert("Error al iniciar el pago");
      console.error("Error:", error);
    }
  };

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

  const [filtros, setFiltros] = useState({
    nombreSalon: "",
    nombreCliente: "",
    estado: "",
    fecha: ""
  });

  const quitarAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const ordenarReservas = (reservas) => {
    return [...reservas].sort((a, b) => {
      const ordenEstados = { pendiente: 1, aprobada: 2, rechazada: 3 };
      if (ordenEstados[a.estado] !== ordenEstados[b.estado]) {
        return ordenEstados[a.estado] - ordenEstados[b.estado];
      }
      return new Date(b.fecha) - new Date(a.fecha);
    });
  };

  const reservasFiltrados = ordenarReservas(reservas.filter((reserva) => {
    const fechaReserva = new Date(reserva.fecha).toLocaleDateString("es-MX", {timeZone: 'UTC'});
    const fechaFiltro = filtros.fecha ? new Date(filtros.fecha).toLocaleDateString("es-MX", {timeZone: 'UTC'}) : "";

    return (
      (filtros.nombreSalon === "" || 
        quitarAcentos(reserva.salon.nombre.toLowerCase()).includes(
          quitarAcentos(filtros.nombreSalon.toLowerCase())
        )) &&
      (filtros.estado === "" || 
        reserva.estado.toLowerCase() === filtros.estado.toLowerCase()) &&
      (filtros.fecha === "" || 
        fechaReserva === fechaFiltro)
    );
  }));

  return (
    <Container className="py-5">
      <h1 className="text-center">📅 Mis Reservas</h1>

      <Row>
        <Col md={3}>
          <Card className="p-3 mb-4">
            <h5>🔍 Filtrar Reservas</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>🏢 Nombre del Salón</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por salón"
                  value={filtros.nombreSalon}
                  onChange={(e) => setFiltros({ ...filtros, nombreSalon: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📊 Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📅 Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Card>
        </Col>

        <Col md={9}>
          {reservas.length === 0 ? (
            <Alert variant="info" className="text-center mt-3">
              No tienes reservas aún.
            </Alert>
          ) : (
            <Row className="g-4">
              {reservasFiltrados.map((reserva) => (
                <Col xs={12} key={reserva._id}>
                  <Card className="shadow-sm border-1">
                    <Col>
                      <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <Card.Title className="fw-bold fs-3">{reserva.salon.nombre}</Card.Title>
                          <Card.Text>
                            📍 <strong>Ubicación:</strong> {reserva.salon.ubicacion} <br />
                            <strong className="fw-bold fs-4">Fecha de Reservación:</strong> <br />
                            <strong className="fw-bold fs-4">{new Date(reserva.fecha).toLocaleDateString("es-MX", { timeZone: "UTC" })}</strong>
                          </Card.Text>
                        </div>

                        <div className="text-end ms-md-3 mt-3 mt-md-0">
                          <Card.Title className="fw-bold fs-4">${reserva.total.toLocaleString("es-MX")}</Card.Title>
                          <StarRating rating={reserva.salon.calificacion} size={20} />
                          <Card.Title className={`fw-bold fs-4 mt-3 ${
                            reserva.estado === "aprobada" ? "text-success" :
                            reserva.estado === "pendiente" ? "text-warning" :
                            "text-danger"
                          }`}>
                            {reserva.estado.toUpperCase()}
                          </Card.Title>

                          <div className="d-flex flex-column gap-2 mt-2">
                            {reserva.estado === "aprobada" && !reserva.pagoRealizado && (
                              <>
                                <Button variant="primary" onClick={() => handlePagar(reserva._id)}>💳 Pagar Ahora</Button>
                                <Button variant="success" onClick={() => handleConfirmarPago(reserva._id)}>✅ Confirmar Pago (Pruebas)</Button>
                              </>
                            )}

                            {reserva.estado === "pendiente" && (
                              <Button variant="danger" onClick={() => handleCancelarReserva(reserva._id)}>❌ Cancelar Reserva</Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Col>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ReservasPage;
