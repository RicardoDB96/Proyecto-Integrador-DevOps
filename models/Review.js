const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
