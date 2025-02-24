//backend/models/Salon.js
const mongoose = require("mongoose");

const SalonSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ubicacion: { type: String, required: true },
  capacidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  imagenes: { type: [String], default: [] },
  disponibilidad: { type: Boolean, default: true },
  contacto: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Salon", SalonSchema);
