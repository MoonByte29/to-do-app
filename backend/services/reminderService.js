const Task = require('../models/Task');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');

const checkReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const tasksWithReminders = await Task.find({
      reminderDate: { $lte: fiveMinutesFromNow, $gte: now },
      reminderSent: false,
      status: 'pending'
    });

    for (const task of tasksWithReminders) {
      try {
        const user = await User.findById(task.userId);
        if (user && user.email) {
          await sendReminderEmail(user.email, task);
          task.reminderSent = true;
          await task.save();
          console.log(`Reminder sent for task: ${task.title}`);
        }
      } catch (error) {
        console.error(`Failed to send reminder for task ${task._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Check reminders error:', error);
  }
};

module.exports = { checkReminders };