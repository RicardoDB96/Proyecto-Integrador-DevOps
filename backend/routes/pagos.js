//backend/routes/pagos.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Reserva = require("../models/Reserva");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/* 🔹 Crear sesión de pago con Stripe */
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const { reservaId } = req.body;
    
    // Buscar la reserva
    const reserva = await Reserva.findById(reservaId).populate("salon");
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
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
    
    // Marcar la reserva como pagada
    const reserva = await Reserva.findByIdAndUpdate(reservaId, { pagoRealizado: true }, { new: true });
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json({ mensaje: "Pago confirmado", reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al confirmar el pago", error });
  }
});

module.exports = router;
