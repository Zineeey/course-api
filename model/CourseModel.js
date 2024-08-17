const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    courseTitle: {
        type: String,
        required: true,
        unique: true
    },
    courseDescription: {
        type: String,
        required: true
    },
    courseUnits: {
        type: Number,
        required: true
    },
    courseInstructor:[{
        type: Schema.Types.ObjectId,
        ref: 'course_user',
    }],
    enrolledStudents: [{
        type: Schema.Types.ObjectId,
        ref: 'course_user'
    }]
}, {timestamps: true})


module.exports = mongoose.model('Course', CourseSchema);