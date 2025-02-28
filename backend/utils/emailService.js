//backend/utils/enviarService.js

const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar correos
const enviarCorreo = async (destinatario, asunto, mensaje) => {
  try {
    await transporter.sendMail({
      from: `"Marketplace de Eventos" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: mensaje,
    });
    console.log(`✅ Correo enviado a: ${destinatario}`);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
  }
};

module.exports = enviarCorreo;
