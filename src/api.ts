const Card = require('../src/models/card');
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const mercadopago = require("mercadopago");
//const cookieParser = require("cookie-parser");
const nodemailer = require("../src/sendEmail");

export const app = express();

mercadopago.configure({
  access_token:
    "MERCADOPAGO-TOKEN",
});

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true // Si es necesario para tus solicitudes
}));
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

const api = express.Router();

api.get('/hello', (req, res) => {
  res.status(200).send({ message: 'hello world' });
});

// Conexión a la base de datos
mongoose.connect("MONGODBSTRING", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir rutas CRUD
// TODAS LAS CARTAS
api.get("/cards", async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//FIND BY ID
api.get("/cards/:_id", async (req, res) => {
  try {
    const cardId = req.params._id;

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving card details" });
  }
  return res;
});

api.put("/cards/:_id", async (req, res) => {
  try {
    const cardId = req.params._id;
    console.log(`Updating stock for card with _id: ${cardId}`);
    const updatedCard = req.body;
    console.log("esto es UpdateCard:", updatedCard);
    const test = await Card.findOneAndUpdate({ _id: cardId }, updatedCard, {
      returnDocument: "after",
    });
    console.log(test);
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock" });
  }
});

//MERCADOPAGO
api.post("/create_preference", (req, res) => {
  let items = [];
  const order = req.body.order;
  const shippingCost = req.body.shippingCost;

  for (const product of order) {
    items.push({
      title: product.name,
      unit_price: Number(product.price),
      quantity: Number(product.quantity),
    });
  }

  let preference = {
    items: items,
    shipments: {
      cost: shippingCost,
    },
    back_urls: {
      success: "http://localhost:4200/success",
      failure: "http://localhost:4200/failure",
      pending: "",
    },
    auto_return: "approved",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json({
        id: response.body.id,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

api.get("/feedback", function (req, res) {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
  });
});

api.post("/send_email", (req, res) => {
  const emailContent = req.body.emailContent;
  const userEmail = req.body.destinataryEmail;
  const adminMail = 'correo.admin@gmail.com'
  console.log('Enviando correo al destinatario...');
  // Llama a la función de envío de correo electrónico usando el contenido HTML
  nodemailer.sendEmail(emailContent, userEmail);

  console.log('Enviando correo al admin...');
  // Llama a la función de envío de correo electrónico usando el contenido HTML
  nodemailer.sendEmail(emailContent, adminMail);


  res.send("Correo enviado correctamente");
});

// Version the api
app.use('/api/v1', api);
