//backend/models/Reserva.js
const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada"],
      default: "pendiente",
    },
    total: {
      type: Number,
      required: true,
    },
    pagoRealizado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reserva", ReservaSchema);
