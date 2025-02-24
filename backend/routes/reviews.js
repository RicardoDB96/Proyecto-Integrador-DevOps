const express = require("express");
const Review = require("../models/Review");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");  // Importar Middleware de Admin

const router = express.Router();

/* 🔹 Agregar una Reseña (Solo Clientes) */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { salonId, calificacion, comentario } = req.body;

    // Validar que la calificación esté entre 1 y 5
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ mensaje: "La calificación debe estar entre 1 y 5." });
    }

    // Crear la reseña
    const nuevaReseña = new Review({
      cliente: req.usuario.id,
      salon: salonId,
      calificacion,
      comentario,
    });

    await nuevaReseña.save();
    res.status(201).json({ mensaje: "Reseña agregada con éxito", reseña: nuevaReseña });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar la reseña", error });
  }
});

/* 🔹 Obtener Reseñas de un Salón */
router.get("/:salonId", async (req, res) => {
  try {
    const reseñas = await Review.find({ salon: req.params.salonId }).populate("cliente", "nombre");
    res.json(reseñas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las reseñas", error });
  }
});

/* 🔹 Eliminar una Reseña (Solo el Cliente que la creó) */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reseña = await Review.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({ mensaje: "Reseña no encontrada" });
    }

    // Verificar si el usuario es el dueño de la reseña
    if (reseña.cliente.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: "No tienes permiso para eliminar esta reseña" });
    }

    await reseña.deleteOne();
    res.json({ mensaje: "Reseña eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la reseña", error });
  }
});


/* 🔹 Eliminar una Reseña (Solo el Cliente que la creó o un Admin) */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const reseña = await Review.findById(req.params.id);
  
      if (!reseña) {
        return res.status(404).json({ mensaje: "Reseña no encontrada" });
      }
  
      // Si el usuario es el dueño de la reseña o es un administrador, puede eliminarla
      if (reseña.cliente.toString() !== req.usuario.id && req.usuario.rol !== "admin") {
        return res.status(403).json({ mensaje: "No tienes permiso para eliminar esta reseña" });
      }
  
      await reseña.deleteOne();
      res.json({ mensaje: "Reseña eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar la reseña", error });
    }
  });

module.exports = router;