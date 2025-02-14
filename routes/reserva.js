const express = require("express");
const Reserva = require("../models/Reserva");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/* 🔹 Crear una reserva (Solo clientes pueden reservar un salón) */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { salonId, fecha, total } = req.body;

    // Verificar si el salón existe
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ mensaje: "Salón no encontrado" });
    }

    // Crear la reserva
    const nuevaReserva = new Reserva({
      cliente: req.usuario.id,
      salon: salonId,
      fecha,
      total,
      estado: "pendiente",
      pagoRealizado: false,
    });

    await nuevaReserva.save();

    res.status(201).json({ mensaje: "Reserva creada con éxito", reserva: nuevaReserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la reserva", error });
  }
});

/* 🔹 Obtener todas las reservas (Solo admins pueden ver todas) */
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reservas = await Reserva.find().populate("cliente", "nombre email").populate("salon", "nombre ubicacion");
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las reservas", error });
  }
});

/* 🔹 Obtener las reservas de un cliente (El cliente solo ve sus reservas) */
router.get("/mis-reservas", authMiddleware, async (req, res) => {
  try {
    const reservas = await Reserva.find({ cliente: req.usuario.id }).populate("salon", "nombre ubicacion");
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener tus reservas", error });
  }
});

/* 🔹 Aprobar o rechazar una reserva (Solo admins pueden hacerlo) */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;

    if (!["aprobada", "rechazada"].includes(estado)) {
      return res.status(400).json({ mensaje: "Estado no válido" });
    }

    const reserva = await Reserva.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json({ mensaje: `Reserva ${estado} con éxito`, reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la reserva", error });
  }
});

/* 🔹 Eliminar una reserva (Solo admins pueden hacerlo) */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndDelete(req.params.id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json({ mensaje: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la reserva", error });
  }
});

module.exports = router;
