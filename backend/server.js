//backend/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const MONGO_URI = process.env.MONGO_URI;

// Middlewares
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importar rutas
const salonRoutes = require("./routes/salones");
const authRoutes = require("./routes/auth");
const reservaRoutes = require("./routes/reserva");
const reviewRoutes = require("./routes/reviews");
const pagosRoutes = require("./routes/pagos");

app.use("/api/pagos", pagosRoutes);
app.use("/api/salones", salonRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/reviews", reviewRoutes);


// Conectar a MongoDB
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Iniciar servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
