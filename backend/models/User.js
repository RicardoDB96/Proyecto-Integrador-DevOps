//backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ["cliente", "admin"], default: "cliente" } // 🔹 Ensures role exists
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
