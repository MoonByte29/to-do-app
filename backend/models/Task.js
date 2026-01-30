const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    default: null
  },
  reminderDate: {
    type: Date,
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);