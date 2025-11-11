const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSms = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
  }
};

const sendWhatsAppMessage = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    console.log(`WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${to}:`, error);
  }
};

module.exports = {
  sendSms,
  sendWhatsAppMessage,
};