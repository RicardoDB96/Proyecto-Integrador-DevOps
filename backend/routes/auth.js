const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/* 🔹 Registrar un usuario (Cualquier persona puede registrarse como cliente) */
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Todos los usuarios registrados serán "cliente" por defecto
    const nuevoUsuario = new User({ nombre, email, password: passwordHashed, rol: "cliente" });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el usuario", error });
  }
});

/* 🔹 Registrar el primer usuario admin (Solo se ejecuta si no hay admins) */
router.post("/register-admin", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si ya hay admins registrados
    const existeAdmin = await User.findOne({ rol: "admin" });
    if (existeAdmin) {
      return res.status(403).json({ mensaje: "Ya existe un administrador. Usa /register para agregar más clientes." });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Crear el usuario como admin
    const nuevoUsuario = new User({ nombre, email, password: passwordHashed, rol: "admin" });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Administrador creado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el administrador", error });
  }
});

/* 🔹 Registrar un nuevo admin (Solo los admins pueden hacerlo) */
router.post("/register-new-admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Guardar nuevo usuario admin
    const nuevoUsuario = new User({ nombre, email, password: passwordHashed, rol: "admin" });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Nuevo administrador creado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el nuevo administrador", error });
  }
});

/* 🔹 Login de usuario */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) {
      return res.status(400).json({ mensaje: "Credenciales inválidas" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el login", error });
  }
});

/* 🔹 Obtener perfil del usuario autenticado */
router.get("/perfil", authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select("-password");
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil", error });
  }
});

// Obtener todos los usuarios (🔒 Solo Admin)
router.get("/usuarios", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Busca todos los usuarios y excluye el campo "password" por seguridad
    const usuarios = await User.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los usuarios", error });
  }
});

module.exports = router;
