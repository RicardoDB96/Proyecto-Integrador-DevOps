//backend/routes/reviews.js
const express = require("express");
const Review = require("../models/Review");
const Reserva = require("../models/Reserva");  // Necesario para validar reservas
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/* 🔹 Agregar una Reseña (Solo Clientes) */
router.post("/", authMiddleware, async (req, res) => {
  const { salonId, calificacion, comentario } = req.body;

  // 📌 Validar si el usuario tiene una reserva aprobada y pagada en este salón
  const reservaValida = await Reserva.findOne({
    cliente: req.usuario.id,
    salon: salonId,
    estado: "aprobada",
    pagoRealizado: true
  });

  if (!reservaValida) {
    return res.status(403).json({ mensaje: "🚫 No puedes agregar una reseña sin una reserva aprobada y pagada." });
  }

  // 📌 Crear y guardar la reseña en la base de datos
  try {
    const nuevaReseña = new Review({
      cliente: req.usuario.id,
      salon: salonId,
      calificacion,
      comentario,
    });

    await nuevaReseña.save();

    res.status(201).json({
      mensaje: "✅ Reseña agregada con éxito.",
      reseña: nuevaReseña
    });
  } catch (error) {
    console.error("❌ Error al guardar la reseña:", error);
    res.status(500).json({ mensaje: "Error interno al guardar la reseña." });
  }
});

/* 🔹 Obtener Reseñas de un Salón */
router.get("/:salonId", async (req, res) => {
  const reseñas = await Review.find({ salon: req.params.salonId }).populate("cliente", "nombre");
  res.json(reseñas);
});

/* 🔹 Eliminar una Reseña (Cliente que la creó o Admin) */
router.delete("/:id", authMiddleware, async (req, res) => {
  const reseña = await Review.findById(req.params.id);

  if (!reseña) {
    return res.status(404).json({ mensaje: "Reseña no encontrada" });
  }

  // Verificar si el usuario es el dueño de la reseña o es administrador
  if (reseña.cliente.toString() !== req.usuario.id && req.usuario.rol !== "admin") {
    return res.status(403).json({ mensaje: "No tienes permiso para eliminar esta reseña" });
  }

  await reseña.deleteOne();
  res.json({ mensaje: "Reseña eliminada correctamente" });
});

module.exports = router;
