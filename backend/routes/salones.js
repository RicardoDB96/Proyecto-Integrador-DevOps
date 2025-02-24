// backend/routes/salones.js
// Importaciones necesarias
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");
const fs = require("fs");

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // Directorio donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Nombre de archivo único
  },
});

// Configuración de Multer para manejar múltiples imágenes
const upload = multer({ storage: storage }).array('imagenes', 10);

// Ruta para crear un nuevo salón con imágenes
router.post("/", authMiddleware, adminMiddleware, upload, async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto } = req.body;
    let imagenes = req.files.map(file => `/uploads/${file.filename}`);  // Procesa las rutas de las imágenes

    const nuevoSalon = new Salon({
      nombre,
      ubicacion,
      capacidad,
      precio,
      descripcion,
      imagenes,  // Guarda todas las imágenes subidas
      contacto,
    });

    await nuevoSalon.save();
    res.status(201).json(nuevoSalon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar el salón", error });
  }
});

// 🔹 Buscar y filtrar salones
router.get("/buscar", async (req, res) => {
  try {
    const { nombre, ubicacion, precioMin, precioMax, capacidadMin, capacidadMax, disponibilidad } = req.query;
    let filtro = {};

    if (nombre) {
      filtro.nombre = { $regex: new RegExp(nombre, "i") };
    }
    if (ubicacion) {
      filtro.ubicacion = { $regex: new RegExp(ubicacion, "i") };
    }
    if (precioMin || precioMax) {
      filtro.precio = {};
      if (precioMin) filtro.precio.$gte = Number(precioMin);
      if (precioMax) filtro.precio.$lte = Number(precioMax);
    }
    if (capacidadMin || capacidadMax) {
      filtro.capacidad = {};
      if (capacidadMin) filtro.capacidad.$gte = Number(capacidadMin);
      if (capacidadMax) filtro.capacidad.$lte = Number(capacidadMax);
    }
    if (disponibilidad !== undefined) {
      filtro.disponibilidad = disponibilidad === "true";
    }

    const salones = await Salon.find(filtro);
    res.json(salones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar salones", error });
  }
});

// 🔹 Obtener todos los salones
router.get("/", async (req, res) => {
  try {
    const salones = await Salon.find();
    res.json(salones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los salones", error });
  }
});

// 🔹 Obtener un solo salón por ID
router.get("/:id", async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el salón", error });
  }
});

// 🔹 Crear un salón con imagen (Solo Admin)
router.post("/", authMiddleware, adminMiddleware, upload, async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto } = req.body;
    const imagenes = req.files.map(file => `/uploads/${file.filename}`); // Convierte cada archivo en una ruta de imagen

    const nuevoSalon = new Salon({
      nombre,
      ubicacion,
      capacidad,
      precio,
      descripcion,
      imagenes,
      contacto,
    });

    await nuevoSalon.save();
    res.status(201).json(nuevoSalon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar el salón", error });
  }
});

// 🔹 Actualizar un salón (Solo Admin)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const salonActualizado = await Salon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salonActualizado) return res.status(404).json({ mensaje: "Salón no encontrado" });
    res.json(salonActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el salón", error });
  }
});

// 🔹 Eliminar un salón (Solo Admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    // Eliminar imágenes asociadas al salón
    salon.imagenes.forEach((imagen) => {
      const imagePath = path.join(__dirname, "../", imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Borra el archivo de la carpeta /uploads
      }
    });

    // Eliminar el salón de la base de datos
    await Salon.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Salón eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el salón", error });
  }
});

module.exports = router;
