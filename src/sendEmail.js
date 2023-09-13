const nodemailer = require("nodemailer");

// Configura el transporte SMTP usando tu cuenta de Gmail
const sendEmail = (htmlContent, userEmail) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "correo@gmail.com", // Tu dirección de correo
      pass: "clave", // Tu contraseña
    },
  });

  // Configura el contenido del correo electrónico
  const mailOptions = {
    from: "correo@gmail.com",
    to: userEmail,
    subject: "Detalles de tu pedido",
    html: htmlContent,
  };

  // Envía el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
};

module.exports = { sendEmail };
