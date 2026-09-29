require('dotenv').config();
const connectDatabase = require('../config/db');
const Card = require('../models/Card');

const cards = [
  { title: 'Reset & Restore', description: 'A calm full-body mobility session to loosen tight muscles and start the day with intention.', videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80', category: 'Mobility', audience: 'all', tags: ['mobility', 'recovery', 'beginner'], status: 'published', order: 1, isFeatured: true },
  { title: 'Strong Foundations', description: 'Build a steady strength base with a focused lower-body session for controlled progress.', videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE', thumbnailUrl: 'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=900&q=80', category: 'Strength', audience: 'all', tags: ['strength', 'legs', 'foundations'], status: 'published', order: 2, isFeatured: true },
  { title: 'Power & Performance', description: 'A focused performance session built around explosive movement, control, and confident form.', videoUrl: 'https://www.youtube.com/watch?v=IODxAZ3qQrs', thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80', category: 'Performance', audience: 'male', tags: ['power', 'performance', 'strength'], status: 'published', order: 3, isFeatured: true },
  { title: 'Core & Confidence', description: 'A balanced core session that builds stability, posture, and strength without rushing the work.', videoUrl: 'https://www.youtube.com/watch?v=AnYl6Nk9GOA', thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80', category: 'Core', audience: 'female', tags: ['core', 'stability', 'confidence'], status: 'published', order: 4, isFeatured: true },
  { title: 'Evening Unwind', description: 'Slow down with breath-led stretches and a gentle release for the end of a long day.', videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE', thumbnailUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80', category: 'Yoga', audience: 'all', tags: ['yoga', 'stretch', 'evening'], status: 'published', order: 5, isFeatured: false }
];

async function seedCards() {
  await connectDatabase();
  for (const card of cards) {
    await Card.findOneAndUpdate({ title: card.title }, card, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${cards.length} content cards`);
  await Card.db.close();
}

seedCards().catch(async error => { console.error(error); await Card.db.close(); process.exit(1); });
