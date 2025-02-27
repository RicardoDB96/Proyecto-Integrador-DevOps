// backend/routes/salones.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save images in the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage }).array("imagenes", 10); // Allows multiple images

// 🔹 Create a salon with images (Only Admin)
router.post("/", authMiddleware, adminMiddleware, upload, async (req, res) => {
  try {
    console.log("📌 Request Body:", req.body);
    console.log("📸 Uploaded Files:", req.files);

    const { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email } = req.body;

    if (!telefono || !email) {
      return res.status(400).json({ mensaje: "El teléfono y el correo son obligatorios" });
    }

    const imagenes = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const nuevoSalon = new Salon({
      nombre,
      ubicacion,
      capacidad,
      precio,
      descripcion,
      imagenes,
      contacto,
      telefono,
      email,
    });

    await nuevoSalon.save();
    res.status(201).json(nuevoSalon);
  } catch (error) {
    console.error("❌ Error al guardar el salón:", error);
    res.status(500).json({ mensaje: "Error al guardar el salón", error: error.message });
  }
});

// 🔹 Get all salons
router.get("/", async (req, res) => {
  try {
    const salones = await Salon.find();
    res.json(salones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los salones", error });
  }
});

// 🔹 Get a single salon by ID
router.get("/:id", async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el salón", error });
  }
});

// 🔹 Update a salon (Only Admin) - Supports adding new images without deleting existing ones
router.put("/:id", authMiddleware, adminMiddleware, upload, async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email, imagenesExistentes } = req.body;

    if (!telefono || !email) {
      return res.status(400).json({ mensaje: "El teléfono y el correo son obligatorios" });
    }

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    let imagenes = salon.imagenes;

    if (imagenesExistentes) {
      imagenes = JSON.parse(imagenesExistentes);
    }

    if (req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      imagenes = [...imagenes, ...newImages];
    }

    const salonActualizado = await Salon.findByIdAndUpdate(
      req.params.id,
      { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email, imagenes },
      { new: true }
    );

    res.json(salonActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el salón", error });
  }
});

// 🔹 Delete a specific image from a salon
router.delete("/:id/imagen", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ mensaje: "URL de la imagen requerida" });

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    salon.imagenes = salon.imagenes.filter(img => img !== imageUrl);
    await salon.save();

    const imagePath = path.join(__dirname, "../", imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ mensaje: "Imagen eliminada correctamente", salon });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la imagen", error });
  }
});

// 🔹 Delete a salon (Only Admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    salon.imagenes.forEach(image => {
      const imagePath = path.join(__dirname, "../", image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await Salon.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Salón eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el salón", error });
  }
});

module.exports = router;
