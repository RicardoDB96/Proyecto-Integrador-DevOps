//frontend/src/pages/PagoExitoso.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reservaId = searchParams.get("reservaId");

  useEffect(() => {
    const confirmarPago = async () => {
      if (reservaId) {
        await api.post("/pagos/confirmar-pago", { reservaId });
      }
    };
    confirmarPago();
  }, [reservaId]);

  return (
    <div>
      <h2>¡Pago exitoso! 🎉</h2>
      <p>Tu reserva ha sido confirmada. Gracias por tu pago.</p>
      <button onClick={() => navigate("/reservas")}>Ver mis reservas</button>
    </div>
  );
}

export default PagoExitoso;
