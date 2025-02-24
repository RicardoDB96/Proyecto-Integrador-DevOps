import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function DetalleSalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get(`/salones/${id}`)
      .then(response => setSalon(response.data))
      .catch(error => console.error("Error al obtener el salón", error));
  }, [id]);

  const handleReserva = async (e) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para hacer una reserva.");
      navigate("/login");
      return;
    }

    try {
      const response = await api.post("/reservas", {
        salonId: id,
        fecha,
        total: salon.precio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje("Reserva realizada con éxito.");
      setFecha(""); // Limpiar el campo de fecha
    } catch (error) {
      setMensaje("Error al realizar la reserva. Inténtalo de nuevo.");
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

      {salon.imagenes && salon.imagenes.length > 0 ? (
        <div>
          <h3>Imágenes del Salón:</h3>
          {salon.imagenes.map((imagen, index) => (
            <img key={index} src={`http://localhost:5000${imagen}`} alt={`Imagen ${index + 1}`} width="300" />
          ))}
        </div>
      ) : (
        <p>No hay imágenes disponibles.</p>
      )}

      {/* Formulario de Reservas */}
      <h3>Reservar este salón</h3>
      <form onSubmit={handleReserva}>
        <label>
          Fecha de la reserva:
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <button type="submit">Confirmar Reserva</button>
      </form>

      {/* Mostrar mensaje de éxito o error */}
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default DetalleSalonPage;
