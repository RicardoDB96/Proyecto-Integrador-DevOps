// frontend/src/pages/AdminEditarSalonPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Row, Col } from "react-bootstrap";
import { FaSave, FaTimes, FaTrash } from "react-icons/fa";
import api from "../services/api";

function AdminEditarSalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    capacidad: "",
    precio: "",
    descripcion: "",
    telefono: "",
    email: "",
  });

  const [imagenes, setImagenes] = useState([]); // Imágenes actuales en GCS
  const [newImages, setNewImages] = useState([]); // Imágenes nuevas a subir

  useEffect(() => {
    // Cargar datos del salón y sus imágenes
    api
      .get(`/salones/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setForm(response.data);
        setImagenes(response.data.imagenes || []);
      })
      .catch((error) => console.error("Error al cargar el salón:", error));
  }, [id, token]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar la selección de nuevas imágenes
  const handleImageChange = (e) => {
    setNewImages([...newImages, ...e.target.files]); // Agregar imágenes al estado
  };

  // Eliminar una imagen existente en GCS y MongoDB
  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta imagen?")) return;

    try {
      await api.delete(`/salones/${id}/imagen`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { imageUrl }, // Se envía la URL de la imagen a eliminar
      });

      setImagenes(imagenes.filter((img) => img !== imageUrl)); // Actualiza la UI
    } catch (error) {
      alert("❌ Error al eliminar la imagen.");
      console.error("Error:", error);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    // Mantener imágenes existentes y agregar las nuevas
    formData.append("imagenesExistentes", JSON.stringify(imagenes));
    newImages.forEach((image) => formData.append("imagenes", image));

    try {
      await api.put(`/salones/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Salón actualizado correctamente.");
      navigate("/admin/salones");
    } catch (error) {
      console.error("❌ Error al actualizar el salón:", error);
      alert("⚠ Error al actualizar el salón.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">✏ Editar Salón</h2>
            <Form onSubmit={handleSubmit}>
              {/* Campos del formulario */}
              {["nombre", "ubicacion", "capacidad", "precio", "descripcion", "telefono", "email"].map((field, index) => (
                <Form.Group className="mb-3" key={index}>
                  <Form.Label>
                    {field === "nombre" ? "🏢 Nombre" :
                     field === "ubicacion" ? "📍 Ubicación" :
                     field === "capacidad" ? "👥 Capacidad" :
                     field === "precio" ? "💰 Precio" :
                     field === "descripcion" ? "📝 Descripción" :
                     field === "telefono" ? "📞 Teléfono" :
                     "📧 Correo Electrónico"}
                  </Form.Label>
                  <Form.Control
                    type={field === "capacidad" || field === "precio" ? "number" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              ))}

              {/* 📸 Imágenes Actuales */}
              <h5>📸 Imágenes Actuales</h5>
              <Row>
                {imagenes.length > 0 ? (
                  imagenes.map((image, index) => (
                    <Col key={index} xs={6} md={4} className="mb-3">
                      <Card className="p-2">
                        <img src={image} alt="Salon" className="img-fluid rounded" />
                        <Button variant="danger" size="sm" className="mt-2" onClick={() => handleDeleteImage(image)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p>No hay imágenes disponibles.</p>
                )}
              </Row>

              {/* 📂 Agregar Nuevas Imágenes */}
              <Form.Group className="mb-3">
                <Form.Label>📂 Agregar Nuevas Imágenes</Form.Label>
                <Form.Control type="file" multiple onChange={handleImageChange} accept="image/*" />
              </Form.Group>

              {/* Botones */}
              <div className="d-flex justify-content-between">
                <Button variant="success" type="submit">
                  <FaSave className="me-2" /> Guardar Cambios
                </Button>
                <Button variant="secondary" onClick={() => navigate("/admin/salones")}>
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

export default AdminEditarSalonPage;