// backend/routes/servicios.js
const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio");
const multer = require("multer");

// Configuración básica para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ajusta la carpeta de destino si es necesario
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GET: Listar todos los servicios
router.get("/", async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.status(200).json(servicios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los servicios." });
  }
});

// GET: Obtener un servicio por ID
router.get("/:id", async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado." });
    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el servicio." });
  }
});

// POST: Crear un nuevo servicio
router.post("/", upload.array("imagenes"), async (req, res) => {
  try {
    // Procesar las imágenes subidas y obtener sus URLs
    const imagenes = req.files.map((file) => {
      // En este ejemplo se usa la ruta local; en producción podrías usar un servicio en la nube
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    });

    const { nombre, ubicacion, descripcion, telefono, email, tipoServicio } = req.body;
    const nuevoServicio = new Servicio({
      nombre,
      ubicacion,
      descripcion,
      telefono,
      email,
      tipoServicio,
      imagenes,
    });

    const servicioGuardado = await nuevoServicio.save();
    res.status(201).json(servicioGuardado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el servicio." });
  }
});

// PUT: Actualizar un servicio existente
router.put("/:id", upload.array("imagenes"), async (req, res) => {
  try {
    // Si se suben nuevas imágenes, procesarlas
    let imagenes = [];
    if (req.files && req.files.length > 0) {
      imagenes = req.files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);
    }

    const { nombre, ubicacion, descripcion, telefono, email, tipoServicio } = req.body;
    const actualizacion = { nombre, ubicacion, descripcion, telefono, email, tipoServicio };

    // Si se subieron imágenes, se actualiza el campo
    if (imagenes.length > 0) {
      actualizacion.imagenes = imagenes;
    }

    const servicioActualizado = await Servicio.findByIdAndUpdate(req.params.id, actualizacion, { new: true });
    if (!servicioActualizado) return res.status(404).json({ error: "Servicio no encontrado." });
    res.status(200).json(servicioActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el servicio." });
  }
});

// DELETE: Eliminar un servicio
router.delete("/:id", async (req, res) => {
  try {
    const servicioEliminado = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicioEliminado) return res.status(404).json({ error: "Servicio no encontrado." });
    res.status(200).json({ message: "Servicio eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el servicio." });
  }
});

module.exports = router;
