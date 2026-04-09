const mongoose = require('mongoose');

let connStr = process.env.MONGO_CONN;

if (!connStr) {
  console.error('MONGO_CONN is not defined in .env');
  process.exit(1);
}

// remove surrounding quotes if copied directly from .env
connStr = connStr.replace(/^"|"$/g, '');

mongoose
  .connect(connStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

module.exports = mongoose;