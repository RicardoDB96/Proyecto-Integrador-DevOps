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
    const reservas = await Reserva.find()
      .populate("cliente", "nombre email")
      .populate("salon", "nombre ubicacion");

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las reservas", error });
  }
});

/* 🔹 Obtener las reservas de un cliente (El cliente solo ve sus reservas) */
router.get("/mis-reservas", authMiddleware, async (req, res) => {
  try {
    const reservas = await Reserva.find({ cliente: req.usuario.id })
      .populate("salon", "nombre ubicacion");

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

    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    reserva.estado = estado;
    await reserva.save();

    res.json({ mensaje: `Reserva ${estado} con éxito`, reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la reserva", error });
  }
});

/* 🔹 Confirmar pago de una reserva */
router.put("/:id/confirmar-pago", authMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // 🔹 Validar que la reserva esté aprobada antes de permitir el pago
    if (reserva.estado !== "aprobada") {
      return res.status(400).json({ mensaje: "No puedes pagar una reserva que no ha sido aprobada" });
    }

    reserva.pagoRealizado = true;
    await reserva.save();

    res.json({ mensaje: "Pago confirmado correctamente", reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al confirmar el pago", error });
  }
});


/* 🔹 Cancelar una reserva (Usuarios pueden cancelar su propia reserva si es "pendiente") */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Verificar que el usuario es el dueño de la reserva
    if (reserva.cliente.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: "No tienes permiso para cancelar esta reserva" });
    }

    // Solo permitir cancelar si está en estado "pendiente"
    if (reserva.estado !== "pendiente") {
      return res.status(400).json({ mensaje: "Solo se pueden cancelar reservas pendientes" });
    }

    await reserva.deleteOne();
    res.json({ mensaje: "Reserva cancelada correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al cancelar la reserva", error });
  }
});

/* 🔹 Eliminar una reserva (Solo admins pueden eliminar cualquier reserva) */
router.delete("/:id/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndDelete(req.params.id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json({ mensaje: "Reserva eliminada correctamente por el administrador" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la reserva", error });
  }
});

module.exports = router;
