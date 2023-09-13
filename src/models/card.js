const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    expansion: String,
    price: Number,
    language: String,
    img: String,
    desc: String,
    stock: Number
  
  // Otros campos de tu modelo
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
