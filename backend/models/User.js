const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ["admin", "cliente"], default: "cliente" }, // 👈 Nuevo campo
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
