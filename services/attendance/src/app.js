const express = require('express');
const mongoose = require('mongoose');

// Initialize App
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lab_final')
    .then(() => console.log('Connected to MongoDB (Attendance Service)'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Schema and Model
const attendanceSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// API Endpoints

// Record Attendance
app.post('/attendance', async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).json({ message: 'Attendance recorded successfully!', attendance });
    } catch (err) {
        res.status(400).json({ error: 'Failed to record attendance', details: err.message });
    }
});

// Get Attendance by User ID
app.get('/attendance/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const records = await Attendance.find({ user_id: userId });
        if (!records.length) {
            return res.status(404).json({ error: 'No attendance records found for this user' });
        }
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attendance records', details: err.message });
    }
});

// Start the Server
app.listen(5001, () => console.log('Attendance service running on port 5001'));
