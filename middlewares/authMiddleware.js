const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ mensaje: "Acceso denegado, se requiere un token" });
  }

  try {
    const verificado = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.usuario = verificado; // Agrega la info del usuario al request
    next(); // Continua con la siguiente función
  } catch (error) {
    res.status(400).json({ mensaje: "Token no válido" });
  }
};

module.exports = authMiddleware;
