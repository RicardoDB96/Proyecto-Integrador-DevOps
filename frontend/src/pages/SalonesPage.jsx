// frontend/src/pages/SalonesPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Container, Row, Col, Card, Button, Spinner, Carousel } from "react-bootstrap";

function SalonesPage() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerSalones = async () => {
      try {
        const response = await api.get("/salones");
        console.log("📸 Imágenes recibidas:", response.data); // 🔹 Agregar este log
        setSalones(response.data);
      } catch (error) {
        console.error("❌ Error al obtener los salones:", error);
      } finally {
        setLoading(false);
      }
    };
  
    obtenerSalones();
  }, []);

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">🏛️ Salones Disponibles</h1>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Cargando salones...</p>
        </div>
      ) : salones.length === 0 ? (
        <p className="text-center text-muted">No hay salones disponibles en este momento.</p>
      ) : (
        <Row className="g-4">
          {salones.map((salon) => (
            <Col xs={12} key={salon._id}>
              <Card className="shadow-sm border-1">
                <Row className="g-0">
                  {/* 📸 Sección de imágenes */}
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

                  {/* 📋 Sección de detalles */}
                  <Col md={8}>
                    <Card.Body>
                      <Card.Title>{salon.nombre}</Card.Title>
                      <Card.Text>
                        📍 <strong>Ubicación:</strong> {salon.ubicacion} <br />
                        🏢 <strong>Capacidad:</strong> {salon.capacidad} personas <br />
                        💰 <strong>Precio:</strong> ${salon.precio} <br />
                        ☎️ <strong>Teléfono:</strong> {salon.telefono} <br />
                        📧 <strong>Email:</strong> {salon.email}
                      </Card.Text>

                      <Button as={Link} to={`/salones/${salon._id}`} variant="primary" className="mt-2">
                        Ver Detalles
                      </Button>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SalonesPage;