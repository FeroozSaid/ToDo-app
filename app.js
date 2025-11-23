require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Set EJS as view engine
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// Task model
const Task = mongoose.model('Task', {
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Routes

// Home page route
app.get('/', (req, res) => {
  res.render('index', { title: 'Todo App - Home' });
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render('tasks', { title: 'All Tasks', tasks: tasks });
  } catch (error) {
    console.error(error);
    res.render('tasks', { title: 'All Tasks', tasks: [] });
  }
});

// Show form to create new task
app.get('/tasks/new', (req, res) => {
  res.render('task-form', { title: 'Create New Task', task: null });
});

// Create new task
app.post('/tasks', async (req, res) => {
  try {
    await Task.create(req.body);
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.redirect('/tasks');
  }
});

// Show form to edit task
app.get('/tasks/:id/edit', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.render('task-form', { title: 'Edit Task', task: task });
  } catch (error) {
    console.error(error);
    res.redirect('/tasks');
  }
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed === 'on'
    });
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.redirect('/tasks');
  }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.redirect('/tasks');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});