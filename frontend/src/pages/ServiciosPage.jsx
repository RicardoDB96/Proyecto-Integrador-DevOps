// frontend/src/pages/ServiciosPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Carousel,
  Form,
} from "react-bootstrap";

function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nombre: "",
    ubicacion: "",
    tipoServicio: "",
  });

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const response = await api.get("/servicios");
        setServicios(response.data);
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerServicios();
  }, []);

  const quitarAcentos = (str) =>
    str.normalize("NFD").replace(/[̀-ͯ]/g, "");

  const serviciosFiltrados = servicios.filter((servicio) =>
    (filtros.nombre === "" ||
      quitarAcentos(servicio.nombre.toLowerCase()).includes(
        quitarAcentos(filtros.nombre.toLowerCase())
      )) &&
    (filtros.ubicacion === "" ||
      quitarAcentos(servicio.ubicacion.toLowerCase()).includes(
        quitarAcentos(filtros.ubicacion.toLowerCase())
      )) &&
    (filtros.tipoServicio === "" ||
      quitarAcentos(servicio.tipoServicio.toLowerCase()).includes(
        quitarAcentos(filtros.tipoServicio.toLowerCase())
      ))
  );

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Servicios</h1>

      <Row className="mb-4 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form.Control
            type="text"
            placeholder="🔍 Buscar por nombre"
            value={filtros.nombre}
            onChange={(e) =>
              setFiltros({ ...filtros, nombre: e.target.value })
            }
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Cargando servicios...</p>
        </div>
      ) : serviciosFiltrados.length === 0 ? (
        <p className="text-center text-muted">
          No hay servicios disponibles.
        </p>
      ) : (
        <Row className="g-4 align-items-stretch">
          {serviciosFiltrados.map((servicio) => (
            <Col xs={12} md={6} lg={4} key={servicio._id}>
              <Card className="h-100 shadow-sm border-0">
                {servicio.imagenes && servicio.imagenes.length > 0 ? (
                  <Carousel>
                    {servicio.imagenes.map((imagen, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={imagen}
                          alt={`Imagen ${idx + 1}`}
                          className="d-block w-100"
                          style={{ height: "200px", objectFit: "cover" }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light"
                    style={{ height: "200px" }}
                  >
                    <span className="text-muted">Sin imagen</span>
                  </div>
                )}

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3 text-primary">
                    {servicio.nombre}
                  </Card.Title>
                  <div className="mb-2">
                    <strong>📍 Ubicación:</strong> {servicio.ubicacion}
                  </div>
                  <div className="mb-2">
                    <strong>🛠 Tipo:</strong> {servicio.tipoServicio}
                  </div>
                  <Card.Text className="flex-grow-1 text-secondary">
                    {servicio.descripcion}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ServiciosPage;
