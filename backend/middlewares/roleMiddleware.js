const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.usuario.id);

    if (!usuario || usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado. Se requiere rol de administrador." });
    }

    next();
  } catch (error) {
    res.status(500).json({ mensaje: "Error en la autenticación", error });
  }
};

module.exports = adminMiddleware;
