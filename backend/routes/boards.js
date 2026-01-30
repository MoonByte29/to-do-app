const express = require('express');
const Board = require('../models/Board');
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    
    const boardsWithTaskCount = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({ boardId: board._id });
        const completedCount = await Task.countDocuments({ boardId: board._id, status: 'completed' });
        return {
          id: board._id,
          title: board.title,
          description: board.description,
          color: board.color,
          taskCount,
          completedCount,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt
        };
      })
    );

    res.json({ boards: boardsWithTaskCount });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, color } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = new Board({
      title,
      description: description || '',
      color: color || '#7694b8',
      userId: req.user.userId
    });

    await board.save();

    res.status(201).json({
      message: 'Board created successfully',
      board: {
        id: board._id,
        title: board.title,
        description: board.description,
        color: board.color,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      }
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({
      board: {
        id: board._id,
        title: board.title,
        description: board.description,
        color: board.color,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (color !== undefined) board.color = color;

    await board.save();

    res.json({
      message: 'Board updated successfully',
      board: {
        id: board._id,
        title: board.title,
        description: board.description,
        color: board.color,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      }
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await Task.deleteMany({ boardId: req.params.id });
    await Board.deleteOne({ _id: req.params.id });

    res.json({ message: 'Board and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

module.exports = router;