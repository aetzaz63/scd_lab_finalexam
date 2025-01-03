const express = require('express');
const mongoose = require('mongoose');

// Initialize Express App
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lab_final')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Faculty Schema and Model
const facultySchema = new mongoose.Schema({
    faculty_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    schedule: { type: String, required: true }, // Weekly or daily schedule
    tasks: [
        {
            title: { type: String, required: true },
            description: { type: String },
            due_date: { type: Date },
            status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        },
    ],
});

const Faculty = mongoose.model('Faculty', facultySchema);

// API Endpoints

// Add a New Faculty Member
app.post('/faculty', async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();
        res.status(201).json({ message: 'Faculty added successfully!', faculty });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add faculty', details: err.message });
    }
});

// Get Faculty Details by ID
app.get('/faculty/:facultyId', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const faculty = await Faculty.findOne({ faculty_id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch faculty details', details: err.message });
    }
});

// Update Faculty Details
app.put('/faculty/:facultyId', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const updatedFaculty = await Faculty.findOneAndUpdate(
            { faculty_id: facultyId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFaculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json({ message: 'Faculty details updated successfully', faculty: updatedFaculty });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update faculty details', details: err.message });
    }
});

// Delete a Faculty Member
app.delete('/faculty/:facultyId', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const deletedFaculty = await Faculty.findOneAndDelete({ faculty_id: facultyId });
        if (!deletedFaculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully', faculty: deletedFaculty });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete faculty', details: err.message });
    }
});

// Add a Task to a Faculty Member
app.post('/faculty/:facultyId/tasks', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const faculty = await Faculty.findOne({ faculty_id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        faculty.tasks.push(req.body); // Add new task
        await faculty.save();
        res.json({ message: 'Task added successfully!', faculty });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add task', details: err.message });
    }
});

// Update a Task for a Faculty Member
app.put('/faculty/:facultyId/tasks/:taskId', async (req, res) => {
    try {
        const { facultyId, taskId } = req.params;
        const faculty = await Faculty.findOne({ faculty_id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        const task = faculty.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        Object.assign(task, req.body); // Update task details
        await faculty.save();
        res.json({ message: 'Task updated successfully!', faculty });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update task', details: err.message });
    }
});

// Get Faculty's Tasks
app.get('/faculty/:facultyId/tasks', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const faculty = await Faculty.findOne({ faculty_id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json(faculty.tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
    }
});

// Start the Server
app.listen(5002, () => console.log('Faculty service running on port 5002'));
