const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const bucketName = "reservo-imagenes"; // 📌 Nombre del bucket en GCS

// Configurar Google Cloud Storage
const storage = new Storage({
  keyFilename: path.resolve(__dirname, "../reservo-storage-key.json"),
});

const bucket = storage.bucket(bucketName);

// Configurar Multer para almacenar archivos en memoria antes de subirlos a GCS
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 📌 Subir archivo a Google Cloud Storage y obtener la URL pública.
 */
const uploadToGCS = async (file) => {
  if (!file) throw new Error("No se subió ningún archivo.");

  const filename = `${Date.now()}-${file.originalname}`;
  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream({
    resumable: false,
    public: true, // 📌 Hace la imagen accesible públicamente
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", () => {
      resolve(`https://storage.googleapis.com/${bucketName}/${filename}`);
    });
    blobStream.end(file.buffer);
  });
};

/**
 * 📌 Crear un nuevo salón con imágenes en GCS (Solo Admin)
 */
router.post("/", authMiddleware, adminMiddleware, upload.array("imagenes", 10), async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, precio, descripcion, contacto, telefono, email } = req.body;

    if (!telefono || !email) {
      return res.status(400).json({ mensaje: "El teléfono y el correo son obligatorios" });
    }

    // Subir imágenes a GCS y obtener sus URLs
    const imagenes = await Promise.all(req.files.map(uploadToGCS));

    const nuevoSalon = new Salon({
      nombre,
      ubicacion,
      capacidad,
      precio,
      descripcion,
      imagenes, // 📌 Guardamos las URLs de GCS en MongoDB
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

/**
 * 📌 Obtener todos los salones
 */
router.get("/", async (req, res) => {
  try {
    const salones = await Salon.find();
    res.json(salones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los salones", error });
  }
});

/**
 * 📌 Obtener un solo salón por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el salón", error });
  }
});

/**
 * 📌 Actualizar un salón con imágenes en GCS (Solo Admin)
 */
router.put("/:id", authMiddleware, adminMiddleware, upload.array("imagenes", 10), async (req, res) => {
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

    // Subir nuevas imágenes a GCS
    if (req.files.length > 0) {
      const newImages = await Promise.all(req.files.map(uploadToGCS));
      imagenes = [...imagenes, ...newImages];
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

/**
 * 📌 Eliminar una imagen de GCS y de MongoDB
 */
router.delete("/:id/imagen", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ mensaje: "URL de la imagen requerida" });

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    // Eliminar imagen de GCS
    const filename = imageUrl.split("/").pop();
    await bucket.file(filename).delete();

    // Eliminar URL de la imagen de MongoDB
    salon.imagenes = salon.imagenes.filter(img => img !== imageUrl);
    await salon.save();

    res.json({ mensaje: "Imagen eliminada correctamente", salon });
  } catch (error) {
    console.error("❌ Error al eliminar la imagen:", error);
    res.status(500).json({ mensaje: "Error al eliminar la imagen", error });
  }
});

/**
 * 📌 Eliminar un salón junto con sus imágenes en GCS (Solo Admin)
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ mensaje: "Salón no encontrado" });

    // Eliminar imágenes del salón en GCS
    await Promise.all(salon.imagenes.map((imageUrl) => {
      const filename = imageUrl.split("/").pop();
      return bucket.file(filename).delete();
    }));

    await Salon.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Salón eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar el salón:", error);
    res.status(500).json({ mensaje: "Error al eliminar el salón", error });
  }
});

module.exports = router;