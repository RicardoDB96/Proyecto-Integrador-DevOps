// frontend/src/pages/AdminAgregarSalonPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Row, Col, Image } from "react-bootstrap";
import { FaPlus, FaArrowLeft } from "react-icons/fa";

function AdminAgregarSalonPage() {
  const [form, setForm] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    precio: '',
    descripcion: '',
    contacto: '',
    telefono: '',  // ✅ Added phone field
    email: '',  // ✅ Added email field
  });

  const [imagenes, setImagenes] = useState(null);
  const [preview, setPreview] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (!token || usuario?.rol !== "admin") {
      alert("Acceso denegado. Debes ser administrador.");
      navigate("/");
      return;
    }
  }, [token, usuario, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    const files = e.target.files;
    setImagenes(files);
    const previewUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));

    if (imagenes) {
      Array.from(imagenes).forEach((image) => {
        formData.append("imagenes", image);
      });
    }

    try {
      await api.post("/salones", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Salón agregado con éxito");
      navigate("/admin/salones");
    } catch (error) {
      console.error("❌ Error al agregar el salón:", error);
      alert("⚠ Error al agregar el salón.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">🏛️ Agregar Nuevo Salón</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>🏢 Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📍 Ubicación</Form.Label>
                <Form.Control type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📞 Teléfono</Form.Label>
                <Form.Control type="text" name="telefono" value={form.telefono} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📧 Correo Electrónico</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>👥 Capacidad</Form.Label>
                <Form.Control type="number" name="capacidad" value={form.capacidad} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>💰 Precio</Form.Label>
                <Form.Control type="number" name="precio" value={form.precio} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📝 Descripción</Form.Label>
                <Form.Control as="textarea" name="descripcion" rows={3} value={form.descripcion} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>🖼️ Imágenes</Form.Label>
                <Form.Control type="file" name="imagenes" multiple onChange={handleImagenChange} accept="image/*" />
              </Form.Group>

              {preview.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {preview.map((src, index) => (
                    <Image key={index} src={src} thumbnail width={100} height={100} />
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-between">
                <Button variant="success" type="submit">
                  <FaPlus className="me-2" /> Agregar Salón
                </Button>
                
                <Button variant="secondary" onClick={() => navigate("/admin/salones")}>
                  <FaArrowLeft className="me-2" /> Cancelar
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminAgregarSalonPage;
