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
    }
});

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

module.exports = mongoose.model('User', userSchema);
