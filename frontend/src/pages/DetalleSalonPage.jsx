// frontend/src/pages/DetalleSalonPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Container, Row, Col, Card, Carousel, Alert, Modal, Spinner, Button, Form } from "react-bootstrap";
import SalonCalendar from "../components/SalonCalendar";

function DetalleSalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [reservas, setReservas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching salon details...");
        const salonResponse = await api.get(`/salones/${id}`);
        setSalon(salonResponse.data);

        console.log("Fetching reservations...");
        const reservasResponse = await api.get(`/reservas/salon/${id}`);
        setReservas(Array.isArray(reservasResponse.data) ? reservasResponse.data : []);

        console.log("Fetching reviews...");
        const reviewsResponse = await api.get(`/reviews/${id}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setReservas([]);
      }
    };
    fetchData();
  }, [id]);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  // 📅 Manejar reservas desde el calendario
  const handleReserva = async (selectedDate) => {
    if (!token) {
      alert("Debes iniciar sesión para hacer una reserva.");
      navigate("/login");
      return;
    }
  
    if (!selectedDate) {
      alert("Selecciona una fecha antes de reservar.");
      return;
    }
  
    // ✅ Ajustamos la fecha sumando 1 día para evitar desfases por la zona horaria
    const adjustedDate = new Date(selectedDate);
    adjustedDate.setDate(adjustedDate.getDate() + 1); // 🔹 Corrección: sumamos 1 día antes de enviar
  
    // 🗓 Convertimos a formato ISO (YYYY-MM-DD) para enviarlo al backend
    const formattedDate = adjustedDate.toISOString().split("T")[0];
  
    // 🔹 Ajustamos la fecha para mostrar en el mensaje de confirmación (restamos 1 día)
    const displayDate = new Date(adjustedDate);
    displayDate.setDate(displayDate.getDate() - 1); // 🔹 Restamos 1 día solo para mostrar
  
    try {
      await api.post(
        "/reservas",
        { salonId: id, fecha: formattedDate, total: Number(salon.precio) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setMensaje(`✅ Reserva realizada con éxito para el ${displayDate.toLocaleDateString("es-MX")}`);
      setReservas([...reservas, { fecha: formattedDate, estado: "pendiente" }]);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error al reservar:", error.response?.data || error);
      setMensaje(`❌ Error al reservar: ${error.response?.data?.mensaje || "Inténtalo de nuevo."}`);
    }
  };   

  const handleAgregarReseña = async () => {
    if (!token) {
      alert("Debes iniciar sesión para agregar una reseña.");
      navigate("/login");
      return;
    }
  
    if (!calificacion || !comentario.trim()) {
      alert("⚠ Debes agregar una calificación y un comentario.");
      return;
    }
  
    try {
      const response = await api.post(
        "/reviews",
        { salonId: id, calificacion, comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setMensaje("✅ Reseña agregada con éxito.");
      setReviews([...reviews, response.data.reseña]); // Agregar reseña a la lista sin recargar
  
      // Reset form
      setCalificacion(5);
      setComentario("");
    } catch (error) {
      console.error("❌ Error al agregar reseña:", error.response?.data || error);
      setMensaje(`❌ ${error.response?.data?.mensaje || "No puedes agregar una reseña en este momento."}`);
    }
  };

  if (!salon) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <h2 className="mt-3">⏳ Cargando detalles del salón...</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          {/* 🔹 Carrusel de imágenes */}
          {salon.imagenes && salon.imagenes.length > 0 ? (
            <Carousel>
              {salon.imagenes.map((imagen, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={imagen} // ✅ Ahora carga desde GCS
                    alt={`Imagen ${index + 1}`}
                    style={{ borderRadius: "10px", maxHeight: "400px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => openImageModal(imagen)}
                    onError={(e) => (e.target.style.display = "none")} // Oculta si hay error
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Card className="p-3 text-center">
              <p>📷 No hay imágenes disponibles.</p>
            </Card>
          )}
        </Col>

        {/* 🔹 Información del salón */}
        <Col md={6}>
          <Card className="p-4 shadow-lg">
            <h2>{salon.nombre}</h2>
            <p><strong>📍 Ubicación:</strong> {salon.ubicacion}</p>
            <p><strong>👥 Capacidad:</strong> {salon.capacidad} personas</p>
            <p><strong>📞 Teléfono:</strong> {salon.telefono}</p>
            <p><strong>📧 Correo Electrónico:</strong> {salon.email}</p>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Calendario de reservas */}
      <Col md={12} className="mt-4">
        <SalonCalendar 
          reservas={reservas} 
          setSelectedDate={setSelectedDate} 
          selectedDate={selectedDate} 
          handleReserva={handleReserva} 
        />
      </Col>

      {mensaje && (
        <Alert className="mt-3" variant={mensaje.includes("Error") ? "danger" : "success"}>
          {mensaje}
        </Alert>
      )}

      {/* 🔹 Modal de imágenes */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <img
            src={selectedImage}
            alt="Imagen ampliada"
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }}
          />
        </Modal.Body>
      </Modal>

      {/* 🔹 Opiniones */}
      <Card className="p-4 mt-4 shadow-lg">
        <h3>📢 Opiniones</h3>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id} className="p-3 mt-2">
              <strong>{review.cliente.nombre}</strong> {review.calificacion}⭐
              <p>{review.comentario}</p>
              {usuario.rol === "admin" && <Button variant="danger" size="sm">Eliminar</Button>}
            </Card>
          ))
        ) : (
          <p>No hay reseñas aún.</p>
        )}
      </Card>

      {/* 🔹 Sección de agregar reseñas */}
      <Card className="p-4 mt-4 shadow-lg">
        <h3>📝 Agregar Reseña</h3>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>⭐ Calificación</Form.Label>
            <Form.Select value={calificacion} onChange={(e) => setCalificacion(parseInt(e.target.value))}>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} estrellas
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>✍ Comentario</Form.Label>
            <Form.Control as="textarea" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} />
          </Form.Group>

          <Button variant="success" onClick={handleAgregarReseña}>
            Agregar Reseña
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default DetalleSalonPage;