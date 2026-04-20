const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

const generateStudentId = async () => {
  const students = await Student.find({ studentId: { $regex: /^STU\d+$/ } })
    .select('studentId')
    .lean();

  let maxNumber = 0;

  for (const student of students) {
    const match = String(student.studentId || '').match(/^STU(\d+)$/);
    if (!match) continue;

    const number = Number(match[1]);
    if (Number.isFinite(number) && number > maxNumber) {
      maxNumber = number;
    }
  }

  return `STU${String(maxNumber + 1).padStart(3, '0')}`;
};



 //Create Student
 
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      gender,
      phoneNumber,
      email,
      idType,
      idNumber,
      address,
      fatherName,
      fatherPhoneNumber
    } = req.body;

    if (!name || !gender || !phoneNumber) {
      return res.status(400).json({
        message: 'Name and Phone Number are required'
      });
    }

    let studentId = req.body.studentId;
    if (!studentId) {
      studentId = await generateStudentId();
    } else {
      const exists = await Student.findOne({ studentId });
      if (exists) {
        return res.status(400).json({
          message: 'Student with this ID already exists'
        });
      }
    }

    const student = await Student.create({
      studentId,
      name,
      phoneNumber,
      gender,
      email,
      idType,
      idNumber,
      address,
      fatherName,
      fatherPhoneNumber
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Students (exclude soft deleted)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 //Get Student By ID
 
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.isDeleted) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 //Update Student
 
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 //Soft Delete Student

exports.softDeleteStudent = async (req, res) => {
  try {
    // 1️⃣ Student inactive
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2️⃣ Find active bookings
    const bookings = await Booking.find({
      studentId: student._id,
      status: 'booked'
    });

    for (const booking of bookings) {
      if (booking.seatId) {
        // 3️⃣ Free the seat
        await Seat.findByIdAndUpdate(booking.seatId, {
          status: 'available'
        });
      }

      // 4️⃣ Cancel payment if present
      if (booking.paymentId) {
        await booking.populate('paymentId');
        if (booking.paymentId) {
          booking.paymentId.status = 'cancelled';
          await booking.paymentId.save();
        }
      }

      // 5️⃣ Cancel booking
      booking.status = 'cancelled';
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Student deleted and seat released'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



 // Permanent Delete Student
 
exports.permanentDeleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Total Active Students
 * (isDeleted = false)
 */
exports.getTotalActiveStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments({ isDeleted: false });

    res.json({
      success: true,
      totalActiveStudents: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 //Total Inactive Students (Soft Deleted)
 
 
exports.getTotalInactiveStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments({ isDeleted: true });

    res.json({
      success: true,
      totalInactiveStudents: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 //Get All Inactive Students details
 
exports.getInactiveStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: true })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      total: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// REACTIVATE STUDENT
exports.reactivateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student reactivated',
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
