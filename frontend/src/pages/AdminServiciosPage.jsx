// frontend/src/pages/AdminServiciosPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Card, Alert, Row, Col, Carousel } from "react-bootstrap";
import api from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";

function AdminServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/servicios", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setServicios(response.data))
      .catch((error) => console.error("Error al obtener servicios:", error));
  }, [token]);

  const handleEliminarServicio = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      await api.delete(`/servicios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicios(servicios.filter((servicio) => servicio._id !== id));
      alert("Servicio eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      alert("Error al eliminar el servicio.");
    }
  };

  return (
    <Container className="py-5">
      <h1 className="text-center">Gestión de Servicios</h1>
      {servicios.length === 0 ? (
        <Alert variant="info" className="text-center">
          No hay servicios registrados.
        </Alert>
      ) : (
        <Row className="g-4">
          {servicios.map((servicio) => (
            <Col xs={12} md={6} key={servicio._id}>
              <Card className="shadow-sm border-1">
                {servicio.imagenes && servicio.imagenes.length > 0 ? (
                  <Carousel>
                    {servicio.imagenes.map((imagen, index) => (
                      <Carousel.Item key={index}>
                        <img
                          src={imagen}
                          alt={`Imagen ${index + 1}`}
                          className="d-block w-100"
                          style={{ height: "250px", objectFit: "cover" }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: "250px" }}>
                    <p className="text-muted">Sin imagen</p>
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{servicio.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Ubicación:</strong> {servicio.ubicacion}<br />
                    <strong>Tipo de Servicio:</strong> {servicio.tipoServicio}<br />
                    <strong>Descripción:</strong> {servicio.descripcion}
                  </Card.Text>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => navigate(`/admin/editar-servicio/${servicio._id}`)}
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleEliminarServicio(servicio._id)}>
                      <FaTrash /> Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default AdminServiciosPage;
