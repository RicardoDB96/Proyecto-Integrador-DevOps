require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;
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

app.use("/api/salones", salonRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/reviews", reviewRoutes);


// Conectar a MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
