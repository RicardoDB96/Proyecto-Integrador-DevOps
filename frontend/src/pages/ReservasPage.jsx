// frontend/src/pages/ReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Button, Alert, Row, Col, Card, Carousel, Form } from "react-bootstrap";
import StarRating from "../components/Estrellas"

const reservasHardcoded = [
  {
    _id: "1",
    salon: { _id: "1", nombre: "Gran Salón Imperial", ubicacion: "CDMX", capacidad: 500, precio: 15000, calificacion: 4.5, telefono: "555-123-4567", email: "contacto@granimperial.com", imagenes: [] },
    fecha: "2025-04-25", // Mañana
    estado: "pendiente",
    total: 15000,
    pagoRealizado: false
  },
  {
    _id: "2",
    salon: { _id: "2", nombre: "Salón Bella Vista", ubicacion: "Monterrey", capacidad: 300, precio: 12000, calificacion: 3.0, telefono: "812-987-6543", email: "info@bellavista.com", imagenes: [] },
    fecha: "2025-04-17", // Pasado mañana
    estado: "aprobada",
    total: 12000,
    pagoRealizado: false
  },
  {
    _id: "3",
    salon: { _id: "2", nombre: "Salón Bella Vista", ubicacion: "Monterrey", capacidad: 300, precio: 12000, calificacion: 3.0, telefono: "812-987-6543", email: "info@bellavista.com", imagenes: [] },
    fecha: "2025-04-07", // Pasado mañana
    estado: "rechazada",
    total: 12000,
    pagoRealizado: false
  }
];

function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setReservas(reservasHardcoded);
    // if (!token) return;

    // api
    //   .get("/reservas/mis-reservas", {
    //     headers: { Authorization: `Bearer ${token}` },
    //   })
    //   .then((response) => setReservas(response.data))
    //   .catch((error) => console.error("Error al obtener reservas:", error));
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

  const [filtros, setFiltros] = useState({
      nombreSalon: "",
      nombreCliente: "",
      estado: "",
      fecha: ""
    });

  const quitarAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Función para ordenar las reservas
  const ordenarReservas = (reservas) => {
    return [...reservas].sort((a, b) => {
      // Primero ordenar por estado (pendientes primero)
      const ordenEstados = { pendiente: 1, aprobada: 2, rechazada: 3 };
      if (ordenEstados[a.estado] !== ordenEstados[b.estado]) {
        return ordenEstados[a.estado] - ordenEstados[b.estado];
      }
      
      // Luego ordenar por fecha (más nuevas primero)
      return new Date(b.fecha) - new Date(a.fecha);
    });
  };

  // Filtrar y ordenar las reservas
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
                <Row className="g-0">
                  
                  <Col md={4} className="d-flex align-items-center">
                  {reserva.salon.imagenes && reserva.salon.imagenes.length > 0 ? (
                    <Carousel className="w-100">
                      {reserva.salon.imagenes.map((imagen, index) => (
                        <Carousel.Item key={index}>
                          <img
                            src={imagen} // ✅ Ahora carga desde GCS
                            alt={`Imagen ${index + 1}`}
                            className="rounded-start w-100"
                            style={{ height: "250px", objectFit: "cover" }}
                            onError={(e) => (e.target.style.display = "none")} // Oculta si hay error
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: "250px", width: "100%" }}>
                      <p className="text-muted">Sin imagen</p>
                    </div>
                  )}
                  </Col> 

                  <Col md={8}>
                      <Row>
                        <Col md={8}>
                          <Card.Body className="d-flex flex-column" style={{ height: "100%" }}>
                            <Card.Title className="fw-bold fs-3">{reserva.salon.nombre}</Card.Title>
                            <Card.Text>
                              📍 <strong>Ubicación:</strong> {reserva.salon.ubicacion} <br />
                              🏢 <strong>Capacidad:</strong> {reserva.salon.capacidad} personas <br />
                              ☎️ <strong>Teléfono:</strong> {reserva.salon.telefono} <br />
                              📧 <strong>Email:</strong> {reserva.salon.email} <br />
                              <strong className="fw-bold fs-4">Fecha de Reservacion:</strong> <br />
                              <strong className="fw-bold fs-4">{new Date(reserva.fecha).toLocaleDateString("es-MX", {timeZone: 'UTC'})}</strong>
                            </Card.Text>
                          </Card.Body>
                        </Col>
                        <Col md={4}>
                          <Card.Body className="d-flex flex-column" style={{ height: "100%" }}>
                            <Card.Title className="fw-bold fs-4 text-end">${reserva.total.toLocaleString("es-MX")}</Card.Title>
                            <div className="d-flex justify-content-end"><StarRating rating={reserva.salon.calificacion} size={20} /></div>
                            <Card.Title className={`fw-bold fs-4 text-end mt-5 ${
                            reserva.estado === "aprobada" ? "text-success" :
                            reserva.estado === "pendiente" ? "text-warning" :
                            "text-danger"
                            }`}>{reserva.estado.toUpperCase()}</Card.Title>
                            <div className="d-flex flex-column gap-2">
                              {reserva.estado === "aprobada" && !reserva.pagoRealizado && (
                                <>
                                  <Button 
                                    variant="primary"
                                    onClick={() => handlePagar(reserva._id)}
                                  >
                                    💳 Pagar Ahora
                                  </Button>
                                  <Button 
                                    variant="success"
                                    onClick={() => handleConfirmarPago(reserva._id)}
                                  >
                                    ✅ Confirmar Pago (Pruebas)
                                  </Button>
                                </>
                              )}
                              
                              {reserva.estado === "pendiente" && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleCancelarReserva(reserva._id)}
                                >
                                  ❌ Cancelar Reserva
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
                  </Col>

                </Row>
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
