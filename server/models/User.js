const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'pending' },
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
    uniqueId: {
      type: String,
      unique: true,
      sparse: true, // existing users can be backfilled later
      index: true,
    }
}, { timestamps: true });

/**
 * Counter schema & model
 * Used to generate atomic, per-prefix incremental counters to avoid race conditions.
 * Document example: { _id: 'ADM', seq: 12 }
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // prefix, e.g., ADM, TCH
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// Role prefix map
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

/**
 * Pre-save hook to assign role-based uniqueId.
 * - chairman -> fixed "CHM1"
 * - others -> PREFIX + zero-padded sequence, e.g., ADM0001
 *
 * Uses an atomic counter (findOneAndUpdate with $inc & upsert) for concurrency safety.
 */
userSchema.pre("save", async function (next) {
  try {
    // if already has uniqueId, skip
    if (this.uniqueId) return next();

    const role = (this.role || 'user').toLowerCase();
    const prefix = rolePrefixes[role] || 'USR';

    // Chairman gets fixed identifier CHM1 (singleton)
    if (role === 'chairman') {
      this.uniqueId = 'CHM1';
      return next();
    }

    // For other roles, atomically increment the counter document for that prefix
    const counterId = prefix; // e.g., 'ADM', 'TCH'
    const updatedCounter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const seqNumber = updatedCounter.seq || 1;
    const padded = String(seqNumber).padStart(4, '0'); // e.g., 0001
    this.uniqueId = `${prefix}${padded}`;

    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Existing statics preserved below (availability helpers, etc.)
 */

userSchema.statics.isBusyAtTime = async function(userId, date, timeSlot) {
    try {
        const user = await this.findById(userId);
        if (!user || (user.role !== 'teacher' && user.role !== 'staff')) {
            return false;
        }
        
        const Timetable = require('../models/Timetable');
        
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const timetables = await Timetable.find();
        
        for (const timetable of timetables) {
            const schedule = timetable.schedule[dayOfWeek];
            if (schedule && Array.isArray(schedule)) {
                const entry = schedule.find(item => 
                    item.time === timeSlot && 
                    item.teacher === user.name
                );
                if (entry) {
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking user availability:', error);
        return false;
    }
};

userSchema.statics.checkAvailabilityForPeriod = async function(userId, className, day, timeSlot) {
    try {
        const user = await this.findById(userId);
        if (!user || (user.role !== 'teacher' && user.role !== 'staff')) {
            return { available: false, reason: 'Not a teacher or staff member' };
        }
        
        const Timetable = require('../models/Timetable');
        
        const currentTimetable = await Timetable.findOne({ class: className });
        if (currentTimetable) {
            const schedule = currentTimetable.schedule[day];
            if (schedule && Array.isArray(schedule)) {
                const existingEntry = schedule.find(item => 
                    item.time === timeSlot && item.teacher === user.name
                );
                if (existingEntry) {
                    return { available: true, reason: 'Already assigned to this period', canAssign: false };
                }
            }
        }
        
        const allTimetables = await Timetable.find();
        for (const timetable of allTimetables) {
            if (timetable.class === className) continue;
            
            const schedule = timetable.schedule[day];
            if (schedule && Array.isArray(schedule)) {
                const entry = schedule.find(item => 
                    item.time === timeSlot && 
                    item.teacher === user.name
                );
                if (entry) {
                    return { available: false, reason: 'Already assigned to another class during this time slot', canAssign: false };
                }
            }
        }
        
        return { available: true, reason: 'Available for assignment', canAssign: true };
    } catch (error) {
        console.error('Error checking user availability for period:', error);
        return { available: false, reason: 'Error checking availability', canAssign: false };
    }
};

userSchema.statics.getAvailabilityStatus = async function(userId) {
    try {
        const user = await this.findById(userId);
        if (!user) {
            return { error: 'User not found' };
        }
        
        return {
            userId: user._id,
            name: user.name,
            role: user.role,
            isAvailable: user.isAvailable,
            status: user.isAvailable ? 'free' : 'busy'
        };
    } catch (error) {
        console.error('Error getting user availability:', error);
        return { error: 'Failed to get availability status' };
    }
};

userSchema.statics.updateAvailability = async function(userId, isAvailable) {
    try {
        const updatedUser = await this.findByIdAndUpdate(
            userId,
            { isAvailable: isAvailable },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return { error: 'User not found' };
        }
        return {
            userId: updatedUser._id,
            name: updatedUser.name,
            isAvailable: updatedUser.isAvailable,
            status: updatedUser.isAvailable ? 'free' : 'busy'
        };
    } catch (error) {
        console.error('Error updating user availability:', error);
        return { error: 'Failed to update availability status' };
    }
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
