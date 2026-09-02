import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('================================================================');
console.log('🔍 DEEP GMAIL SMTP REAL DELIVERY DIAGNOSTIC TOOL');
console.log('================================================================\n');

const gmailUser = process.env.GMAIL_USER?.trim();
const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

if (!gmailUser || !gmailPass) {
  console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD not set in .env');
  process.exit(1);
}

console.log(`📧 Authenticated Sender Account: ${gmailUser}`);
console.log(`🔐 App Password Configured: YES (${gmailPass.length} chars)`);

// 1. Configure robust transport using direct SSL on port 465
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
  logger: false,
  debug: false
});

async function runDiagnostic() {
  try {
    // Step 1: Verify SMTP Connection
    console.log('\n--- 1. VERIFYING SMTP HANDSHAKE ---');
    await transporter.verify();
    console.log('✅ SMTP connection handshake with smtp.gmail.com:465 SUCCESSFUL!');

    // Step 2: Recipient Target
    const targetRecipient = process.argv[2] || gmailUser;
    console.log(`\n--- 2. SENDING RAW DELIVERY TEST TO: ${targetRecipient} ---`);

    const mailOptions = {
      from: `"AmantranLink Royal Invitations" <${gmailUser}>`,
      to: targetRecipient,
      replyTo: gmailUser,
      subject: `AMANTRANLINK EMAIL DELIVERY TEST — ${new Date().toLocaleTimeString()}`,
      text: `If you received this email, Gmail SMTP delivery is working.\n\nSent at: ${new Date().toISOString()}\nSender: ${gmailUser}\nRecipient: ${targetRecipient}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #E8DFD1; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #540D1E; margin-top: 0;">👑 AmantranLink Delivery Verification</h2>
          <p style="font-size: 15px; color: #333333; line-height: 1.6;">
            If you received this email, Gmail SMTP delivery is working properly.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <table style="width: 100%; font-size: 13px; color: #666;">
            <tr><td><strong>Sender:</strong></td><td>${gmailUser}</td></tr>
            <tr><td><strong>Recipient:</strong></td><td>${targetRecipient}</td></tr>
            <tr><td><strong>Timestamp:</strong></td><td>${new Date().toISOString()}</td></tr>
            <tr><td><strong>SMTP Host:</strong></td><td>smtp.gmail.com:465 (SSL)</td></tr>
          </table>
        </div>
      `,
      headers: {
        'X-Mailer': 'AmantranLink Notification Engine 3.0',
        'X-Priority': '1'
      }
    };

    console.log('📤 Transmitting envelope to Gmail mail server...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n================================================================');
    console.log('📋 FULL NODEMAILER RESPONSE INSPECTION:');
    console.log('================================================================');
    console.log(`• messageId:     ${info.messageId}`);
    console.log(`• response:      ${info.response}`);
    console.log(`• accepted:      ${JSON.stringify(info.accepted)}`);
    console.log(`• rejected:      ${JSON.stringify(info.rejected)}`);
    console.log(`• pending:       ${JSON.stringify(info.pending || [])}`);
    console.log(`• envelope.from: ${info.envelope?.from}`);
    console.log(`• envelope.to:   ${JSON.stringify(info.envelope?.to)}`);
    console.log('================================================================\n');

    if (info.accepted.includes(targetRecipient)) {
      console.log(`✅ SUCCESS: Gmail SMTP accepted message for ${targetRecipient}`);
      if (targetRecipient === gmailUser) {
        console.log('⚠️ NOTE ON SENDER-TO-SELF DELIVERY:');
        console.log('When sending an email from a Gmail account to that SAME Gmail account:');
        console.log('1. Google places the message in your "Sent" folder.');
        console.log('2. It also appears under "All Mail" and "Inbox" (or threaded into existing conversation).');
        console.log('3. Gmail web app will NOT play an unread sound or push notification for self-sent mail.');
        console.log('👉 To verify external delivery to guests, test sending to a DIFFERENT email address.');
      } else {
        console.log(`👉 Check ${targetRecipient} Inbox, Spam, and Promotions tabs.`);
      }
    } else {
      console.error(`❌ FAILURE: Recipient ${targetRecipient} was rejected by mail server:`, info.rejected);
    }

  } catch (err) {
    console.error('❌ Diagnostic Exception:', err);
  }
}

runDiagnostic();
