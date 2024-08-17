const express = require('express');
const router = express.Router();
const {GetCourses, CreateCourse, UpdateCourse, DeleteCourse} = require('../controller/CourseController');
const requireAuth = require('../middleware/RequireAuth');


router.use(requireAuth);
router.get('/', GetCourses);
router.post('/create', CreateCourse)
router.post('/update/:courseId', UpdateCourse)
router.delete('/delete/:courseId', DeleteCourse
)



module.exports = router;