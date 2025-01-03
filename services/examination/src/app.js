const express = require('express');
const mongoose = require('mongoose');

// Initialize App
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lab_final')
    .then(() => console.log('Connected to MongoDB (Examination Service)'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Schemas and Models
const scheduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
});

const resultSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
const Result = mongoose.model('Result', resultSchema);

// API Endpoints

// Add a New Exam Schedule
app.post('/schedule', async (req, res) => {
    try {
        const schedule = new Schedule(req.body);
        await schedule.save();
        res.status(201).json({ message: 'Exam scheduled successfully!', schedule });
    } catch (err) {
        res.status(400).json({ error: 'Failed to schedule exam', details: err.message });
    }
});

// Add Results for a Student
app.post('/results', async (req, res) => {
    try {
        const result = new Result(req.body);
        await result.save();
        res.status(201).json({ message: 'Results added successfully!', result });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add results', details: err.message });
    }
});

// Get Performance by Student ID
app.get('/performance/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const results = await Result.find({ student_id: studentId });
        if (!results.length) {
            return res.status(404).json({ error: 'No results found for this student' });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch performance', details: err.message });
    }
});

// Start the Server
app.listen(5000, () => console.log('Examination service running on port 5000'));
