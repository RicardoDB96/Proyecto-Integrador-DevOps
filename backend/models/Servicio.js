// backend/models/Servicio.js
const mongoose = require("mongoose");

const ServicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ubicacion: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagenes: { type: [String], default: [] },
  telefono: { type: String, required: true },
  email: { type: String, required: true },
  tipoServicio: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Servicio", ServicioSchema);