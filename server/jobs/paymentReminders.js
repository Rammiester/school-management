const cron = require('node-cron');
const Billing = require('../models/Billing');
const Student = require('../models/Student');
const { sendSms, sendWhatsAppMessage } = require('../utils/notifications');

// Schedule a job to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled job: sending payment reminders');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueBills = await Billing.find({
      status: 'unpaid',
      dueDate: { $lt: today },
    }).populate('student').populate('template');

    for (const bill of overdueBills) {
      if (bill.student && bill.student.parentContact) {
        const message = `Dear Parent, this is a reminder for the following bill: ${bill.description}. The total amount is ${bill.amount} and was due on ${bill.dueDate.toLocaleDateString()}. Please pay at your earliest convenience.`;
        // Choose one or both methods to send notifications
        // await sendSms(bill.student.parentContact, message);
        // await sendWhatsAppMessage(bill.student.parentContact, message);
      }
    }
  } catch (error) {
    console.error('Error sending payment reminders:', error);
  }
});