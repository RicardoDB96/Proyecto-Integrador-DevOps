import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Container, Row, Col, Card, Button, Spinner, Carousel, Form } from "react-bootstrap";
import StarRating from "../components/Estrellas"

const salonesHardcoded = [
  { _id: "1", nombre: "Gran Salón Imperial", ubicacion: "CDMX", capacidad: 500, precio: 15000, calificacion: 4.5, telefono: "555-123-4567", email: "contacto@granimperial.com", imagenes: [] },
  { _id: "2", nombre: "Salón Bella Vista", ubicacion: "Monterrey", capacidad: 300, precio: 12000, calificacion: 3.0, telefono: "812-987-6543", email: "info@bellavista.com", imagenes: [] },
  { _id: "3", nombre: "Eventos Elegance", ubicacion: "Guadalajara", capacidad: 400, precio: 18000, calificacion: 5.0, telefono: "33-4444-5555", email: "reservas@elegance.com", imagenes: [] },
  { _id: "4", nombre: "Salón Crystal", ubicacion: "Cancún", capacidad: 250, precio: 10000, calificacion: 4.0, telefono: "998-223-3344", email: "contacto@crystalcancun.com", imagenes: [] },
  { _id: "5", nombre: "Salón Real", ubicacion: "Querétaro", capacidad: 200, precio: 8500, calificacion: 3.5, telefono: "442-789-1011", email: "info@salonreal.com", imagenes: [] },
  { _id: "6", nombre: "Palacio de Eventos", ubicacion: "León", capacidad: 600, precio: 20000, calificacion: 4.8, telefono: "477-555-6789", email: "contacto@palaciodeeventos.com", imagenes: [] },
  { _id: "7", nombre: "Jardines del Sol", ubicacion: "CDMX", capacidad: 350, precio: 13000, calificacion: 4.0, telefono: "55-3333-2222", email: "info@jardinesdelsol.com", imagenes: [] },
  { _id: "8", nombre: "Eventos Riviera", ubicacion: "Playa del Carmen", capacidad: 275, precio: 11000, calificacion: 4.2, telefono: "984-666-7777", email: "reservas@eventosriviera.com", imagenes: [] },
  { _id: "9", nombre: "Salón Majestuoso", ubicacion: "CDMX", capacidad: 450, precio: 17000, calificacion: 2.8, telefono: "55-8888-9999", email: "contacto@salonmajestuoso.com", imagenes: [] },
  { _id: "10", nombre: "Salón Diamante", ubicacion: "Monterrey", capacidad: 320, precio: 14000, calificacion: 3.7, telefono: "81-7777-6666", email: "info@salondiamante.com", imagenes: [] },
];

function SalonesPage() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSalones(salonesHardcoded);
    setLoading(false);
    
    // const obtenerSalones = async () => {
    //   try {
    //     const response = await api.get("/salones");
    //     console.log("📸 Imágenes recibidas:", response.data); // 🔹 Agregar este log
    //     setSalones(response.data);
    //   } catch (error) {
    //     console.error("❌ Error al obtener los salones:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // obtenerSalones();
  }, []);

  const [filtros, setFiltros] = useState({
    nombre: "",
    precio: "",
    ubicacion: "",
    capacidad: 0,
  });

  const quitarAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const capacidadMin = Math.min(...salones.map((s) => s.capacidad));
  const capacidadMax = Math.max(...salones.map((s) => s.capacidad));

  const salonesFiltrados = salones.filter((salon) => {
    return (
      (filtros.nombre === "" || quitarAcentos(salon.nombre.toLowerCase()).includes(quitarAcentos(filtros.nombre.toLowerCase()))) &&
      (filtros.precio === "" || salon.precio <= parseInt(filtros.precio)) &&
      (filtros.ubicacion === "" || quitarAcentos(salon.ubicacion.toLowerCase()).includes(quitarAcentos(filtros.ubicacion.toLowerCase()))) &&
      salon.capacidad >= filtros.capacidad
    );
  });

  return (
    <Container className="py-5">
      <h1 className="text-center">🏛️ Salones Disponibles</h1>

      <Row>
        <Col md={3}>
          <Card className="p-3 mb-4">
            <h5>🔍 Filtrar Salones</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>📛 Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre"
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>💰 Precio Máximo</Form.Label>
                <Form.Control
                  type="number"
                  step={1000}
                  placeholder="Ej: 12000"
                  value={filtros.precio}
                  onChange={(e) => setFiltros({ ...filtros, precio: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📍 Ubicación</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: CDMX"
                  value={filtros.ubicacion}
                  onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>🏢 Capacidad Mínima: {filtros.capacidad}</Form.Label>
                <Form.Range
                  min={capacidadMin}
                  max={capacidadMax}
                  value={filtros.capacidad}
                  onChange={(e) => setFiltros({ ...filtros, capacidad: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Form>
          </Card>
        </Col>
        <Col md={9}>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status" />
              <p>Cargando salones...</p>
            </div>
          ) : salonesFiltrados.length === 0 ? (
            <p className="text-center text-muted">No hay salones disponibles con estos filtros.</p>
          ) : (
            <Row className="g-4">
              {salonesFiltrados.map((salon) => (
                <Col xs={12} key={salon._id}>
                  <Card className="shadow-sm border-1">
                    <Row className="g-0">
                      
                      <Col md={4} className="d-flex align-items-center">
                      {salon.imagenes && salon.imagenes.length > 0 ? (
                        <Carousel className="w-100">
                          {salon.imagenes.map((imagen, index) => (
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
                                <Card.Title className="fw-bold fs-3">{salon.nombre}</Card.Title>
                                <Card.Text>
                                  📍 <strong>Ubicación:</strong> {salon.ubicacion} <br />
                                  🏢 <strong>Capacidad:</strong> {salon.capacidad} personas <br />
                                  ☎️ <strong>Teléfono:</strong> {salon.telefono} <br />
                                  📧 <strong>Email:</strong> {salon.email}
                                </Card.Text>
                              </Card.Body>
                            </Col>
                            <Col md={4}>
                              <Card.Body className="d-flex flex-column" style={{ height: "100%" }}>
                                <Card.Title className="fw-bold fs-4 text-end">${salon.precio.toLocaleString("es-MX")}</Card.Title>
                                <div className="d-flex justify-content-end"><StarRating rating={salon.calificacion} size={20} /></div>
                                <Button as={Link} to={`/salones/${salon._id}`} variant="success" className="mt-auto position-absolute bottom-0 end-0 mb-3 me-3">
                                Ver Detalles
                                </Button>
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

export default SalonesPage;
