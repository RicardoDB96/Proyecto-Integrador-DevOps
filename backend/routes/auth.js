// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

const validatePhoneNumber = (telefono) => {
  const phoneRegex = /^\d{10}$/; // Solo permite números de 10 dígitos
  return phoneRegex.test(telefono);
};

// Asegurar que saltRounds sea un número válido
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
console.log("🔢 Valor de saltRounds:", saltRounds); // ⬅️ Agregar log para verificar

router.post("/register", async (req, res) => {
  try {
    let { nombre, email, telefono, password } = req.body;

    // 🔹 Limpieza y normalización de los datos
    nombre = nombre.trim();
    email = email.trim().toLowerCase();
    telefono = telefono.trim();

    console.log("📌 Debug: Datos recibidos para registro:", { nombre, email, telefono, password });

    // 🔹 Verificar que los campos no estén vacíos
    if (!nombre || !email || !telefono || !password) {
      console.error("❌ Faltan datos:", { nombre, email, telefono, password });
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // 🔹 Validar formato del número de teléfono
    if (!validatePhoneNumber(telefono)) {
      console.error("❌ Número de teléfono inválido:", telefono);
      return res.status(400).json({ mensaje: "Número de teléfono no válido. Debe contener 10 dígitos." });
    }

    // 🔹 Validar formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Correo electrónico inválido:", email);
      return res.status(400).json({ mensaje: "El correo electrónico no es válido." });
    }

    // 🔹 Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const existingPhone = await User.findOne({ telefono });
    if (existingPhone) return res.status(400).json({ mensaje: "El número de teléfono ya está registrado" });

    // 🔹 Verificar si la contraseña tiene al menos 6 caracteres
    if (typeof password !== "string" || password.trim().length < 6) {
      console.error("❌ Contraseña inválida:", password);
      return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
    }

    // 🔹 Encriptar la contraseña
    console.log("🔑 Iniciando encriptación con saltRounds:", saltRounds);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ Contraseña encriptada correctamente");

    // 🔹 Crear el usuario
    const newUser = new User({
      nombre,
      email,
      telefono,
      password: hashedPassword,
      rol: "cliente",
    });

    await newUser.save();
    console.log("✅ Usuario registrado correctamente:", newUser);

    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: newUser });

  } catch (error) {
    console.error("❌ ERROR EN EL REGISTRO:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error });
  }
});



/* 🔹 Register First Admin (Only if no admin exists) */
router.post("/register-admin", async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    const existeAdmin = await User.findOne({ rol: "admin" });
    if (existeAdmin) {
      return res.status(403).json({ mensaje: "Ya existe un administrador. Usa /register para agregar clientes." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombre,
      email,
      telefono,
      password: hashedPassword,
      rol: "admin" // 🔹 Ensure role is assigned
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Administrador creado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el administrador", error });
  }
});


/* 🔹 Register a new Admin (Only Admins can do this) */
router.post("/register-new-admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let { nombre, email, telefono, password } = req.body;

    // Trim inputs to prevent accidental spaces
    nombre = nombre.trim();
    email = email.trim().toLowerCase();
    telefono = telefono.trim();

    // Validate input fields
    if (!nombre || !email || !telefono || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Ensure email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "El correo electrónico no es válido" });
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const existingPhone = await User.findOne({ telefono });
    if (existingPhone) return res.status(400).json({ mensaje: "El número de teléfono ya está registrado" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = new User({
      nombre,
      email,
      telefono,
      password: hashedPassword,
      rol: "admin", // Explicitly set as "admin"
    });

    await newAdmin.save();

    res.status(201).json({
      mensaje: "Nuevo administrador creado correctamente",
      usuario: {
        id: newAdmin._id,
        nombre: newAdmin.nombre,
        email: newAdmin.email,
        telefono: newAdmin.telefono,
        rol: newAdmin.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error al registrar el nuevo administrador:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error });
  }
});


/* 🔹 User Login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });

    if (!usuario) return res.status(400).json({ mensaje: "Credenciales inválidas" });

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) return res.status(400).json({ mensaje: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, telefono: usuario.telefono, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el login", error });
  }
});

/* 🔹 Get User Profile */
router.get("/perfil", authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select("-password");
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil", error });
  }
});

/* 🔹 Get All Users (Admin Only) */
router.get("/usuarios", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usuarios = await User.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los usuarios", error });
  }
});

module.exports = router;
