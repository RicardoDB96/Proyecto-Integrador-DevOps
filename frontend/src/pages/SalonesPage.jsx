//frontend/src/pages/SalonesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function SalonesPage() {
  const [salones, setSalones] = useState([]);

  useEffect(() => {
    const obtenerSalones = async () => {
      try {
        const response = await api.get('/salones');
        setSalones(response.data);
      } catch (error) {
        console.error('Error al obtener los salones:', error);
      }
    };

    obtenerSalones();
  }, []);

  return (
    <div>
      <h1>Lista de Salones</h1>
      {salones.length === 0 ? (
        <p>No hay salones disponibles.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {salones.map((salon) => (
            <div key={salon._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h2>{salon.nombre}</h2>
              <p>{salon.descripcion}</p>
              <p><strong>Ubicación:</strong> {salon.ubicacion}</p>
              <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
              <p><strong>Precio:</strong> ${salon.precio}</p>
              <p><strong>Contacto:</strong> {salon.contacto}</p>

              {salon.imagenes && salon.imagenes.length > 0 ? (
                <img
                  src={`http://localhost:5000${salon.imagenes[0]}`}
                  alt={salon.nombre}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ) : (
                <p>🔹 No hay imagen disponible</p>
              )}

              {/* Botón para ver más detalles */}
              <Link to={`/salones/${salon._id}`} style={{ display: "block", marginTop: "10px", textAlign: "center", background: "#007bff", color: "#fff", padding: "10px", borderRadius: "5px", textDecoration: "none" }}>
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SalonesPage;
