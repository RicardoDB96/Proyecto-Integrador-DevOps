// backend/routes/pagos.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Reserva = require("../models/Reserva");
const authMiddleware = require("../middlewares/authMiddleware");
const enviarCorreo = require("../utils/emailService");

const router = express.Router();

/* 🔹 Crear sesión de pago con Stripe */
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const { reservaId } = req.body;

    // Buscar la reserva
    const reserva = await Reserva.findById(reservaId).populate("salon cliente");
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Validar que la reserva esté aprobada antes de pagar
    if (reserva.estado !== "aprobada") {
      return res.status(400).json({ mensaje: "No puedes pagar una reserva que aún no ha sido aprobada" });
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: reserva.salon.nombre,
              description: `Reserva para el ${new Date(reserva.fecha).toLocaleDateString()}`,
            },
            unit_amount: reserva.total * 100, // Convertir a centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/pago-exitoso?reservaId=${reserva._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/reservas`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear sesión de pago", error });
  }
});

/* 🔹 Confirmar pago y actualizar reserva */
router.post("/confirmar-pago", authMiddleware, async (req, res) => {
  try {
    const { reservaId } = req.body;

    // Buscar la reserva
    const reserva = await Reserva.findById(reservaId).populate("cliente");
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Validar que no se pueda pagar si ya fue pagado
    if (reserva.pagoRealizado) {
      return res.status(400).json({ mensaje: "Esta reserva ya ha sido pagada" });
    }

    // Validar que la reserva haya sido aprobada antes de marcar como pagada
    if (reserva.estado !== "aprobada") {
      return res.status(400).json({ mensaje: "No puedes confirmar un pago de una reserva que no está aprobada" });
    }

    // Marcar la reserva como pagada
    reserva.pagoRealizado = true;
    await reserva.save();

    // ✅ Enviar correo de confirmación de pago
    await enviarCorreo(
      reserva.cliente.email,
      "💳 Pago confirmado para tu reserva",
      `<p>Hola <strong>${reserva.cliente.nombre}</strong>,</p>
       <p>Hemos recibido el pago de tu reserva para el salón <strong>${reserva.salon.nombre}</strong>.</p>
       <p>Gracias por confiar en nuestro servicio. ¡Nos vemos en el evento!</p>`
    );

    res.json({ mensaje: "Pago confirmado con éxito", reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al confirmar el pago", error });
  }
});

module.exports = router;