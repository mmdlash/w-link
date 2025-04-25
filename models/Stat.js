const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  stat_name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stat', statSchema);