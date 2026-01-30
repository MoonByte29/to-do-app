const express = require('express');
const Task = require('../models/Task');
const Board = require('../models/Board');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/board/:boardId', async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, userId: req.user.userId });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = await Task.find({ boardId: req.params.boardId }).sort({ createdAt: -1 });
    
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      reminderDate: task.reminderDate,
      tags: task.tags,
      notes: task.notes,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, boardId, priority, dueDate, reminderDate, tags, notes } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ error: 'Title and boardId are required' });
    }

    const board = await Board.findOne({ _id: boardId, userId: req.user.userId });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const task = new Task({
      title,
      description: description || '',
      boardId,
      userId: req.user.userId,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      reminderDate: reminderDate || null,
      tags: tags || [],
      notes: notes || ''
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        reminderDate: task.reminderDate,
        tags: task.tags,
        notes: task.notes,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, priority, status, dueDate, reminderDate, tags, notes } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (reminderDate !== undefined) {
      task.reminderDate = reminderDate;
      task.reminderSent = false;
    }
    if (tags !== undefined) task.tags = tags;
    if (notes !== undefined) task.notes = notes;

    await task.save();

    res.json({
      message: 'Task updated successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        reminderDate: task.reminderDate,
        tags: task.tags,
        notes: task.notes,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      userId: req.user.userId,
      status: 'pending',
      dueDate: { $gte: now, $lte: nextWeek }
    }).sort({ dueDate: 1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      boardId: task.boardId,
      createdAt: task.createdAt
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
});

module.exports = router;