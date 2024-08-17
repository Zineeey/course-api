const Course = require('../model/CourseModel');
const User = require('../model/UserModel');
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

const EnrollStudents = async (req, res) => {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    try {
        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error('Invalid courseId');
        }

        // Ensure studentIds is an array, even if a single ID is passed
        const ids = Array.isArray(studentIds) ? studentIds : [studentIds];

        // Validate all studentIds
        for (let id of ids) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid studentId: ${id}`);
            }
        }

        // Fetch the course by courseId
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Fetch students by their IDs
        const studentsToEnroll = await User.find({
            _id: { $in: ids },
            role: 'student'
        });

        // Ensure all provided student IDs were found
        if (studentsToEnroll.length !== ids.length) {
            throw new Error('Some students not found');
        }

        // Filter out students already enrolled in the course
        const newEnrollments = studentsToEnroll.filter(student =>
            !course.enrolledStudents.includes(student._id)
        );

        if (newEnrollments.length === 0) {
            throw new Error('All students are already enrolled');
        }

        // Add students to the course
        course.enrolledStudents.push(...newEnrollments.map(student => student._id));

        // Update the course with the new enrolled students
        await course.save();

        // Add courseId to each student's enrolledSubjects
        const updatePromises = newEnrollments.map(student => {
            if (!student.enrolledSubjects.includes(courseId)) {
                student.enrolledSubjects.push(courseId);
                return student.save();
            }
        });

        // Wait for all student updates to complete
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Successfully enrolled students to course" });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const RemoveEnrolledStudents = async (req, res) => {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    try {
        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error('Invalid courseId');
        }

        // Ensure studentIds is an array, even if a single ID is passed
        const ids = Array.isArray(studentIds) ? studentIds : [studentIds];

        // Validate all studentIds
        for (let id of ids) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid studentId: ${id}`);
            }
        }

        // Fetch the course by courseId
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Fetch students by their IDs
        const studentsToRemove = await User.find({
            _id: { $in: ids },
            role: 'student'
        });

        // Ensure all provided student IDs were found
        if (studentsToRemove.length !== ids.length) {
            throw new Error('Some students not found');
        }

        // Filter out students not enrolled in the course
        const validRemovals = studentsToRemove.filter(student =>
            course.enrolledStudents.includes(student._id)
        );

        if (validRemovals.length === 0) {
            throw new Error('None of the students are enrolled in this course');
        }

        // Remove students from the course
        await Course.updateOne(
            { _id: courseId },
            { $pull: { enrolledStudents: { $in: validRemovals.map(student => student._id) } } }
        );

        // Remove courseId from each student's enrolledSubjects
        const updatePromises = validRemovals.map(student => {
            return User.updateOne(
                { _id: student._id },
                { $pull: { enrolledSubjects: courseId } }
            );
        });

        // Wait for all student updates to complete
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Successfully removed students from course" });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const GetStudentEnrolledCourses = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await User.findById(studentId)
            .populate({
                path: 'enrolledSubjects',
                select: 'courseTitle courseDescription courseUnits courseInstructor', 
            })
            .populate('enrolledSubjects.courseInstructor', [
                'fullName'])

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student.enrolledSubjects);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const AssignInstructor = async (req, res) => {
    const { courseId } = req.params;
    const { instructorId } = req.body;
    try{    
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error('Invalid courseId');
        }

        if (!mongoose.Types.ObjectId.isValid(instructorId)) {
            throw new Error('Invalid instructorId')
        }

        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        const instructor = await User.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }

        if (instructor.role !== 'instructor') {
            throw new Error('User is not an instructor');
        }

        if (course.courseInstructor.includes(instructorId)) {
            return res.status(200).json({ message: 'Instructor is already assigned to this course' });
        }

        course.courseInstructor.push(instructorId);
        await course.save();

        if (!instructor.managedCourses.includes(courseId)) { 
            instructor.managedCourses.push(courseId);
            await instructor.save();
        }

        res.status(200).json({ message: 'Instructor assigned successfully' });

    }catch(error){  
        res.status(400).json({ message: error.message })
    }
}

const UnassignInstructor = async (req, res) => {
    const { courseId } = req.params;
    const { instructorId } = req.body;

    try{
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error('Invalid courseId');
        }

        if (!mongoose.Types.ObjectId.isValid(instructorId)) {
            throw new Error('Invalid instructorId')
        }

        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        const instructor = await User.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }

        if (instructor.role !== 'instructor') {
            throw new Error('User is not an instructor');
        }

        if (!course.courseInstructor.includes(instructorId)) {
            return res.status(200).json({ message: 'Instructor is not assigned to this course' });
        }

        course.courseInstructor.pull(instructorId);
        await course.save();

        if (instructor.managedCourses.includes(courseId)) {
            instructor.managedCourses.pull(courseId);
            await instructor.save();
        }

        res.status(200).json({ message: 'Instructor unassigned successfully' });

    }catch(error){
        res.status(400).json({ message: error.message })
    }
}



module.exports = {
    GetCourses,
    CreateCourse,
    UpdateCourse,
    DeleteCourse,
    EnrollStudents,
    RemoveEnrolledStudents,
    GetStudentEnrolledCourses,
    AssignInstructor,
    UnassignInstructor
}