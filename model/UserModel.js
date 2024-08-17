const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  enrolledSubjects: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course' 
  }],
  managedCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course'  
  }]
}, {timestamps: true});



module.exports = mongoose.model('course_user', UserSchema);
