// frontend/src/pages/AdminSalonesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Alert } from "react-bootstrap";
import api from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa"; // ✅ Import icons

function AdminSalonesPage() {
  const [salones, setSalones] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/salones", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setSalones(response.data))
      .catch((error) => console.error("Error al obtener salones:", error));
  }, [token]);

  // ✅ Handle Delete Salon
  const handleEliminarSalon = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este salón?")) return;

    try {
      await api.delete(`/salones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSalones(salones.filter((salon) => salon._id !== id));
      alert("Salón eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el salón:", error);
      alert("Error al eliminar el salón.");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">🏢 Gestión de Salones</h2>

      {salones.length === 0 ? (
        <Alert variant="info" className="text-center">
          No hay salones registrados.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-lg">
          <thead className="text-center">
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salones.map((salon) => (
              <tr key={salon._id} className="text-center align-middle">
                <td>{salon.nombre}</td>
                <td>{salon.ubicacion}</td>
                <td>{salon.capacidad} personas</td>
                <td>${salon.precio}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/admin/editar-salon/${salon._id}`)}
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminarSalon(salon._id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AdminSalonesPage;
