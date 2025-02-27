import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

function SalonCalendar({ reservas, setSelectedDate, selectedDate, handleReserva }) {
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date()); // Set default date to today
    }
  }, [selectedDate, setSelectedDate]);

  // Convert reservations to a map for easy lookup
  const reservedDates = new Map();
  reservas.forEach((reserva) => {
    const dateKey = new Date(reserva.fecha).toDateString();
    reservedDates.set(dateKey, reserva.estado);
  });

  // Function to disable past dates
  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time portion to compare only dates
    return date < today; // Disable if the date is in the past
  };

  // Function to style calendar tiles
  const tileClassName = ({ date }) => {
    const dateKey = date.toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time portion for correct comparison

    if (date < today) return "past-date"; // 🔘 Grayscale for past dates
    if (reservedDates.has(dateKey)) {
      const estado = reservedDates.get(dateKey);
      if (estado === "aprobada") return "disabled-date";  // 🔘 Fully booked (Gray)
      if (estado === "pendiente") return "reserved-date"; // 🟠 Reserved (Orange)
    }
    return dateKey === selectedDate?.toDateString() ? "selected-date" : "available-date"; // ✅ Light Green Available
  };

  // Function to handle date selection
  const handleDateChange = (date) => {
    const dateKey = date.toDateString();
    if (reservedDates.has(dateKey) && reservedDates.get(dateKey) === "aprobada") {
      alert("❌ Esta fecha ya está completamente reservada. Por favor, elige otra.");
      return;
    }
    setSelectedDate(date);
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-lg">
        <h3 className="text-center">📅 Disponibilidad del Salón</h3>
        <br></br>
        <br></br>
        {/* Responsive Layout using Bootstrap Grid */}
        <Row className="align-items-center">
          {/* Calendar Column */}
          <Col xs={12} md={8} className="d-flex justify-content-center">
            <Calendar 
              onChange={handleDateChange} 
              value={selectedDate || new Date()} 
              tileClassName={tileClassName}
              tileDisabled={tileDisabled} // 🔹 Bloquea fechas pasadas
            />
          </Col>

          {/* Reservation Details and Button Column */}
          <Col xs={12} md={4} className="text-center mt-3 mt-md-0">
            {selectedDate && (
              <>
                <p className="mb-3">
                  Fecha seleccionada: <strong>{selectedDate.toLocaleDateString("es-MX")}</strong>
                </p>
                <Button variant="success" onClick={() => handleReserva(selectedDate)} className="w-100">
                  Confirmar Reserva
                </Button>
              </>
            )}
          </Col>
        </Row>

        {/* Legend for colors */}
        <div className="mt-4 text-center">
          <Row>
            <Col>
              <div className="legend-box available"></div>
              <span className="ms-2">Disponible</span>
            </Col>
            <Col>
              <div className="legend-box reserved"></div>
              <span className="ms-2">Reservado (Pendiente)</span>
            </Col>
            <Col>
              <div className="legend-box booked"></div>
              <span className="ms-2">Reservado (Pagado)</span>
            </Col>
            <Col>
              <div className="legend-box past"></div>
              <span className="ms-2">Fecha Pasada</span>
            </Col>
          </Row>
        </div>
      </Card>

      {/* CSS Styles for Calendar */}
      <style>
        {`
          /* ✅ Light Green for Available Dates */
          .available-date {
            background-color: #aceb9b !important;
            color: black !important;
            border-radius: 50%;
          }

          /* 🌿 Dark Green for Selected Date */
          .selected-date {
            background-color: #28a745 !important;
            color: white !important;
            border-radius: 50%;
          }

          /* 🔘 Fully Booked Dates (Gray) */
          .disabled-date {
            background-color: #6c757d !important;
            color: white !important;
            border-radius: 50%;
            pointer-events: none; /* Prevent selection */
          }

          /* 🟠 Reserved Dates (Orange) */
          .reserved-date {
            background-color: orange !important;
            color: white !important;
            border-radius: 50%;
          }

          /* 🔘 Grayscale for Past Dates */
          .past-date {
            background-color: #d6d6d6 !important;
            color: white !important;
            border-radius: 50%;
            pointer-events: none; /* Prevent selection */
          }

          /* Ensure weekends don't appear in red */
          .react-calendar__month-view__weekdays__weekday {
            color: black !important;
          }

          /* 🔹 Legend box styles */
          .legend-box {
            display: inline-block;
            width: 15px;
            height: 15px;
            border-radius: 3px;
          }
          .available { background-color: #aceb9b; }
          .reserved { background-color: orange; }
          .booked { background-color: #6c757d; }
          .past { background-color: #d6d6d6; }
        `}
      </style>
    </Container>
  );
}

export default SalonCalendar;