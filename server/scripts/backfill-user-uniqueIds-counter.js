// scripts/backfill-user-uniqueIds-counter.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User'); // now uses counter model
const Counter = mongoose.models.Counter || require('mongoose').model('Counter'); // safe access

const rolePrefixes = {
  chairman: "CHM",
  admin: "ADM",
  teacher: "TCH",
  accountant: "ACC",
  librarian: "LIB",
  receptionist: "RCP",
  transport: "TRN",
  warden: "WRD",
  staff: "STF",
  user: "USR",
};

const pad = (n) => String(n).padStart(4, '0');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const users = await User.find().sort({ _id: 1 }).lean();

    for (const u of users) {
      if (u.uniqueId) continue; // already filled

      const role = (u.role || 'user').toLowerCase();
      const prefix = rolePrefixes[role] || 'USR';

      if (role === 'chairman') {
        // assign CHM1 (if CHM1 already used, we still set CHM1 for chairman record)
        await User.updateOne({ _id: u._id }, { $set: { uniqueId: 'CHM1' }});
        console.log('Assigned CHM1 to', u._id.toString());
        continue;
      }

      // atomically increment counter for this prefix
      const counterDoc = await Counter.findOneAndUpdate(
        { _id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const seq = counterDoc.seq || 1;
      const candidate = `${prefix}${pad(seq)}`;

      // double-check uniqueness (extremely unlikely to collide)
      let finalCandidate = candidate;
      let attempt = 0;
      while (await User.findOne({ uniqueId: finalCandidate })) {
        attempt++;
        const newSeq = seq + attempt;
        finalCandidate = `${prefix}${pad(newSeq)}`;
        if (attempt > 1000) throw new Error('Too many collisions generating uniqueId');
      }

      await User.updateOne({ _id: u._id }, { $set: { uniqueId: finalCandidate }});
      console.log('Assigned', finalCandidate, 'to', u._id.toString());
    }

    console.log('Backfill complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Backfill error', err);
    process.exit(1);
  }
})();
