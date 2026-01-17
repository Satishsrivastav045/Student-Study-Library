const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// APIs for Student Management


router.get('/count/active', studentController.getTotalActiveStudents);
router.get('/count/inactive', studentController.getTotalInactiveStudents);
router.get('/inactive/list', studentController.getInactiveStudents);
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/soft/:id', studentController.softDeleteStudent);
router.delete('/permanent/:id', studentController.permanentDeleteStudent);

module.exports = router;
