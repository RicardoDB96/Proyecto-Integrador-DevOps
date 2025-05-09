// frontend/src/pages/AdminEditarServicioPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Row, Col } from "react-bootstrap";
import { FaSave, FaTimes, FaTrash } from "react-icons/fa";
import api from "../services/api";

function AdminEditarServicioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
    telefono: "",
    email: "",
    tipoServicio: "",
  });

  const [imagenes, setImagenes] = useState([]); // Imágenes existentes
  const [newImages, setNewImages] = useState([]); // Nuevas imágenes a subir

  useEffect(() => {
    api
      .get(`/servicios/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setForm(response.data);
        setImagenes(response.data.imagenes || []);
      })
      .catch((error) => console.error("Error al cargar el servicio:", error));
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImages([...newImages, ...e.target.files]);
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta imagen?")) return;
    // En este ejemplo se elimina solo de la UI. Si tienes un endpoint para borrar la imagen del almacenamiento, llámalo aquí.
    setImagenes(imagenes.filter((img) => img !== imageUrl));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    // Se envía la lista de imágenes ya existentes
    formData.append("imagenesExistentes", JSON.stringify(imagenes));
    // Se agregan las nuevas imágenes
    newImages.forEach((image) => formData.append("imagenes", image));

    try {
      await api.put(`/servicios/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Servicio actualizado correctamente.");
      navigate("/admin/servicios");
    } catch (error) {
      console.error("Error al actualizar el servicio:", error);
      alert("Error al actualizar el servicio.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">Editar Servicio</h2>
            <Form onSubmit={handleSubmit}>
              {["nombre", "ubicacion", "descripcion", "telefono", "email", "tipoServicio"].map((field, index) => (
                <Form.Group className="mb-3" key={index}>
                  <Form.Label>
                    {field === "nombre"
                      ? "Nombre"
                      : field === "ubicacion"
                      ? "Ubicación"
                      : field === "descripcion"
                      ? "Descripción"
                      : field === "telefono"
                      ? "Teléfono"
                      : field === "email"
                      ? "Email"
                      : "Tipo de Servicio"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              ))}

              <h5>Imágenes Actuales</h5>
              <Row>
                {imagenes && imagenes.length > 0 ? (
                  imagenes.map((img, index) => (
                    <Col key={index} xs={6} md={4} className="mb-3">
                      <Card className="p-2">
                        <img src={img} alt="Servicio" className="img-fluid rounded" />
                        <Button variant="danger" size="sm" onClick={() => handleDeleteImage(img)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p>No hay imágenes disponibles.</p>
                )}
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Agregar Nuevas Imágenes</Form.Label>
                <Form.Control type="file" multiple onChange={handleImageChange} accept="image/*" />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="success" type="submit">
                  <FaSave className="me-2" /> Guardar Cambios
                </Button>
                <Button variant="secondary" onClick={() => navigate("/admin/servicios")}>
                  <FaTimes className="me-2" /> Cancelar
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminEditarServicioPage;
