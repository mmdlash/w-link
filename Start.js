const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // اول require کن

const app = express(); // اول این خط اجرا بشه
app.use(cors()); // بعدش اینو اجرا کن

const Stat = require('./models/Stat');

// ادامه کد...

//const app = express();
const PORT = 3000;

// اتصال به MongoDB
mongoose.connect('mongodb://localhost:27017/xprofit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// نمایش عدد فعلی سرمایه‌گذاری
app.get('/api/stats/investment', async (req, res) => {
  const stat = await Stat.findOne({ stat_name: 'total_investment' });
  res.json({ value: stat?.value || 0 });
});




// سود پرداخت‌شده
app.get('/api/stats/profit', async (req, res) => {
  const stat = await Stat.findOne({ stat_name: 'profit_paid' });
  res.json({ value: stat?.value || 0 });
});

// کاربران فعال
app.get('/api/stats/users', async (req, res) => {
  const stat = await Stat.findOne({ stat_name: 'active_users' });
  res.json({ value: stat?.value || 0 });
});

// بیشترین سرمایه‌گذاری یک کاربر
app.get('/api/stats/top', async (req, res) => {
  const stat = await Stat.findOne({ stat_name: 'top_investor' });
  res.json({ value: stat?.value || 0 });
});







// هر ۲ ثانیه عدد رندمی بین ۵ تا ۱۰ اضافه کن
setInterval(async () => {
  const randomInc = Math.floor(Math.random() * 6) + 5;

  await Stat.findOneAndUpdate(
    { stat_name: 'total_investment' },
    { $inc: { value: randomInc } },
    { upsert: true, new: true }
  );
}, 2000);



  // افزایش سود پرداخت‌شده
  setInterval(async () => {
    const inc = Math.floor(Math.random() * 10) + 5; // افزایش بین 5 تا 14
    await Stat.findOneAndUpdate(
      { stat_name: 'profit_paid' },
      { $inc: { value: inc } }
    );
  }, 4000);
  
  // افزایش تعداد کاربران فعال
  setInterval(async () => {
    const inc = Math.floor(Math.random() * 3); // افزایش بین 0 تا 2
    await Stat.findOneAndUpdate(
      { stat_name: 'active_users' },
      { $inc: { value: inc } }
    );
  }, 5000);
  
  // افزایش مقدار بیشترین سرمایه‌گذاری (نادر)
  setInterval(async () => {
    const chance = Math.random();
    if (chance < 0.1) {
      const inc = Math.floor(Math.random() * 100);
      await Stat.findOneAndUpdate(
        { stat_name: 'top_investor' },
        { $inc: { value: inc } }
      );
    }
  }, 15000);









app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





