const mongoose = require('mongoose');
const Stat = require('./models/Stat');

mongoose.connect('mongodb://localhost:27017/xprofit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected.');

  await Stat.insertMany([
    { stat_name: "active_users", value: 1230 },
    { stat_name: "profit_paid", value: 58000 },
    { stat_name: "top_investor", value: 10000 }
  ]);

  console.log('Initial data inserted!');
  mongoose.disconnect();
}).catch(err => {
  console.error('Connection error:', err);
});