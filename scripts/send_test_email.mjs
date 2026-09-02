import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('✉️ SENDING LIVE TEST EMAIL VIA GMAIL SMTP...');
console.log('User:', process.env.GMAIL_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"AmantranLink Royal Invitations" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: '👑 AmantranLink Royal Wedding Test Email',
      html: `
        <div style="font-family: serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #E8DFD1; background: #FFFDF8; border-radius: 12px;">
          <h2 style="color: #540D1E; text-align: center;">Shahi Vivah Nimantran</h2>
          <p style="font-size: 16px; color: #333;">Bhai, aapka <strong>Gmail SMTP Engine</strong> successfully live connect ho chuka hai! 🎉</p>
          <p style="font-size: 14px; color: #666;">Ab AmantranLink ke sabhi Royal Wedding Invitations, RSVP Confirmations, aur Studio Invoices direct <strong>${process.env.GMAIL_USER}</strong> se guests ke inbox me successfully send honge.</p>
          <div style="text-align: center; margin-top: 25px;">
            <span style="background: #0F766E; color: #FFF; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-family: sans-serif; font-size: 13px;">✓ Live Verification Passed</span>
          </div>
        </div>
      `,
    });

    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
  }
}

main();
