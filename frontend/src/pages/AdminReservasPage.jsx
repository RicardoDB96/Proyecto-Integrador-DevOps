// AdminReservasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Button, Alert, Row, Col, Card, Form } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import StarRating from "../components/Estrellas";

function AdminReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [filtros, setFiltros] = useState({
    nombreSalon: "",
    nombreCliente: "",
    estado: "",
    fecha: ""
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (!token || usuario?.rol !== "admin") {
      alert("Acceso denegado. Debes ser administrador.");
      navigate("/");
      return;
    }

    api.get("/reservas", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setReservas(response.data))
    .catch(error => console.error("Error al obtener reservas:", error));
  }, [token, usuario, navigate]);

  const actualizarEstadoReserva = async (id, estado) => {
    if (!window.confirm(`¿Estás seguro de ${estado} esta reserva?`)) return;

    try {
      await api.put(`/reservas/${id}`, { estado }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Reserva ${estado} correctamente.`);
      setReservas(reservas.map(reserva => 
        reserva._id === id ? { ...reserva, estado } : reserva
      ));
    } catch (error) {
      alert("Error al actualizar la reserva");
      console.error("Error:", error);
    }
  };

  const quitarAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const ordenarReservas = (reservas) => {
    return [...reservas].sort((a, b) => {
      const ordenEstados = { pendiente: 1, aprobada: 2, rechazada: 3 };
      if (ordenEstados[a.estado] !== ordenEstados[b.estado]) {
        return ordenEstados[a.estado] - ordenEstados[b.estado];
      }
      return new Date(b.fecha) - new Date(a.fecha);
    });
  };

  const reservasFiltrados = ordenarReservas(reservas.filter((reserva) => {
    const fechaReserva = new Date(reserva.fecha).toLocaleDateString("es-MX", { timeZone: 'UTC' });
    const fechaFiltro = filtros.fecha ? new Date(filtros.fecha).toLocaleDateString("es-MX", { timeZone: 'UTC' }) : "";

    return (
      (filtros.nombreSalon === "" || quitarAcentos(reserva.salon.nombre.toLowerCase()).includes(quitarAcentos(filtros.nombreSalon.toLowerCase()))) &&
      (filtros.nombreCliente === "" || quitarAcentos(reserva.cliente.nombre.toLowerCase()).includes(quitarAcentos(filtros.nombreCliente.toLowerCase()))) &&
      (filtros.estado === "" || reserva.estado.toLowerCase() === filtros.estado.toLowerCase()) &&
      (filtros.fecha === "" || fechaReserva === fechaFiltro)
    );
  }));

  const exportarCSV = () => {
  const encabezado = ["Salon", "Cliente", "Estado", "Fecha", "Total"];
  const filas = reservasFiltrados.map((reserva) => [
    quitarAcentos(reserva.salon.nombre),
    quitarAcentos(reserva.cliente.nombre),
    quitarAcentos(reserva.estado),
    new Date(reserva.fecha).toLocaleDateString("es-MX"),
    reserva.total
  ]);

  // MÉTRICAS
  const total = reservasFiltrados.length;
  const aprobadas = reservasFiltrados.filter(r => r.estado === "aprobada").length;
  const pendientes = reservasFiltrados.filter(r => r.estado === "pendiente").length;
  const rechazadas = reservasFiltrados.filter(r => r.estado === "rechazada").length;

  const porMes = {};
  const ingresosPorMes = {};

  reservasFiltrados.forEach(r => {
    if (r.estado !== "aprobada") return; // Solo incluir aprobadas
    const mes = new Date(r.fecha).toLocaleString('es-MX', { month: 'long' });
    porMes[mes] = (porMes[mes] || 0) + 1;
    ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + r.total;
  });

  const ingresosTotales = reservasFiltrados.filter(r => r.estado === "aprobada").reduce((sum, r) => sum + r.total, 0);
  const aprobadasFiltradas = reservasFiltrados.filter(r => r.estado === "aprobada");
  const ingresoPromedio = aprobadasFiltradas.length > 0 ? (ingresosTotales / aprobadasFiltradas.length) : 0;

  const salonSet = new Set(reservasFiltrados.map(r => quitarAcentos(r.salon.nombre)));
  const salonesUnicos = salonSet.size;

  const mesTop = Object.entries(porMes).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sin datos";
const nombresSalones = Array.from(salonSet).join(" | ");

const resumen = [
  ["Resumen de Metricas"],
  ["Total de reservas:", total],
  ["Aprobadas:", aprobadas],
  ["Pendientes:", pendientes],
  ["Rechazadas:", rechazadas],
  ["Salones unicos:", salonesUnicos],
  ["Nombres:", nombresSalones],
  ["Mes con mas reservas:", mesTop],
  ["Ingresos totales:", ingresosTotales],
  ["Ingreso promedio por reserva:", ingresoPromedio.toFixed(2)],
  [],
  ["Reservas por mes:"],
  ...Object.entries(porMes).map(([mes, cantidad]) => [mes + " (reservas):", cantidad]),
  [],
  ["Ingresos por mes:"],
  ...Object.entries(ingresosPorMes).map(([mes, ingreso]) => [mes + " (ingresos):", ingreso]),
  []
];

  const csvContent = [
    ...resumen.map(row => row.join(",")),
    encabezado.join(","),
    ...filas.map(row => row.join(","))
].join("\n");


  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "metricas_reservas.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <Container className="py-5">
      <h1 className="text-center">📅 Mis Reservas de Administrador</h1>
      <Row>
        <Col md={3}>
          <Card className="p-3 mb-4">
            <h5>🔍 Filtrar Reservas</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>🏢 Nombre del Salón</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por salón"
                  value={filtros.nombreSalon}
                  onChange={(e) => setFiltros({ ...filtros, nombreSalon: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>👤 Nombre del Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por cliente"
                  value={filtros.nombreCliente}
                  onChange={(e) => setFiltros({ ...filtros, nombreCliente: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📊 Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📅 Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                />
              </Form.Group>

<br>
</br>
              <Form.Group className="mb-3 text-center">
                <Button variant="primary" onClick={exportarCSV}>
                  📊 Exportar CSV con Métricas
                </Button>
              </Form.Group>
            </Form>
          </Card>
        </Col>

        <Col md={9}>
          {reservas.length === 0 ? (
            <Alert variant="info" className="text-center mt-3">
              No tienes reservas aún.
            </Alert>
          ) : (
            <Row className="g-4">
              {reservasFiltrados.map((reserva) => (
                <Col xs={12} key={reserva._id}>
                  <Card className="shadow-sm border-1">
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <Card.Title className="fw-bold fs-3">{reserva.salon.nombre}</Card.Title>
                          <Card.Text>
                            👤 <strong>Cliente:</strong> {reserva.cliente.nombre} <br />
                            📧 <strong>Email de Cliente:</strong> {reserva.cliente.email} <br />
                            <strong className="fw-bold fs-5">Fecha de Reservación:</strong> {new Date(reserva.fecha).toLocaleDateString("es-MX")}
                          </Card.Text>
                        </Col>
                        <Col md={4} className="text-end d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="fw-bold fs-4">${reserva.total.toLocaleString("es-MX")}</Card.Title>
                            <StarRating rating={reserva.salon.calificacion} size={20} />
                          </div>
                          <div>
                            <Card.Title className={`fw-bold fs-5 mt-3 ${
                              reserva.estado === "aprobada" ? "text-success" :
                              reserva.estado === "pendiente" ? "text-warning" :
                              "text-danger"
                            }`}>
                              {reserva.estado.toUpperCase()}
                            </Card.Title>
                            {reserva.estado === "pendiente" && !reserva.pagoRealizado && (
                              <>
                                <Button variant="success" onClick={() => actualizarEstadoReserva(reserva._id, "aprobada")} className="me-2">
                                  <FaCheckCircle /> Aprobar
                                </Button>
                                <Button variant="danger" onClick={() => actualizarEstadoReserva(reserva._id, "rechazada")}> 
                                  <FaTimesCircle /> Rechazar
                                </Button>
                              </>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AdminReservasPage;
