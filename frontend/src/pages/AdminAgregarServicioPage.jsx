// frontend/src/pages/AdminAgregarServicioPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Row, Col, Image } from "react-bootstrap";
import { FaPlus, FaArrowLeft } from "react-icons/fa";

function AdminAgregarServicioPage() {
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
    telefono: "",
    email: "",
    tipoServicio: "",
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
      Array.from(imagenes).forEach(image => {
        formData.append("imagenes", image);
      });
    }

    try {
      await api.post("/servicios", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Servicio agregado con éxito");
      navigate("/admin/servicios");
    } catch (error) {
      console.error("❌ Error al agregar el servicio:", error);
      alert("⚠ Error al agregar el servicio.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">➕ Agregar Nuevo Servicio</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" name="descripcion" rows={3} value={form.descripcion} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="text" name="telefono" value={form.telefono} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Servicio</Form.Label>
                <Form.Control type="text" name="tipoServicio" value={form.tipoServicio} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Imágenes</Form.Label>
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
                  <FaPlus className="me-2" /> Agregar Servicio
                </Button>
                <Button variant="secondary" onClick={() => navigate("/admin/servicios")}>
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

export default AdminAgregarServicioPage;
