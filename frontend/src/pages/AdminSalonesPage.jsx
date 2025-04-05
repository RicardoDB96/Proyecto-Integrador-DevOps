// frontend/src/pages/AdminSalonesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Alert, Row, Col, Card, Carousel, Form} from "react-bootstrap";
import api from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa"; // ✅ Import icons
import StarRating from "../components/Estrellas"


function AdminSalonesPage() {
  const [salones, setSalones] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/salones", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setSalones(response.data))
      .catch((error) => console.error("Error al obtener salones:", error));
  }, [token]);

  // ✅ Handle Delete Salon
  const handleEliminarSalon = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este salón?")) return;

    try {
      await api.delete(`/salones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSalones(salones.filter((salon) => salon._id !== id));
      alert("Salón eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el salón:", error);
      alert("Error al eliminar el salón.");
    }
  };

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
      <h1 className="text-center">🏢 Gestión de Salones</h1>

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
          {salones.length === 0 ? (
          <Alert variant="info" className="text-center">
            No hay salones registrados.
          </Alert>
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
                                </Card.Text>
                              </Card.Body>
                            </Col>
                            <Col md={4}>
                              <Card.Body className="d-flex flex-column" style={{ height: "100%" }}>
                                <Card.Title className="fw-bold fs-4 text-end">${salon.precio.toLocaleString("es-MX")}</Card.Title>
                                <div className="d-flex justify-content-end pb-5"><StarRating rating={salon.calificacion} size={20} /></div>
                                <Button
                                  variant="primary"
                                  className="mb-2"
                                  onClick={() => navigate(`/admin/editar-salon/${salon._id}`)}
                                >
                                  <FaEdit /> Editar
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => handleEliminarSalon(salon._id)}
                                >
                                  <FaTrash /> Eliminar
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

export default AdminSalonesPage;
