// backend/routes/reserva.js
const express = require("express");
const Reserva = require("../models/Reserva");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");
const enviarCorreo = require("../utils/emailService");

const router = express.Router();

/* 🔹 Crear una reserva (Solo clientes pueden reservar un salón) */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { salonId, fecha, total } = req.body;
    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    const nuevaReserva = new Reserva({
      cliente: req.usuario.id,
      salon: salonId,
      fecha,
      total,
      estado: "pendiente",
      pagoRealizado: false,
    });

    await nuevaReserva.save();

    // Enviar correo de confirmación de la reserva
    const mensaje = `
      <h2>Reserva Confirmada</h2>
      <p>Hola ${req.usuario.nombre},</p>
      <p>Has reservado el salón <strong>${salon.nombre}</strong> para la fecha <strong>${fecha}</strong>.</p>
      <p>El estado de tu reserva es: <strong>Pendiente</strong></p>
    `;

    await enviarCorreo(req.usuario.email, "Confirmación de Reserva", mensaje);

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

    const reserva = await Reserva.findByIdAndUpdate(req.params.id, { estado }, { new: true }).populate("cliente");
    if (!reserva) return res.status(404).json({ mensaje: "Reserva no encontrada" });

    // Enviar correo al actualizar el estado de la reserva
    const mensaje = `
      <h2>Estado de tu Reserva</h2>
      <p>Hola ${reserva.cliente.nombre},</p>
      <p>Tu reserva para el salón ha sido <strong>${estado}</strong>.</p>
    `;

    await enviarCorreo(reserva.cliente.email, "Estado de tu Reserva", mensaje);

    res.json({ mensaje: `Reserva ${estado} con éxito`, reserva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la reserva", error });
  }
});

/* 🔹 Confirmar pago de una reserva */
router.put("/:id/confirmar-pago", authMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id).populate("cliente");

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Solo permitir pagar si la reserva ha sido aprobada
    if (reserva.estado !== "aprobada") {
      return res.status(400).json({ mensaje: "No se puede pagar una reserva que no está aprobada" });
    }

    // Verificar que la reserva no haya sido ya pagada
    if (reserva.pagoRealizado) {
      return res.status(400).json({ mensaje: "Esta reserva ya ha sido pagada" });
    }

    reserva.pagoRealizado = true;
    await reserva.save();

    // Enviar correo de confirmación de pago
    const mensajePago = `
      <h2>Pago Confirmado</h2>
      <p>Hola ${reserva.cliente.nombre},</p>
      <p>Tu pago para la reserva del salón ${reserva.salon.nombre} ha sido confirmado.</p>
    `;

    await enviarCorreo(reserva.cliente.email, "Confirmación de Pago", mensajePago);

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

    // Solo permitir cancelar si la reserva está en estado "pendiente"
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
