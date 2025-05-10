// backend/routes/servicios.js
const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configurar AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN, // ← necesario en AWS Academy
});

const s3 = new AWS.S3({ region: "us-east-1" });
const bucketName = process.env.AWS_BUCKET_NAME; // ← asegúrate de definirlo en .env


// Multer para almacenar archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

const uploadToS3 = async (file) => {
  if (!file) throw new Error("No se subió ningún archivo.");

  const fileExtension = path.extname(file.originalname);
  const filename = `${Date.now()}-${uuidv4()}${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();

  return `https://${bucketName}.s3.amazonaws.com/${filename}`;
};

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
    const imagenes = await Promise.all(req.files.map(uploadToS3));

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
router.put("/:id", upload.array("imagenes", 10), async (req, res) => {
  try {
    const {
      nombre,
      ubicacion,
      descripcion,
      telefono,
      email,
      tipoServicio,
      imagenesExistentes,
    } = req.body;

    // Buscar el servicio existente
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado." });

    // Imagenes actuales (si vienen del cliente)
    let imagenes = servicio.imagenes;
    if (imagenesExistentes) {
      try {
        imagenes = JSON.parse(imagenesExistentes);
      } catch (parseError) {
        return res.status(400).json({ error: "El formato de 'imagenesExistentes' no es válido." });
      }
    }

    // Subir nuevas imágenes si se enviaron archivos
    if (req.files && req.files.length > 0) {
      const nuevas = await Promise.all(req.files.map(uploadToS3));
      imagenes = [...imagenes, ...nuevas];
    }

    // Actualizar el servicio con los nuevos datos
    const actualizacion = {
      nombre,
      ubicacion,
      descripcion,
      telefono,
      email,
      tipoServicio,
      imagenes,
    };

    const servicioActualizado = await Servicio.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true }
    );

    res.status(200).json(servicioActualizado);
  } catch (error) {
    console.error("❌ Error al actualizar el servicio:", error);
    res.status(500).json({ error: "Error al actualizar el servicio." });
  }
});

// DELETE: Eliminar un servicio
router.delete("/:id", async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado." });

    await Promise.all(servicio.imagenes.map((imageUrl) => {
      const key = decodeURIComponent(imageUrl.split("/").pop());
      return s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
    }));

    // Eliminar el servicio de la base de datos
    await Servicio.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Servicio e imágenes eliminados correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el servicio." });
  }
});

module.exports = router;