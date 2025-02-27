import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.jpg"; // Add an attractive image

function HomePage() {
  return (
    <div>
      {/* ✅ Hero Section */}
      <div
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        <Container>
          <h1 className="display-3">Encuentra el Salón Perfecto para tu Evento</h1>
          <p className="lead">
            Descubre espacios elegantes y bien equipados para hacer de tu evento una experiencia inolvidable.
          </p>
          <Button variant="light" size="lg" as={Link} to="/salones">
            Explorar Salones
          </Button>
        </Container>
      </div>

      {/* ✅ Features Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">¿Por qué elegirnos?</h2>
        <Row>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>✔️ Salones Exclusivos</Card.Title>
                <Card.Text>
                  Contamos con una selección de los mejores salones para todo tipo de eventos.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>📅 Reservaciones Sencillas</Card.Title>
                <Card.Text>
                  Reserva tu salón en pocos pasos y con confirmación inmediata.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>🌟 Opiniones Reales</Card.Title>
                <Card.Text>
                  Lee reseñas de otros clientes y escoge la mejor opción para tu evento.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ✅ Call to Action */}
      <Container className="text-center my-5">
        <h2>Reserva ahora y vive una experiencia inolvidable</h2>
        <Button variant="primary" size="lg" as={Link} to="/register">
          Crear Cuenta
        </Button>
      </Container>
    </div>
  );
}

export default HomePage;
