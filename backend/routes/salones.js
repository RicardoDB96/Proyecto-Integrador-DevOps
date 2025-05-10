const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

// Configurar AWS SDK con credenciales temporales (AWS Academy)
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

/**
 * 📌 Subir archivo a Amazon S3
 */
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

// 👇 Resto de tus rutas (solo se cambió uploadToGCS → uploadToS3)

router.post("/", authMiddleware, adminMiddleware, upload.array("imagenes", 10), async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email } = req.body;

    if (!telefono || !email) {
      return res.status(400).json({ mensaje: "El teléfono y el correo son obligatorios" });
    }

    const imagenes = await Promise.all(req.files.map(uploadToS3));

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
    console.error("❌ Error al crear el salón:", error);
    res.status(500).json({ mensaje: "Error al crear el salón", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const salones = await Salon.find();
    res.json(salones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los salones", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el salón", error });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, upload.array("imagenes", 10), async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email, imagenesExistentes } = req.body;

    if (!telefono || !email) {
      return res.status(400).json({ mensaje: "El teléfono y el correo son obligatorios" });
    }

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    let imagenes = salon.imagenes;
    if (imagenesExistentes) imagenes = JSON.parse(imagenesExistentes);

    if (req.files.length > 0) {
      const nuevas = await Promise.all(req.files.map(uploadToS3));
      imagenes = [...imagenes, ...nuevas];
    }

    const salonActualizado = await Salon.findByIdAndUpdate(
      req.params.id,
      { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email, imagenes },
      { new: true }
    );

    res.json(salonActualizado);
  } catch (error) {
    console.error("❌ Error al actualizar el salón:", error);
    res.status(500).json({ mensaje: "Error al actualizar el salón", error });
  }
});

router.delete("/:id/imagen", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ mensaje: "URL de la imagen requerida" });

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    const key = decodeURIComponent(imageUrl.split("/").pop());
    await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();

    salon.imagenes = salon.imagenes.filter((img) => img !== imageUrl);
    await salon.save();

    res.json({ mensaje: "Imagen eliminada correctamente", salon });
  } catch (error) {
    console.error("❌ Error al eliminar la imagen:", error);
    res.status(500).json({ mensaje: "Error al eliminar la imagen", error });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    await Promise.all(salon.imagenes.map((imageUrl) => {
      const key = decodeURIComponent(imageUrl.split("/").pop());
      return s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
    }));

    await Salon.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Salón eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar el salón:", error);
    res.status(500).json({ mensaje: "Error al eliminar el salón", error });
  }
});

module.exports = router;
