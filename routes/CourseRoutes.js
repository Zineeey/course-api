const express = require('express');
const router = express.Router();
const {GetCourses, CreateCourse, UpdateCourse, DeleteCourse, EnrollStudent, RemoveEnrolledStudent} = require('../controller/CourseController');
const requireAuth = require('../middleware/RequireAuth');


router.use(requireAuth);
router.get('/', GetCourses);


router.post('/create', CreateCourse)
router.post('/update/:courseId', UpdateCourse)
router.post('/enroll-student/:courseId', EnrollStudent)
router.post('/remove-enrolled-student/:courseId', RemoveEnrolledStudent)


router.delete('/delete/:courseId', DeleteCourse)



module.exports = router;