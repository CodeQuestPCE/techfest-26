#!/usr/bin/env node
// Usage: MONGO_URI="mongodb://..." node backend/scripts/clean-team-members.js

const mongoose = require('mongoose');
const Registration = require('../src/models/Registration');
const User = require('../src/models/User');

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Please set MONGO_URI environment variable');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const regs = await Registration.find({}).populate('user', 'name email phone');
  console.log(`Found ${regs.length} registrations`);

  let changed = 0;

  for (const reg of regs) {
    if (!reg.teamMembers || reg.teamMembers.length === 0) continue;
    const leader = reg.user || {};
    const normalizedLeaderEmail = (leader.email || '').toString().toLowerCase();
    const normalizedLeaderPhone = (leader.phone || '').toString();
    const normalizedLeaderName = (leader.name || '').toString().trim().toLowerCase();

    const before = reg.teamMembers.length;
    const filtered = reg.teamMembers.filter((m, idx, arr) => {
      if (!m) return false;
      const memEmail = (m.email || '').toString().toLowerCase();
      const memPhone = (m.phone || '').toString();
      const memName = (m.name || '').toString().trim().toLowerCase();

      if ((normalizedLeaderEmail && memEmail && memEmail === normalizedLeaderEmail) ||
          (normalizedLeaderPhone && memPhone && memPhone === normalizedLeaderPhone) ||
          (normalizedLeaderName && memName && memName === normalizedLeaderName)) {
        return false;
      }

      // dedupe among members by email/phone
      for (let j = 0; j < idx; j++) {
        const prev = arr[j] || {};
        const prevEmail = (prev.email || '').toString().toLowerCase();
        const prevPhone = (prev.phone || '').toString();
        if ((memEmail && prevEmail && memEmail === prevEmail) || (memPhone && prevPhone && memPhone === prevPhone)) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length !== before) {
      reg.teamMembers = filtered;
      await reg.save();
      changed++;
      console.log(`Updated registration ${reg._id}: ${before} -> ${filtered.length}`);
    }
  }

  console.log(`Done. Updated ${changed} registrations.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
