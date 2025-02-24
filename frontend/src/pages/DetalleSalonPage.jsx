//frontend/src/pages/DetalleSalonPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function DetalleSalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salonResponse = await api.get(`/salones/${id}`);
        setSalon(salonResponse.data);
        const reviewsResponse = await api.get(`/reviews/${id}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("Error al obtener el salón o las reseñas", error);
      }
    };
    fetchData();
  }, [id]);

  const handleReserva = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Debes iniciar sesión para hacer una reserva.");
      navigate("/login");
      return;
    }

    try {
      await api.post("/reservas", {
        salonId: id,
        fecha,
        total: salon.precio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("Reserva realizada con éxito.");
      setFecha("");
    } catch (error) {
      setMensaje("Error al realizar la reserva. Inténtalo de nuevo.");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Debes iniciar sesión para agregar una reseña.");
      navigate("/login");
      return;
    }

    try {
      const response = await api.post("/reviews", {
        salonId: id,
        calificacion,
        comentario
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews([...reviews, response.data.reseña]);
      setComentario("");
      alert("Reseña agregada con éxito");
    } catch (error) {
      alert("Error al agregar la reseña. Asegúrate de que cumplas los requisitos para reseñar.");
      console.error(error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reseña?")) return;
    if (!token) {
      alert("Debes iniciar sesión como administrador para eliminar reseñas.");
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.filter(review => review._id !== reviewId));
      alert("Reseña eliminada correctamente");
    } catch (error) {
      alert("Error al eliminar la reseña");
      console.error("Error:", error);
    }
  };

  if (!salon) {
    return <h2>Cargando detalles del salón...</h2>;
  }

  return (
    <div>
      <h1>{salon.nombre}</h1>
      <p><strong>Descripción:</strong> {salon.descripcion}</p>
      <p><strong>Ubicación:</strong> {salon.ubicacion}</p>
      <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
      <p><strong>Precio:</strong> ${salon.precio}</p>
      <p><strong>Disponibilidad:</strong> {salon.disponibilidad ? "Disponible" : "No disponible"}</p>
      <p><strong>Contacto:</strong> {salon.contacto}</p>

      {salon.imagenes && salon.imagenes.length > 0 && (
        <div>
          <h3>Imágenes del Salón:</h3>
          {salon.imagenes.map((imagen, index) => (
            <img key={index} src={`http://localhost:5000${imagen}`} alt={`Imagen ${index + 1}`} width="300" />
          ))}
        </div>
      )}

      <h3>Reservar este salón</h3>
      <form onSubmit={handleReserva}>
        <label>
          Fecha de la reserva:
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
          />
        </label>
        <button type="submit">Confirmar Reserva</button>
      </form>

      <h3>Agregar Reseña</h3>
      <form onSubmit={handleAddReview}>
        <label>
          Calificación:
          <select value={calificacion} onChange={e => setCalificacion(parseInt(e.target.value))}>
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </label>
        <label>
          Comentario:
          <textarea value={comentario} onChange={e => setComentario(e.target.value)} />
        </label>
        <button type="submit">Agregar Reseña</button>
      </form>

      <h3>Reseñas</h3>
      {reviews.length > 0 ? (
        reviews.map(review => (
          <div key={review._id}>
            <strong>{review.cliente.nombre}</strong> - {review.calificacion} estrellas
            <p>{review.comentario}</p>
            {usuario.rol === "admin" && (
              <button onClick={() => handleDeleteReview(review._id)}>Eliminar Reseña</button>
            )}
          </div>
        ))
      ) : (
        <p>No hay reseñas aún.</p>
      )}

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default DetalleSalonPage;
