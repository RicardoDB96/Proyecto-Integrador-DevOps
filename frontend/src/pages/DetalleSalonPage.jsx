// frontend/src/pages/DetalleSalonPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Container, Row, Col, Card, Carousel, Alert, Modal, Spinner, Button, Form } from "react-bootstrap";
import SalonCalendar from "../components/SalonCalendar";
import StarRatingInput from "../components/CalificacionEstrellas";
import StarRating from "../components/Estrellas";

const salonHardcoded = 
  { _id: "1", nombre: "Gran Salón Imperial", ubicacion: "CDMX", capacidad: 500, precio: 15000, calificacion: 4.5, telefono: "555-123-4567", email: "contacto@granimperial.com", imagenes: [] }
;

const reviewsHardcoded = [
  {
    _id: "1",
    cliente: { nombre: "Marcelo López" },
    calificacion: 5,
    comentario: "Excelente servicio, todo perfecto. El salón estaba impecable y el personal muy atento.",
    createdAt: "2023-10-15T14:32:00.000Z"
  },
  {
    _id: "2",
    cliente: { nombre: "Ana Martínez" },
    calificacion: 4.5,
    comentario: "Muy buen lugar, solo que faltaron algunos utensilios en la cocina. Por lo demás todo excelente.",
    createdAt: "2023-11-02T09:15:00.000Z"
  },
  {
    _id: "3",
    cliente: { nombre: "Carlos Jiménez" },
    calificacion: 3,
    comentario: "El salón es bonito pero el aire acondicionado no funcionaba bien. Precio acorde a lo ofrecido.",
    createdAt: "2023-11-18T16:45:00.000Z"
  },
  {
    _id: "4",
    cliente: { nombre: "Laura García" },
    calificacion: 5,
    comentario: "¡Increíble experiencia! Lo usamos para nuestra boda y todo salió perfecto. Altamente recomendado.",
    createdAt: "2023-12-05T12:20:00.000Z"
  },
  {
    _id: "5",
    cliente: { nombre: "Roberto Sánchez" },
    calificacion: 2.5,
    comentario: "El lugar estaba sucio cuando llegamos. Tuvieron que limpiarlo mientras esperábamos. Buen espacio pero mala primera impresión.",
    createdAt: "2023-12-20T18:30:00.000Z"
  },
  {
    _id: "6",
    cliente: { nombre: "Sofía Ramírez" },
    calificacion: 4,
    comentario: "Bonito salón, buena ubicación. El servicio de catering que recomendaron fue excelente.",
    createdAt: "2024-01-08T11:10:00.000Z"
  },
  {
    _id: "7",
    cliente: { nombre: "Jorge Fernández" },
    calificacion: 1,
    comentario: "No cumplieron con lo acordado. El salón no era el que habíamos reservado según las fotos.",
    createdAt: "2024-01-22T20:05:00.000Z"
  },
  {
    _id: "8",
    cliente: { nombre: "María González" },
    calificacion: 5,
    comentario: "Perfecto para nuestro evento corporativo. Excelente atención y flexibilidad para nuestros requerimientos.",
    createdAt: "2024-02-10T15:40:00.000Z"
  },
  {
    _id: "9",
    cliente: { nombre: "David Torres" },
    calificacion: 3.5,
    comentario: "Buen salón pero el estacionamiento es complicado. Recomendaría mejorar esa parte.",
    createdAt: "2024-02-28T13:25:00.000Z"
  },
  {
    _id: "10",
    cliente: { nombre: "Patricia Morales" },
    calificacion: 4,
    comentario: "Muy contentos con el servicio. Solo sugeriría actualizar el equipo de sonido, por lo demás todo bien.",
    createdAt: "2024-03-15T19:50:00.000Z"
  }
];

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

    setSalon(salonHardcoded);
    setReviews(reviewsHardcoded)
    // const fetchData = async () => {
    //   try {
    //     console.log("Fetching salon details...");
    //     const salonResponse = await api.get(`/salones/${id}`);
    //     setSalon(salonResponse.data);

    //     console.log("Fetching reservations...");
    //     const reservasResponse = await api.get(`/reservas/salon/${id}`);
    //     setReservas(Array.isArray(reservasResponse.data) ? reservasResponse.data : []);

    //     console.log("Fetching reviews...");
    //     const reviewsResponse = await api.get(`/reviews/${id}`);
    //     setReviews(reviewsResponse.data);
    //   } catch (error) {
    //     console.error("❌ Error fetching data:", error);
    //     setReservas([]);
    //   }
    // };
    // fetchData();
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
        {/* 🔹 Información del salón */}
        <Card className="p-4 shadow-lg">
          <Row>
            <Col md={8}>
              {salon.imagenes && salon.imagenes.length > 0 ? (
                <Carousel className="w-100">
                  {salon.imagenes.map((imagen, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={imagen} // ✅ Ahora carga desde GCS
                        alt={`Imagen ${index + 1}`}
                        className="rounded-start w-100"
                        style={{ borderRadius: "10px", maxHeight: "400px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => openImageModal(imagen)}
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

            {/* 🔹 Calendario de reservas */}
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
        <Row>
          <Col md={9}>
            <h3>📢 Opiniones</h3>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review._id} className="p-3 mt-2">
                  <strong>{review.cliente.nombre}</strong>
                  <StarRating rating={review.calificacion}></StarRating>
                  <p className="mt-2">{review.comentario}</p>
                  {usuario.rol === "admin" && <Button variant="danger" size="sm">Eliminar</Button>}
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
                <StarRatingInput 
                  rating={calificacion} 
                  setRating={setCalificacion} 
                />
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