const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Billing = require('../models/Billing');
const Student = require('../models/Student');
const BillingTemplate = require('../models/BillingTemplate');
const Earning = require('../models/Earning');
const ClassPayment = require('../models/ClassPayment');
const Department = require('../models/Department');
const { sendSms, sendWhatsAppMessage } = require('../utils/notifications');
const { adminMiddleware, chairmanMiddleware } = require('../middleware/jwt');
const nodemailer = require('nodemailer');
require("dotenv").config();


// Create transporter for sending emails
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    transporter = null;
  }
}

// Function to send email to student
async function sendEmailToStudent(student, bill, template) {
  try {
    // Check if transporter is configured
    if (!transporter) {
      console.log('Email transporter not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
      return false;
    }

    // Check if student has email address
    if (!student.email) {
      console.log(`No email address found for student ${student.name} (${student.uniqueId})`);
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `Billing Information - ${template?.name || 'Fee Bill'}`,
      html: `
        <h2>Dear ${student.name},</h2>
        <p>You have received a new billing notification from the school.</p>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Billing Details:</h3>
          <p><strong>Bill ID:</strong> ${bill._id}</p>
          // <p><strong>Template:</strong> ${template?.name || 'N/A'}</p>
          <p><strong>Description:</strong> ${bill.description}</p>
          <p><strong>Amount:</strong> ₹${bill.amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${bill.status}</p>
        </div>
        <p>Please login to your student portal to view and manage your billing information.</p>
        <p>If you have any questions, please contact the school administration.</p>
        <br/>
        <p>Best regards,<br/>
        School Administration</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${student.email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error);
    return false;
 }
}

const adminOrChairmanMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role === 'admin' || decoded.role === 'chairman') {
      next();
    } else {
      return res.status(403).json({ error: 'Admin or Chairman access required' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/generate-from-template', adminOrChairmanMiddleware, async (req, res) => {
  try {
    const {
      generationType,
      months,
      generatedBy,
      templateId,
      classFilter,
      description,
      items,
      studentIds,
      departmentFilter
    } = req.body;

    // Set default months to 1 if not provided or invalid
    const parsedMonths = months ? parseInt(months) : 1;
    const finalMonths = parsedMonths > 0 ? parsedMonths : 1;

    if (!generationType) {
      return res.status(400).json({
        error: 'Missing required field: generationType is required'
      });
    }

    if (generationType === 'class') {
      if (!templateId || !classFilter || !description) {
        return res.status(400).json({
          error: 'Missing required fields for class generation: templateId, classFilter, and description are required'
        });
      }
    } else if (generationType === 'department') {
      if (!templateId || !description) {
        return res.status(400).json({
          error: 'Missing required fields for department generation: templateId and description are required'
        });
      }
    } else if (generationType === 'student') {
      if (!templateId || !description || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          error: 'Missing required fields for student generation: templateId, description, and studentIds array are required'
        });
      }
    } else if (generationType === 'NonId') {
      // Handle NonId generation type - can work with either studentIds array or classFilter
      if (!templateId || !description) {
        return res.status(400).json({
          error: 'Missing required fields for NonId generation: templateId and description are required'
        });
      }
      // Either studentIds array or classFilter must be provided
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        if (!classFilter) {
          return res.status(400).json({
            error: 'Missing required field for NonId generation: either studentIds array or classFilter is required'
          });
        }
      }
    } else {
      return res.status(400).json({
        error: 'Invalid generationType. Must be one of: class, department, student, NonId'
      });
    }

    if (generationType === 'class') {
      const { className } = classFilter;

      console.log(`Searching for students with grade: ${className}`);
      const students = await Student.find({ grade: className });
      console.log(`Found ${students.length} students`);

      if (students.length === 0) {
        return res.status(404).json({
          error: `No students found for grade ${className}`
        });
      }

      const template = await BillingTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          error: 'Billing template not found'
        });
      }

      const bills = [];
      const earnings = [];

      const classPaymentData = await getClassPaymentData(className);

      for (const student of students) {
        const classPaymentDataForStudent = await getClassPaymentData(student.grade || 'General');

        for (let month = 0; month < finalMonths; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + month);

          let billItems = [];
          if (items && items.length > 0) {
            billItems = items;
          } else {
            const feeTypes = extractFeeTypes(description);
            billItems = await Promise.all(feeTypes.map(async (feeType) => {
              let department = feeType.replace('Pay', '');

              department = mapDepartmentName(department);

              const isValidDepartment = await validateDepartment(department);

              const amount = classPaymentDataForStudent[department] || 0;

              return {
                name: feeType,
                amount: amount,
                description: `${feeType} charges for ${student.name} (${student.admissionId})`,
                department: department,
                isValid: isValidDepartment
              };
            }));
          }

          let billDescription = description
            .replace(/@Student ID:@Id/g, student.admissionId)
            .replace(/@Class/g, student.grade || className)
            .replace(/@Department/g, student.department || 'General');
          const departmentNames = await getAvailableDepartmentsForClass(student.grade || className);

          billDescription = billDescription.replace(/@(\w+)/g, (match, variable) => {
            if (template && template.feeTypeDescriptions && template.feeTypeDescriptions[variable]) {
              return template.feeTypeDescriptions[variable];
            }

            const departmentKey = variable.replace('Pay', '');
            const mappedDepartment = mapDepartmentName(departmentKey);
            if (departmentNames.includes(mappedDepartment)) {
              return `${mappedDepartment} Fee`;
            }
            switch (variable) {
              case 'TotalPay':
                return 'Total Payment Amount';
              default:
                return match;
            }
          });

          const bill = new Billing({
            student: student._id,
            template: templateId,
            department: student.department || 'General',
            items: billItems,
            amount: calculateTotalAmount(billItems),
            dueDate: dueDate,
            description: billDescription,
            generatedBy: req.user.id,
            status: 'pending',
            metadata: {
              generatedFrom: 'template',
              className: student.grade || className,
              month: month + 1,
              totalMonths: finalMonths,
              studentId: student._id,
              studentUniqueId: student.uniqueId
            }
          });

          bills.push(bill);
        }
      }

      const savedBills = await Billing.insertMany(bills);

      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const earning = new Earning({
          date: new Date(),
          month: new Date().toLocaleString('default', { month: 'long' }),
          earnings: bill.amount,
          expenses: 0,
          description: `Fee collection for ${student.name} (${student.admissionId})`,
          studentUniqueId: student.admissionId,
          status: 'approved',
          type: 'revenue',
          requestType: 'school fee',
          name: student.name,
          time: new Date().toLocaleTimeString(),
          modeOfPayment: 'cash',
          requestedBy: req.user.id
        });
        earnings.push(earning);
      }

      await Earning.insertMany(earnings);

      // Send emails to students after bills are generated
      const emailResults = [];
      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const template = await BillingTemplate.findById(templateId);
        const emailSent = await sendEmailToStudent(student, bill, template);
        emailResults.push({
          studentId: student.uniqueId,
          email: student.email,
          emailSent: emailSent
        });
      }

      const populatedBills = await Billing.find({
        _id: { $in: savedBills.map(b => b._id) }
      })
        .populate('student', 'name admissionId uniqueId rollNumber grade department')
        .populate('template', 'name');

      let totalAmount = 0;
      bills.forEach(bill => {
        totalAmount += calculateTotalAmount(bill.items);
      });

      return res.json({
        success: true,
        message: `Successfully generated ${savedBills.length} bills for ${students.length} students in class ${className} over ${finalMonths} month${finalMonths > 1 ? 's' : ''}`,
        summary: {
          totalBills: savedBills.length,
          totalStudents: students.length,
          totalAmount: totalAmount,
          className: className,
          months: finalMonths,
          emailsSent: emailResults.filter(result => result.emailSent).length,
          emailsFailed: emailResults.filter(result => !result.emailSent).length
        },
        bills: populatedBills,
        emailResults: emailResults
      });

    } else if (generationType === 'department') {
      const { departmentFilter } = req.body;

      if (!departmentFilter) {
        return res.status(400).json({
          error: 'Missing required field: departmentFilter is required for department generation'
        });
      }

      const { departments, allDepartments } = departmentFilter;

      let query = {};

      if (!allDepartments && departments && departments.length > 0) {
        query.department = { $in: departments };
      }

      console.log(`Searching for students with department filter:`, query);
      const students = await Student.find(query);
      console.log(`Found ${students.length} students`);

      if (students.length === 0) {
        return res.status(404).json({
          error: `No students found for the specified department filter`
        });
      }

      const template = await BillingTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          error: 'Billing template not found'
        });
      }

      const bills = [];
      const earnings = [];

      for (const student of students) {
        const classPaymentData = await getClassPaymentData(student.grade || 'General');

        for (let month = 0; month < finalMonths; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + month);

          let billItems = [];
          if (items && items.length > 0) {
            billItems = items;
          } else {
            const feeTypes = extractFeeTypes(description);
            billItems = await Promise.all(feeTypes.map(async (feeType) => {
              let department = feeType.replace('Pay', '');

              department = mapDepartmentName(department);

              const isValidDepartment = await validateDepartment(department);

              const amount = classPaymentData[department] || 0;

              return {
                name: feeType,
                amount: amount,
                description: `${feeType} charges for ${student.name} (${student.admissionId})`,
                department: department,
                isValid: isValidDepartment
              };
            }));
          }

          let billDescription = description
            .replace(/@Student ID:@Id/g, student.admissionId)
            .replace(/@Class/g, student.grade || 'General')
            .replace(/@Department/g, student.department || 'General');

          const departmentNames = await getAvailableDepartmentsForClass(student.grade || 'General');

          billDescription = billDescription.replace(/@(\w+)/g, (match, variable) => {
            if (template && template.feeTypeDescriptions && template.feeTypeDescriptions[variable]) {
              return template.feeTypeDescriptions[variable];
            }

            const departmentKey = variable.replace('Pay', '');
            const mappedDepartment = mapDepartmentName(departmentKey);

            if (departmentNames.includes(mappedDepartment)) {
              return `${mappedDepartment} Fee`;
            }

            switch (variable) {
              case 'TotalPay':
                return 'Total Payment Amount';
              default:
                return match; 
            }
          });

          const bill = new Billing({
            student: student._id,
            template: templateId,
            department: student.department || 'General',
            items: billItems,
            amount: calculateTotalAmount(billItems),
            dueDate: dueDate,
            description: billDescription,
            generatedBy: req.user.id,
            status: 'pending',
            metadata: {
              generatedFrom: 'template',
              className: student.grade || 'General',
              month: month + 1,
              totalMonths: finalMonths,
              studentId: student._id,
              studentUniqueId: student.uniqueId,
              departmentFilter: departments || []
            }
          });

          bills.push(bill);
        }
      }

      const savedBills = await Billing.insertMany(bills);

      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const earning = new Earning({
          date: new Date(),
          month: new Date().toLocaleString('default', { month: 'long' }),
          earnings: bill.amount,
          expenses: 0,
          description: `Fee collection for ${student.name} (${student.admissionId})`,
          studentUniqueId: student.admissionId,
          status: 'approved',
          type: 'revenue',
          requestType: 'school fee',
          name: student.name,
          time: new Date().toLocaleTimeString(),
          modeOfPayment: 'cash',
          requestedBy: req.user.id
        });
        earnings.push(earning);
      }

      await Earning.insertMany(earnings);

      // Send emails to students after bills are generated
      const emailResults = [];
      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const template = await BillingTemplate.findById(templateId);
        const emailSent = await sendEmailToStudent(student, bill, template);
        emailResults.push({
          studentId: student.uniqueId,
          email: student.email,
          emailSent: emailSent
        });
      }

      const populatedBills = await Billing.find({
        _id: { $in: savedBills.map(b => b._id) }
      })
        .populate('student', 'name admissionId uniqueId rollNumber grade department')
        .populate('template', 'name');

      let totalAmount = 0;
      bills.forEach(bill => {
        totalAmount += calculateTotalAmount(bill.items);
      });

      return res.json({
        success: true,
        message: `Successfully generated ${savedBills.length} bills for ${students.length} students in departments: ${(departments || ['All']).join(', ')} over ${finalMonths} month${finalMonths > 1 ? 's' : ''}`,
        summary: {
          totalBills: savedBills.length,
          totalStudents: students.length,
          totalAmount: totalAmount,
          departments: departments || ['All'],
          months: finalMonths,
          emailsSent: emailResults.filter(result => result.emailSent).length,
          emailsFailed: emailResults.filter(result => !result.emailSent).length
        },
        bills: populatedBills,
        emailResults: emailResults
      });
    } else if (generationType === 'student') {
      console.log(`Searching for students with IDs:`, studentIds);
      const students = await Student.find({ uniqueId: { $in: studentIds } });
      console.log(`Found ${students.length} students out of ${studentIds.length} requested`);

      if (students.length === 0) {
        return res.status(404).json({
          error: `No students found for the provided student IDs`
        });
      }

      const foundStudentIds = students.map(student => student.uniqueId);
      const missingIds = studentIds.filter(id => !foundStudentIds.includes(id));
      if (missingIds.length > 0) {
        console.warn(`Warning: Could not find students for IDs:`, missingIds);
      }

      const template = await BillingTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          error: 'Billing template not found'
        });
      }

      const bills = [];
      const earnings = [];

      for (const student of students) {
        const classPaymentData = await getClassPaymentData(student.grade || 'General');

        for (let month = 0; month < finalMonths; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + month);

          let billItems = [];
          if (items && items.length > 0) {
            billItems = items;
          } else {
            const feeTypes = extractFeeTypes(description);
            billItems = await Promise.all(feeTypes.map(async (feeType) => {
              let department = feeType.replace('Pay', '');

              department = mapDepartmentName(department);

              const isValidDepartment = await validateDepartment(department);

              const amount = classPaymentData[department] || 0;

              return {
                name: feeType,
                amount: amount,
                description: `${feeType} charges for ${student.name} (${student.uniqueId})`,
                department: department,
                isValid: isValidDepartment
              };
            }));
          }

          let billDescription = description
            .replace(/@Student ID:@Id/g, student.uniqueId)
            .replace(/@Class/g, student.grade || 'General')
            .replace(/@Department/g, student.department || 'General');
          const departmentNames = await getAvailableDepartmentsForClass(student.grade || 'General');

          billDescription = billDescription.replace(/@(\w+)/g, (match, variable) => {
            if (template && template.feeTypeDescriptions && template.feeTypeDescriptions[variable]) {
              return template.feeTypeDescriptions[variable];
            }
            const departmentKey = variable.replace('Pay', '');
            const mappedDepartment = mapDepartmentName(departmentKey);
            if (departmentNames.includes(mappedDepartment)) {
              return `${mappedDepartment} Fee`;
            }
            if (variable === 'TotalPay') {
              return calculateTotalAmount(billItems).toString();
            }

            return match;
          });

          const bill = new Billing({
            student: student._id,
            template: templateId,
            department: student.department || 'General',
            items: billItems,
            amount: calculateTotalAmount(billItems),
            dueDate: dueDate,
            description: billDescription,
            generatedBy: req.user.id,
            status: 'pending',
            metadata: {
              generatedFrom: 'template',
              className: student.grade || 'General',
              month: month + 1,
              totalMonths: finalMonths,
              studentId: student._id,
              studentUniqueId: student.uniqueId
            }
          });

          bills.push(bill);
        }
      }

      const savedBills = await Billing.insertMany(bills);

      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const earning = new Earning({
          date: new Date(),
          month: new Date().toLocaleString('default', { month: 'long' }),
          earnings: bill.amount,
          expenses: 0,
          description: `Fee collection for ${student.name} (${student.uniqueId})`,
          studentUniqueId: student.uniqueId,
          status: 'approved',
          type: 'revenue',
          requestType: 'school fee',
          name: student.name,
          time: new Date().toLocaleTimeString(),
          modeOfPayment: 'cash',
          requestedBy: req.user.id
        });
        earnings.push(earning);
      }

      await Earning.insertMany(earnings);

      // Send emails to students after bills are generated
      const emailResults = [];
      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const template = await BillingTemplate.findById(templateId);
        const emailSent = await sendEmailToStudent(student, bill, template);
        emailResults.push({
          studentId: student.uniqueId,
          email: student.email,
          emailSent: emailSent
        });
      }

      const populatedBills = await Billing.find({
        _id: { $in: savedBills.map(b => b._id) }
      })
        .populate('student', 'name uniqueId admissionId rollNumber grade department')
        .populate('template', 'name');

      let totalAmount = 0;
      bills.forEach(bill => {
        totalAmount += calculateTotalAmount(bill.items);
      });

      return res.json({
        success: true,
        message: `Successfully generated ${savedBills.length} bills for ${students.length} students (requested: ${studentIds.length}) over ${finalMonths} month${finalMonths > 1 ? 's' : ''}`,
        summary: {
          totalBills: savedBills.length,
          totalStudents: students.length,
          requestedStudents: studentIds.length,
          totalAmount: totalAmount,
          processedStudentIds: foundStudentIds,
          missingStudentIds: missingIds,
          months: finalMonths,
          emailsSent: emailResults.filter(result => result.emailSent).length,
          emailsFailed: emailResults.filter(result => !result.emailSent).length
        },
        bills: populatedBills,
        emailResults: emailResults
      });

    } else if (generationType === 'NonId') {
      let students = [];
      let foundStudentIds = [];
      let missingIds = [];

      if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
        console.log(`Searching for students with NonId:`, studentIds);
        students = await Student.find({ uniqueId: { $in: studentIds } });
        console.log(`Found ${students.length} students out of ${studentIds.length} requested`);

        if (students.length === 0) {
          return res.status(404).json({
            error: `No students found for the provided NonId values`
          });
        }

        foundStudentIds = students.map(student => student.uniqueId);
        missingIds = studentIds.filter(id => !foundStudentIds.includes(id));
        if (missingIds.length > 0) {
          console.warn(`Warning: Could not find students for NonIds:`, missingIds);
        }
      } else if (classFilter) {
        const { className, rollNumber } = classFilter;
        let query = { grade: className };

        if (rollNumber) {
          query.rollNumber = rollNumber;
        }

        console.log(`Searching for students with class filter:`, query);
        students = await Student.find(query);
        console.log(`Found ${students.length} students`);

        if (students.length === 0) {
          return res.status(404).json({
            error: `No students found for class ${className}${rollNumber ? ` and roll number ${rollNumber}` : ''}`
          });
        }

        foundStudentIds = students.map(student => student.uniqueId);
      } else {
        return res.status(400).json({
          error: 'Missing required field for NonId generation: either studentIds array or classFilter is required'
        });
      }

      const template = await BillingTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          error: 'Billing template not found'
        });
      }

      const bills = [];
      const earnings = [];

      for (const student of students) {
        const classPaymentData = await getClassPaymentData(student.grade || 'General');

        for (let month = 0; month < finalMonths; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + month);

          let billItems = [];
          if (items && items.length > 0) {
            billItems = items;
          } else {
            const feeTypes = extractFeeTypes(description);
            billItems = await Promise.all(feeTypes.map(async (feeType) => {
              let department = feeType.replace('Pay', '');

              department = mapDepartmentName(department);

              const isValidDepartment = await validateDepartment(department);

              const amount = classPaymentData[department] || 0;

              return {
                name: feeType,
                amount: amount,
                description: `${feeType} charges for ${student.name} (${student.uniqueId})`,
                department: department,
                isValid: isValidDepartment
              };
            }));
          }

          let billDescription = description
            .replace(/@Student ID:@Id/g, student.uniqueId)
            .replace(/@Class/g, student.grade || 'General')
            .replace(/@Department/g, student.department || 'General');
          const departmentNames = await getAvailableDepartmentsForClass(student.grade || 'General');

          billDescription = billDescription.replace(/@(\w+)/g, (match, variable) => {
            if (template && template.feeTypeDescriptions && template.feeTypeDescriptions[variable]) {
              return template.feeTypeDescriptions[variable];
            }
            const departmentKey = variable.replace('Pay', '');
            const mappedDepartment = mapDepartmentName(departmentKey);
            if (departmentNames.includes(mappedDepartment)) {
              return `${mappedDepartment} Fee`;
            }
            if (variable === 'TotalPay') {
              return calculateTotalAmount(billItems).toString();
            }

            return match;
          });

          const bill = new Billing({
            student: student._id,
            template: templateId,
            department: student.department || 'General',
            items: billItems,
            amount: calculateTotalAmount(billItems),
            dueDate: dueDate,
            description: billDescription,
            generatedBy: req.user.id,
            status: 'pending',
            metadata: {
              generatedFrom: 'template',
              className: student.grade || 'General',
              month: month + 1,
              totalMonths: finalMonths,
              studentId: student._id,
              studentUniqueId: student.uniqueId
            }
          });

          bills.push(bill);
        }
      }

      const savedBills = await Billing.insertMany(bills);

      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const earning = new Earning({
          date: new Date(),
          month: new Date().toLocaleString('default', { month: 'long' }),
          earnings: bill.amount,
          expenses: 0,
          description: `Fee collection for ${student.name} (${student.uniqueId})`,
          studentUniqueId: student.uniqueId,
          status: 'approved',
          type: 'revenue',
          requestType: 'school fee',
          name: student.name,
          time: new Date().toLocaleTimeString(),
          modeOfPayment: 'cash',
          requestedBy: req.user.id
        });
        earnings.push(earning);
      }

      await Earning.insertMany(earnings);

      // Send emails to students after bills are generated
      const emailResults = [];
      for (const bill of savedBills) {
        const student = await Student.findById(bill.student);
        const template = await BillingTemplate.findById(templateId);
        const emailSent = await sendEmailToStudent(student, bill, template);
        emailResults.push({
          studentId: student.uniqueId,
          email: student.email,
          emailSent: emailSent
        });
      }

      const populatedBills = await Billing.find({
        _id: { $in: savedBills.map(b => b._id) }
      })
        .populate('student', 'name uniqueId admissionId rollNumber grade department')
        .populate('template', 'name');

      let totalAmount = 0;
      bills.forEach(bill => {
        totalAmount += calculateTotalAmount(bill.items);
      });

      return res.json({
        success: true,
        message: `Successfully generated ${savedBills.length} bills for ${students.length} students using NonId${studentIds ? ` (requested: ${studentIds.length})` : ` for class ${classFilter.className}${classFilter.rollNumber ? ` and roll number ${classFilter.rollNumber}` : ''} over ${finalMonths} month${finalMonths > 1 ? 's' : ''}`}`,
        summary: {
          totalBills: savedBills.length,
          totalStudents: students.length,
          requestedStudents: studentIds ? studentIds.length : students.length,
          totalAmount: totalAmount,
          processedStudentIds: foundStudentIds,
          missingStudentIds: missingIds,
          months: finalMonths,
          emailsSent: emailResults.filter(result => result.emailSent).length,
          emailsFailed: emailResults.filter(result => !result.emailSent).length
        },
        bills: populatedBills,
        emailResults: emailResults
      });

    } else {
      return res.status(400).json({
        error: 'Unsupported generation type. Only "class", "department", "student", and "NonId" generation types are supported.'
      });
    }

  } catch (error) {
    console.error('Error generating bills from template:', error);
    return res.status(500).json({
      error: 'Failed to generate bills from template',
      details: error.message
    });
  }
});

function extractFeeTypes(description) {
  const feeTypes = [];
  const regex = /@(\w+Pay)/g;
  let match;

  while ((match = regex.exec(description)) !== null) {
    feeTypes.push(match[1]);
  }

  return feeTypes.length > 0 ? feeTypes : ['TotalPay', 'AcademicPay', 'SportPay', 'LibraryPay', 'HostalPay', 'TransportPay'];
}

async function getClassPaymentData(className) {
  try {
    let searchClassName = className;
    if (className.endsWith('th')) {
      searchClassName = className.slice(0, -2);
    }

    const classPayment = await ClassPayment.findOne({ className: searchClassName });
    if (classPayment) {
      const paymentMap = {};
      classPayment.payments.forEach(payment => {
        paymentMap[payment.department] = payment.amount;
      });
      return paymentMap;
    }
    return {};
  } catch (error) {
    console.error(`Error fetching class payment data for class ${className}:`, error);
    return {};
  }
}

function calculateTotalAmount(items) {
  if (!items || items.length === 0) {
    return 0;
  }

  let total = 0;
  items.forEach(item => {
    if (typeof item.amount === 'number') {
      total += item.amount;
    }
  });

  return total;
}

function mapDepartmentName(department) {
  const departmentMapping = {
    'Hostal': 'Hostel',
    'Total': 'Academics',
    'Academic': 'Academics',
    'Sport': 'Sports',
    'Library': 'Library',
    'Transport': 'Transportation',
    'Food': 'Food Services'
  };

  return departmentMapping[department] || department;
}

async function getAvailableDepartmentsForClass(className) {
  try {
    let searchClassName = className;
    if (className.endsWith('th')) {
      searchClassName = className.slice(0, -2);
    }

    const classPayment = await ClassPayment.findOne({ className: searchClassName });
    if (classPayment && classPayment.payments) {
      return classPayment.payments.map(payment => payment.department);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching available departments for class ${className}:`, error);
    return [];
  }
}

async function validateDepartment(departmentName) {
  try {
    const department = await Department.findOne({
      name: new RegExp(`^${departmentName}$`, 'i')
    });
    return !!department;
  } catch (error) {
    console.error(`Error validating department ${departmentName}:`, error);
    return false;
  }
}

router.get('/summary/:className', async (req, res) => {
  try {
    const { className } = req.params;
    const { months = 1 } = req.query;

    const students = await Student.find({ grade: className });

    if (students.length === 0) {
      return res.status(404).json({
        error: `No students found for grade ${className}`
      });
    }

    const classPaymentData = await getClassPaymentData(className);

    const totalStudents = students.length;
    let estimatedTotal = 0;

    if (Object.keys(classPaymentData).length > 0) {
      const totalPaymentAmount = Object.values(classPaymentData).reduce((sum, amount) => sum + amount, 0);
      estimatedTotal = totalStudents * totalPaymentAmount;
    } else {
      estimatedTotal = totalStudents * 100;
    }

    res.json({
      className,
      studentCount: totalStudents,
      months: parseInt(months),
      estimatedTotal: estimatedTotal,
      estimatedTotalPerStudent: estimatedTotal / totalStudents
    });

  } catch (error) {
    console.error('Error getting billing summary:', error);
    res.status(500).json({
      error: 'Failed to get billing summary',
      details: error.message
    });
  }
});

module.exports = router;
