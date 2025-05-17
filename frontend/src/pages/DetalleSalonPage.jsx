import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Container, Row, Col, Card, Carousel, Alert, Modal, Spinner, Button, Form } from "react-bootstrap";
import SalonCalendar from "../components/SalonCalendar";
import StarRatingInput from "../components/CalificacionEstrellas";
import StarRating from "../components/Estrellas";

function DetalleSalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [calificacion, setCalificacion] = useState(0);
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
        const salonResponse = await api.get(`/salones/${id}`);
        setSalon(salonResponse.data);

        const reservasResponse = await api.get(`/reservas/salon/${id}`);
        setReservas(Array.isArray(reservasResponse.data) ? reservasResponse.data : []);

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

    const adjustedDate = new Date(selectedDate);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    const formattedDate = adjustedDate.toISOString().split("T")[0];
    const displayDate = new Date(adjustedDate);
    displayDate.setDate(displayDate.getDate() - 1);

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
      setReviews([...reviews, response.data.reseña]);
      setCalificacion(5);
      setComentario("");
    } catch (error) {
      console.error("❌ Error al agregar reseña:", error.response?.data || error);
      setMensaje(`❌ ${error.response?.data?.mensaje || "No puedes agregar una reseña en este momento."}`);
    }
  };

  const handleEliminarReseña = async (idReseña) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reseña?")) return;

    try {
      await api.delete(`/reviews/${idReseña}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews(reviews.filter((review) => review._id !== idReseña));
      setMensaje("✅ Reseña eliminada correctamente.");
    } catch (error) {
      console.error("❌ Error al eliminar reseña:", error);
      setMensaje(`❌ ${error.response?.data?.mensaje || "Error al eliminar la reseña."}`);
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
        <Card className="p-4 shadow-lg">
          <Row>
            <Col md={8}>
              {salon.imagenes && salon.imagenes.length > 0 ? (
                <Carousel className="w-100">
                  {salon.imagenes.map((imagen, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={imagen}
                        alt={`Imagen ${index + 1}`}
                        className="rounded-start w-100"
                        style={{ borderRadius: "10px", maxHeight: "400px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => openImageModal(imagen)}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: "250px", width: "100%" }}>
                  <p className="text-muted">Sin imagen</p>
                </div>
              )}
              <h2 className="d-flex align-items-center gap-3 mb-0 pb-2">
                {salon.nombre}
                <div className="d-flex align-items-center" style={{ lineHeight: '1' }}>
                  <StarRating rating={salon.calificacion} size={30} />
                </div>
              </h2>
              <p><strong>📍 Ubicación:</strong> {salon.ubicacion}</p>
              <p><strong>👥 Capacidad:</strong> {salon.capacidad} personas</p>
              <p><strong>📞 Teléfono:</strong> {salon.telefono}</p>
              <p><strong>📧 Correo Electrónico:</strong> {salon.email}</p>
            </Col>

            <Col md={4}>
              <SalonCalendar 
                reservas={reservas} 
                setSelectedDate={setSelectedDate} 
                selectedDate={selectedDate} 
                handleReserva={handleReserva} 
              />
            </Col>
          </Row>
        </Card>
      </Row>

      {mensaje && (
        <Alert className="mt-3" variant={mensaje.includes("Error") ? "danger" : "success"}>
          {mensaje}
        </Alert>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <img
            src={selectedImage}
            alt="Imagen ampliada"
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }}
          />
        </Modal.Body>
      </Modal>

      <Card className="p-4 mt-4 shadow-lg">
        <Row>
          <Col md={9}>
            <h3>📢 Opiniones</h3>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review._id} className="p-3 mt-2">
                  <strong>{review.cliente.nombre}</strong>
                  <StarRating rating={review.calificacion} />
                  <p className="mt-2">{review.comentario}</p>
                  {(usuario.rol === "admin" || review.cliente._id === usuario._id) && (
                    <Button variant="danger" size="sm" onClick={() => handleEliminarReseña(review._id)}>
                      Eliminar
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <p>No hay reseñas aún.</p>
            )}
          </Col>
          <Col md={3}>
            <h3>📝 Agregar Reseña</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Calificación:</Form.Label>
                <StarRatingInput rating={calificacion} setRating={setCalificacion} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Comentario:</Form.Label>
                <Form.Control as="textarea" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} />
              </Form.Group>

              <Button variant="success" onClick={handleAgregarReseña}>
                Agregar Reseña
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default DetalleSalonPage;
