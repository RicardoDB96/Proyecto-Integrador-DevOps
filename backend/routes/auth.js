// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/* 🔹 Register a new user (Client) */
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    // Check if email or phone number already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const existingPhone = await User.findOne({ telefono });
    if (existingPhone) return res.status(400).json({ mensaje: "El número de teléfono ya está registrado" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with role "cliente"
    const newUser = new User({
      nombre,
      email,
      telefono,
      password: hashedPassword,
      rol: "cliente" // 🔹 Ensure role is assigned
    });

    await newUser.save();

    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: newUser });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el usuario", error });
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
