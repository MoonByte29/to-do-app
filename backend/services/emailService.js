const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendReminderEmail = async (recipientEmail, task) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email credentials not configured. Skipping email notification.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Task Reminder: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Public Sans', Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { border-bottom: 2px solid #7694b8; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 600; color: #293648; margin: 0; }
            .task-title { font-size: 20px; font-weight: 600; color: #2e4057; margin: 16px 0 8px 0; }
            .task-description { color: #53769d; margin: 8px 0; line-height: 1.6; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; margin: 8px 0; }
            .priority-high { background-color: #fce4e4; color: #c81e1e; }
            .priority-medium { background-color: #e6f2ff; color: #2563eb; }
            .priority-low { background-color: #f0f1f3; color: #5a6678; }
            .due-date { color: #7694b8; font-size: 14px; margin: 12px 0; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #d0d9e7; color: #a6b9d2; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">TaskFlow Reminder</h1>
            </div>
            <p style="color: #53769d; margin-bottom: 16px;">You have a task reminder:</p>
            <h2 class="task-title">${task.title}</h2>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div>
              <span class="priority priority-${task.priority}">${task.priority.toUpperCase()} Priority</span>
            </div>
            ${task.dueDate ? `<p class="due-date">Due: ${new Date(task.dueDate).toLocaleString()}</p>` : ''}
            ${task.notes ? `<p class="task-description"><strong>Notes:</strong> ${task.notes}</p>` : ''}
            <div class="footer">
              <p>This is an automated reminder from TaskFlow.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email reminder sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Send email error:', error);
    throw error;
  }
};

module.exports = { sendReminderEmail };