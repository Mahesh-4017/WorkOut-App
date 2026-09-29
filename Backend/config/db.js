const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb+srv://WorkOut:3NnzoRKgDBqeSCSh@cluster0.pjqeoxt.mongodb.net/workout_db?retryWrites=true&w=majority';

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDatabase;

