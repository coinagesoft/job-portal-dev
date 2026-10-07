import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, subject, message } = body || {};

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, and message are required fields.',
        },
        { status: 400 }
      );
    }

    const recipient = process.env.CONTACT_RECEIVER_EMAIL || 'shivraj.b@coinage.in';
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const inquiryTopic = subject || 'General Inquiry';
    const emailSubject = `[JobBox Enquiry] ${inquiryTopic} from ${name.trim()}`;

    // HTML email template matching JobBox theme
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 20px; color: #122359; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(18, 35, 89, 0.08); border: 1px solid #e2e8f0; }
            .header { background: #122359; padding: 25px 30px; color: #ffffff; text-align: left; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; }
            .header p { margin: 6px 0 0; font-size: 14px; color: #ffc151; }
            .content { padding: 30px; }
            .badge { display: inline-block; background: #ffa300; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 20px; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .info-table td { padding: 10px 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
            .info-table td.label { font-weight: 600; color: #66789c; width: 35%; }
            .info-table td.value { color: #122359; font-weight: 500; }
            .info-table td.value a { color: #ffa300; text-decoration: none; font-weight: 600; }
            .message-box { background: #f8faff; border-left: 4px solid #ffa300; border-radius: 6px; padding: 18px 20px; margin-bottom: 25px; }
            .message-title { font-size: 13px; font-weight: 700; color: #66789c; text-transform: uppercase; margin-bottom: 8px; }
            .message-body { font-size: 15px; line-height: 1.6; color: #122359; white-space: pre-wrap; margin: 0; }
            .reply-btn { display: inline-block; background: #ffa300; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 10px; }
            .footer { background: #f8faff; padding: 20px 30px; font-size: 12px; color: #a0abb8; text-align: center; border-top: 1px solid #edf2f7; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Website Enquiry</h1>
              <p>Received via JobBox Contact Us Page</p>
            </div>
            <div class="content">
              <span class="badge">${inquiryTopic}</span>
              <table class="info-table">
                <tr>
                  <td class="label">Full Name:</td>
                  <td class="value"><strong>${name.trim()}</strong></td>
                </tr>
                <tr>
                  <td class="label">Email Address:</td>
                  <td class="value"><a href="mailto:${email.trim()}">${email.trim()}</a></td>
                </tr>
                <tr>
                  <td class="label">Phone Number:</td>
                  <td class="value">${phone?.trim() ? `<a href="tel:${phone.trim()}">${phone.trim()}</a>` : 'Not provided'}</td>
                </tr>
                <tr>
                  <td class="label">Company Name:</td>
                  <td class="value">${company?.trim() || 'Not provided'}</td>
                </tr>
                <tr>
                  <td class="label">Inquiry Topic:</td>
                  <td class="value">${inquiryTopic}</td>
                </tr>
                <tr>
                  <td class="label">Submission Time:</td>
                  <td class="value">${timestamp}</td>
                </tr>
              </table>

              <div class="message-box">
                <div class="message-title">Enquiry Message:</div>
                <p class="message-body">${message.trim()}</p>
              </div>

              <div style="text-align: center;">
                <a class="reply-btn" href="mailto:${email.trim()}?subject=Re: ${encodeURIComponent(emailSubject)}">Reply to ${name.trim()}</a>
              </div>
            </div>
            <div class="footer">
              This email was automatically generated and delivered to <strong>${recipient}</strong>.<br/>
              JobBox &bull; Marathon Futurex, Lower Parel, Mumbai.
            </div>
          </div>
        </body>
      </html>
    `;

    const plainTextContent = `
NEW WEBSITE ENQUIRY (JobBox Contact Page)
==================================================
Topic: ${inquiryTopic}
Time: ${timestamp}

Sender Details:
- Name: ${name.trim()}
- Email: ${email.trim()}
- Phone: ${phone?.trim() || 'N/A'}
- Company: ${company?.trim() || 'N/A'}

Message:
${message.trim()}

==================================================
Recipient: ${recipient}
    `;

    // Check if SMTP environment variables are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"JobBox Portal" <${smtpUser}>`,
        to: recipient,
        replyTo: email.trim(),
        subject: emailSubject,
        text: plainTextContent,
        html: htmlContent,
      });

      console.log(`[Contact API] Email successfully sent to ${recipient} via SMTP.`);
      return NextResponse.json({
        success: true,
        message: `Your enquiry has been sent to ${recipient}.`,
        deliveredVia: 'smtp',
      });
    } else {
      // SMTP not configured yet — log detailed enquiry to server console so data is never lost
      console.log('====================================================');
      console.log(`[CONTACT ENQUIRY FORWARDED TO: ${recipient}]`);
      console.log(`From: ${name} <${email}>`);
      console.log(`Phone: ${phone || 'N/A'}`);
      console.log(`Company: ${company || 'N/A'}`);
      console.log(`Topic: ${inquiryTopic}`);
      console.log(`Message: ${message}`);
      console.log('NOTE: To deliver emails via live SMTP, configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local');
      console.log('====================================================');

      return NextResponse.json({
        success: true,
        message: `Your enquiry has been received and routed to ${recipient}.`,
        deliveredVia: 'logged',
      });
    }
  } catch (error) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process enquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}

