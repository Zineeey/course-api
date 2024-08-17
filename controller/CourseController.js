const Course = require('../model/CourseModel');
const mongoose = require('mongoose');

const GetCourses = async(req, res) => {
    try{
        const courses = await Course.find()
        .populate('courseInstructor', [
            'firstName'
        ])
        .populate('enrolledStudents', [
            'fullName'
        ]);

        res.status(200).json(courses);
    }catch(error){
        res.status(400).json({message: error.message})
    }
}

const CreateCourse = async (req, res) => {
    const {courseTitle, courseDescription, courseUnits } = req.body;

    try{
        if(!courseTitle ||!courseDescription ||!courseUnits){
            throw new Error('All fields are required');
        }

        const newCourse = await Course.create({courseTitle, courseDescription, courseUnits})

        res.status(200).json(newCourse);

    }catch(error){
        res.status(400).json({message: error.message})
    }
}

const UpdateCourse = async (req, res) => {
    try{
        const {courseId} = req.params;
        const {courseTitle, courseDescription, courseUnits } = req.body;

        if(!mongoose.Types.ObjectId.isValid(courseId)){
            throw new Error('Invalid courseId');
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId, {courseTitle, courseDescription, courseUnits}, {new: true});


        if(!updatedCourse){
            throw new Error('Course not found');
        }

        res.status(200).json(updatedCourse);

    }catch(error){
        res.status(400).json({message: error.message})
    }
}

const DeleteCourse = async (req, res) => {
    try{
        const {courseId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(courseId)){
            throw new Error('Invalid courseId');
        }

        const deleteCourse = await Course.findByIdAndDelete(courseId);

        if(!deleteCourse){
            throw new Error('Course not found');    
        }

        res.status(200).json({message: 'Course deleted successfully'});


    }catch(error){
        res.status(400).json({message: error.message})
    }
}

module.exports = {
    GetCourses,
    CreateCourse,
    UpdateCourse,
    DeleteCourse
}