const express = require('express');
const mongoose = require('mongoose');

// Initialize Express App
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lab_final')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Student Schema and Model
const studentSchema = new mongoose.Schema({
    student_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    grade: { type: String, required: true }, // Overall grade
    progress: { type: String, required: true }, // Progress description
    subjects: [
        {
            name: { type: String, required: true },
            marks: { type: Number, required: true },
            grade: { type: String }, // Subject-specific grade
        },
    ],
});

const Student = mongoose.model('Student', studentSchema);

// Helper function to calculate grade based on marks
const calculateGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
};

// API Endpoints

// Add a New Student
app.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ message: 'Student added successfully!', student });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add student', details: err.message });
    }
});

// Get Student Details by ID
app.get('/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student details', details: err.message });
    }
});

// Update Student Details
app.put('/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const updatedStudent = await Student.findOneAndUpdate(
            { student_id: studentId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student details updated successfully', student: updatedStudent });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update student details', details: err.message });
    }
});

// Delete a Student
app.delete('/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const deletedStudent = await Student.findOneAndDelete({ student_id: studentId });
        if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student', details: err.message });
    }
});

// Add Subject and Marks for a Student with Grade Calculation
app.post('/students/:studentId/subjects', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const { name, marks } = req.body;
        const grade = calculateGrade(marks); // Calculate grade based on marks
        student.subjects.push({ name, marks, grade });
        await student.save();
        res.json({ message: 'Subject and grade added successfully!', student });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add subject and grade', details: err.message });
    }
});

// Get Student's Academic Progress, Including Overall Grade
app.get('/students/:studentId/progress', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Calculate the overall grade based on subject grades (average marks)
        const totalMarks = student.subjects.reduce((sum, subject) => sum + subject.marks, 0);
        const overallGrade = calculateGrade(totalMarks / student.subjects.length);

        res.json({
            student_id: student.student_id,
            name: student.name,
            grade: overallGrade,
            progress: student.progress,
            subjects: student.subjects,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student progress', details: err.message });
    }
});

// Start the Server
app.listen(5003, () => console.log('Student service running on port 5003'));
