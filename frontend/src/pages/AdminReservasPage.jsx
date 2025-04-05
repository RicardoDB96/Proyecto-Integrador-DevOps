import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Button, Alert, Row, Col, Card, Form, Carousel } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Íconos
import StarRating from "../components/Estrellas"

const reservasHardcoded = [
  {
    _id: "1",
    salon: { _id: "1", nombre: "Gran Salón Imperial", ubicacion: "CDMX", capacidad: 500, precio: 15000, calificacion: 4.5, telefono: "555-123-4567", email: "contacto@granimperial.com", imagenes: [] },
    fecha: "2025-04-25",
    estado: "pendiente",
    cliente: {nombre:"Marcelo", email:"lorem@ipsum.com"},
    total: 15000,
    pagoRealizado: false
  },
  {
    _id: "2",
    salon: { _id: "2", nombre: "Salón Bella Vista", ubicacion: "Monterrey", capacidad: 300, precio: 12000, calificacion: 3.0, telefono: "812-987-6543", email: "info@bellavista.com", imagenes: [] },
    fecha: "2025-04-17",
    estado: "aprobada",
    cliente: {nombre:"Marcelo", email:"lorem@ipsum.com"},
    total: 12000,
    pagoRealizado: false
  },
  {
    _id: "3",
    salon: { _id: "2", nombre: "Salón Bella Vista", ubicacion: "Monterrey", capacidad: 300, precio: 12000, calificacion: 3.0, telefono: "812-987-6543", email: "info@bellavista.com", imagenes: [] },
    fecha: "2025-04-07",
    estado: "rechazada",
    cliente: {nombre:"Marcelo", email:"lorem@ipsum.com"},
    total: 12000,
    pagoRealizado: false
  }
];

function AdminReservasPage() {
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    setReservas(reservasHardcoded)
    // if (!token || usuario?.rol !== "admin") {
    //   alert("Acceso denegado. Debes ser administrador.");
    //   navigate("/");
    //   return;
    // }

    // api.get("/reservas", {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // .then(response => setReservas(response.data))
    // .catch(error => console.error("Error al obtener reservas:", error));
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
      (filtros.nombreCliente === "" || 
        quitarAcentos(reserva.cliente.nombre.toLowerCase()).includes(
          quitarAcentos(filtros.nombreCliente.toLowerCase())
        )) &&
      (filtros.estado === "" || 
        reserva.estado.toLowerCase() === filtros.estado.toLowerCase()) &&
      (filtros.fecha === "" || 
        fechaReserva === fechaFiltro)
    );
  }));

  return (
    <Container className="py-5">

      <h1 className="text-center">📅 Mis Reservas de Administrador</h1>

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
                <Form.Label>👤 Nombre del Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por cliente"
                  value={filtros.nombreCliente}
                  onChange={(e) => setFiltros({ ...filtros, nombreCliente: e.target.value })}
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
                              👤 <strong>Cliente:</strong> {reserva.cliente.nombre} <br />
                              📧 <strong>Email de Cliente:</strong> {reserva.cliente.email} <br />
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
                              {reserva.estado === "pendiente" && !reserva.pagoRealizado && (
                                <>
                                  <Button 
                                    variant="success"
                                    onClick={() => actualizarEstadoReserva(reserva._id, "aprobada")}
                                  >
                                  <FaCheckCircle /> Aprobar
                                  </Button>
                                  <Button 
                                    variant="danger"
                                    onClick={() => actualizarEstadoReserva(reserva._id, "rechazada")}
                                  >
                                  <FaTimesCircle /> Rechazar
                                  </Button>
                                </>
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

export default AdminReservasPage;