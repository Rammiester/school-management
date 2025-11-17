const mongoose = require("mongoose");
require("dotenv").config();

const Earning = require("../models/Earning");
const User = require("../models/User"); // Adjust path if needed

const seedFinanceData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    console.log("✅ Connected to MongoDB for seeding");

    // Get a user for requestedBy
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log(
        "⚠️  No admin user found. Please create a user first or update the requestedBy field."
      );
      process.exit(1);
    }

    // OPTIONAL: Clear existing data
    // await Earning.deleteMany({});
    // console.log("🗑️  Cleared existing finance data");

    // ==================== JULY 2024 ====================
    const julyRevenue = [
      {
        date: new Date("2024-07-05"),
        month: "July 2024",
        earnings: 30000,
        expenses: 0,
        description: "Q3 school fee collected",
        type: "revenue",
        requestType: "school fee",
        name: "Q3 School Fee Collection",
        time: "10:00 AM",
        modeOfPayment: "upi",
        feePeriod: "Q3 2024",
        studentUniqueId: "STU2024011",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-07-05"),
        reviewNotes: "Regular fee payment approved",
      },
      {
        date: new Date("2024-07-10"),
        month: "July 2024",
        earnings: 18000,
        expenses: 0,
        description: "Summer hostel fee",
        type: "revenue",
        requestType: "hostel fee",
        name: "Summer Term Hostel Fee",
        time: "11:30 AM",
        modeOfPayment: "bank transfer",
        feePeriod: "Summer 2024",
        studentUniqueId: "STU2024012",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-07-10"),
      },
      {
        date: new Date("2024-07-15"),
        month: "July 2024",
        earnings: 12000,
        expenses: 0,
        description: "Sports uniform fee",
        type: "revenue",
        requestType: "uniform fee",
        name: "Sports Uniform Fee",
        time: "02:00 PM",
        modeOfPayment: "cash",
        feePeriod: "2024",
        studentUniqueId: "STU2024013",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-07-20"),
        month: "July 2024",
        earnings: 75000,
        expenses: 0,
        description: "Alumni donation for library",
        type: "revenue",
        requestType: "donation",
        name: "Alumni Association Donation",
        time: "04:00 PM",
        modeOfPayment: "cheque",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-07-20"),
        reviewNotes: "Donation for library expansion",
      },
      {
        date: new Date("2024-07-25"),
        month: "July 2024",
        earnings: 5000,
        expenses: 0,
        description: "Activity and lab fees",
        type: "revenue",
        requestType: "other fees",
        name: "Lab & Activity Fees",
        time: "01:30 PM",
        modeOfPayment: "upi",
        feePeriod: "July 2024",
        studentUniqueId: "STU2024014",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    const julyExpenses = [
      {
        date: new Date("2024-07-01"),
        month: "July 2024",
        earnings: 0,
        expenses: 50000,
        description: "July teaching staff salaries",
        type: "expense",
        requestType: "salary",
        name: "July Staff Salaries",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-07-01"),
        reviewNotes: "Monthly salary payment",
      },
      {
        date: new Date("2024-07-08"),
        month: "July 2024",
        earnings: 0,
        expenses: 6500,
        description: "Bus maintenance and fuel",
        type: "expense",
        requestType: "transport",
        name: "Transport Expenses",
        time: "03:00 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-07-08"),
      },
      {
        date: new Date("2024-07-12"),
        month: "July 2024",
        earnings: 0,
        expenses: 15000,
        description: "Canteen supplies for July",
        type: "expense",
        requestType: "food",
        name: "Food Supplies",
        time: "10:30 AM",
        modeOfPayment: "upi",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-07-18"),
        month: "July 2024",
        earnings: 0,
        expenses: 4000,
        description: "Books and stationary supplies",
        type: "expense",
        requestType: "stationary",
        name: "Stationary Purchase",
        time: "11:45 AM",
        modeOfPayment: "card",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-07-22"),
        month: "July 2024",
        earnings: 0,
        expenses: 7000,
        description: "Cleaning and sanitation supplies",
        type: "expense",
        requestType: "housekeeping",
        name: "Housekeeping Supplies",
        time: "02:15 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-07-28"),
        month: "July 2024",
        earnings: 0,
        expenses: 10000,
        description: "Office equipment and furniture",
        type: "expense",
        requestType: "admin office",
        name: "Office Equipment",
        time: "04:30 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    // ==================== AUGUST 2024 ====================
    const augustRevenue = [
      {
        date: new Date("2024-08-02"),
        month: "August 2024",
        earnings: 35000,
        expenses: 0,
        description: "School fee for new term",
        type: "revenue",
        requestType: "school fee",
        name: "New Term Fee Collection",
        time: "09:30 AM",
        modeOfPayment: "bank transfer",
        feePeriod: "Q3 2024",
        studentUniqueId: "STU2024021",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-08-02"),
      },
      {
        date: new Date("2024-08-08"),
        month: "August 2024",
        earnings: 20000,
        expenses: 0,
        description: "Hostel accommodation fee",
        type: "revenue",
        requestType: "hostel fee",
        name: "August Hostel Fee",
        time: "01:00 PM",
        modeOfPayment: "upi",
        feePeriod: "August 2024",
        studentUniqueId: "STU2024022",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-12"),
        month: "August 2024",
        earnings: 150000,
        expenses: 0,
        description: "Government infrastructure grant",
        type: "revenue",
        requestType: "grant",
        name: "Infrastructure Development Grant",
        time: "10:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-08-12"),
        reviewNotes: "Grant for building renovation",
      },
      {
        date: new Date("2024-08-18"),
        month: "August 2024",
        earnings: 8500,
        expenses: 0,
        description: "Exam and registration fees",
        type: "revenue",
        requestType: "other fees",
        name: "Exam Fees",
        time: "03:30 PM",
        modeOfPayment: "card",
        feePeriod: "August 2024",
        studentUniqueId: "STU2024023",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-25"),
        month: "August 2024",
        earnings: 25000,
        expenses: 0,
        description: "Corporate CSR donation",
        type: "revenue",
        requestType: "donation",
        name: "XYZ Corp CSR Initiative",
        time: "11:00 AM",
        modeOfPayment: "cheque",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-08-25"),
      },
    ];

    const augustExpenses = [
      {
        date: new Date("2024-08-01"),
        month: "August 2024",
        earnings: 0,
        expenses: 52000,
        description: "August teaching staff salaries",
        type: "expense",
        requestType: "salary",
        name: "August Staff Salaries",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-08-01"),
      },
      {
        date: new Date("2024-08-05"),
        month: "August 2024",
        earnings: 0,
        expenses: 8000,
        description: "Transport vehicle servicing",
        type: "expense",
        requestType: "transport",
        name: "Vehicle Servicing",
        time: "02:00 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-10"),
        month: "August 2024",
        earnings: 0,
        expenses: 18000,
        description: "Canteen supplies and groceries",
        type: "expense",
        requestType: "food",
        name: "Monthly Food Supplies",
        time: "11:00 AM",
        modeOfPayment: "upi",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-08-10"),
      },
      {
        date: new Date("2024-08-15"),
        month: "August 2024",
        earnings: 0,
        expenses: 5500,
        description: "School supplies and books",
        type: "expense",
        requestType: "stationary",
        name: "Stationary & Books",
        time: "10:30 AM",
        modeOfPayment: "card",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-20"),
        month: "August 2024",
        earnings: 0,
        expenses: 9000,
        description: "Cleaning and maintenance services",
        type: "expense",
        requestType: "housekeeping",
        name: "Housekeeping Services",
        time: "03:45 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-22"),
        month: "August 2024",
        earnings: 0,
        expenses: 12000,
        description: "Office software and admin tools",
        type: "expense",
        requestType: "admin office",
        name: "Software Licenses",
        time: "01:15 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-08-28"),
        month: "August 2024",
        earnings: 0,
        expenses: 30000,
        description: "Electrical work and repairs",
        type: "expense",
        requestType: "other",
        name: "Electrical Maintenance",
        time: "04:00 PM",
        modeOfPayment: "cheque",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    // ==================== SEPTEMBER 2024 ====================
    const septemberRevenue = [
      {
        date: new Date("2024-09-03"),
        month: "September 2024",
        earnings: 40000,
        expenses: 0,
        description: "Quarterly school fee",
        type: "revenue",
        requestType: "school fee",
        name: "Q3 Fee Collection",
        time: "10:30 AM",
        modeOfPayment: "bank transfer",
        feePeriod: "Q3 2024",
        studentUniqueId: "STU2024031",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-09-03"),
      },
      {
        date: new Date("2024-09-09"),
        month: "September 2024",
        earnings: 22000,
        expenses: 0,
        description: "Hostel fee for autumn term",
        type: "revenue",
        requestType: "hostel fee",
        name: "Autumn Hostel Fee",
        time: "02:00 PM",
        modeOfPayment: "upi",
        feePeriod: "Autumn 2024",
        studentUniqueId: "STU2024032",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-14"),
        month: "September 2024",
        earnings: 9500,
        expenses: 0,
        description: "Winter uniform fee",
        type: "revenue",
        requestType: "uniform fee",
        name: "Winter Uniform Fee",
        time: "11:00 AM",
        modeOfPayment: "card",
        feePeriod: "2024",
        studentUniqueId: "STU2024033",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-20"),
        month: "September 2024",
        earnings: 6000,
        expenses: 0,
        description: "Library and computer lab fees",
        type: "revenue",
        requestType: "other fees",
        name: "Library & Lab Fees",
        time: "03:15 PM",
        modeOfPayment: "upi",
        feePeriod: "September 2024",
        studentUniqueId: "STU2024034",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-26"),
        month: "September 2024",
        earnings: 100000,
        expenses: 0,
        description: "State education development grant",
        type: "revenue",
        requestType: "grant",
        name: "Education Development Grant",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-09-26"),
        reviewNotes: "Government grant approved",
      },
    ];

    const septemberExpenses = [
      {
        date: new Date("2024-09-01"),
        month: "September 2024",
        earnings: 0,
        expenses: 53000,
        description: "September staff salaries",
        type: "expense",
        requestType: "salary",
        name: "September Staff Salaries",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-09-01"),
      },
      {
        date: new Date("2024-09-06"),
        month: "September 2024",
        earnings: 0,
        expenses: 7200,
        description: "Transport fuel and minor repairs",
        type: "expense",
        requestType: "transport",
        name: "Transport Maintenance",
        time: "01:30 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-11"),
        month: "September 2024",
        earnings: 0,
        expenses: 16500,
        description: "Canteen groceries and supplies",
        type: "expense",
        requestType: "food",
        name: "Food Supplies",
        time: "10:00 AM",
        modeOfPayment: "upi",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-17"),
        month: "September 2024",
        earnings: 0,
        expenses: 4800,
        description: "Textbooks and teaching materials",
        type: "expense",
        requestType: "stationary",
        name: "Teaching Materials",
        time: "02:45 PM",
        modeOfPayment: "card",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-23"),
        month: "September 2024",
        earnings: 0,
        expenses: 8500,
        description: "Cleaning services and supplies",
        type: "expense",
        requestType: "housekeeping",
        name: "Housekeeping Services",
        time: "11:30 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-09-28"),
        month: "September 2024",
        earnings: 0,
        expenses: 15000,
        description: "Computer lab equipment upgrade",
        type: "expense",
        requestType: "admin office",
        name: "IT Equipment",
        time: "04:00 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    // ==================== OCTOBER 2024 ====================
    const octoberRevenue = [
      {
        date: new Date("2024-10-04"),
        month: "October 2024",
        earnings: 42000,
        expenses: 0,
        description: "Mid-term school fee",
        type: "revenue",
        requestType: "school fee",
        name: "Mid-Term Fee Collection",
        time: "10:00 AM",
        modeOfPayment: "upi",
        feePeriod: "Q4 2024",
        studentUniqueId: "STU2024041",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-10-04"),
      },
      {
        date: new Date("2024-10-10"),
        month: "October 2024",
        earnings: 19000,
        expenses: 0,
        description: "October hostel charges",
        type: "revenue",
        requestType: "hostel fee",
        name: "October Hostel Fee",
        time: "01:45 PM",
        modeOfPayment: "bank transfer",
        feePeriod: "October 2024",
        studentUniqueId: "STU2024042",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-15"),
        month: "October 2024",
        earnings: 50000,
        expenses: 0,
        description: "Local business donation",
        type: "revenue",
        requestType: "donation",
        name: "Community Business Donation",
        time: "03:00 PM",
        modeOfPayment: "cheque",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-10-15"),
      },
      {
        date: new Date("2024-10-21"),
        month: "October 2024",
        earnings: 7500,
        expenses: 0,
        description: "Sports and cultural fees",
        type: "revenue",
        requestType: "other fees",
        name: "Sports & Cultural Fees",
        time: "11:30 AM",
        modeOfPayment: "card",
        feePeriod: "October 2024",
        studentUniqueId: "STU2024043",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-28"),
        month: "October 2024",
        earnings: 10000,
        expenses: 0,
        description: "Annual day event fees",
        type: "revenue",
        requestType: "other fees",
        name: "Annual Day Fees",
        time: "09:30 AM",
        modeOfPayment: "upi",
        feePeriod: "October 2024",
        studentUniqueId: "STU2024044",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    const octoberExpenses = [
      {
        date: new Date("2024-10-01"),
        month: "October 2024",
        earnings: 0,
        expenses: 54000,
        description: "October staff salaries",
        type: "expense",
        requestType: "salary",
        name: "October Staff Salaries",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-10-01"),
      },
      {
        date: new Date("2024-10-07"),
        month: "October 2024",
        earnings: 0,
        expenses: 6800,
        description: "Bus fuel and maintenance",
        type: "expense",
        requestType: "transport",
        name: "Transport Expenses",
        time: "02:30 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-12"),
        month: "October 2024",
        earnings: 0,
        expenses: 17000,
        description: "Canteen monthly supplies",
        type: "expense",
        requestType: "food",
        name: "Food Supplies",
        time: "11:00 AM",
        modeOfPayment: "upi",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-16"),
        month: "October 2024",
        earnings: 0,
        expenses: 5200,
        description: "Office supplies and stationery",
        type: "expense",
        requestType: "stationary",
        name: "Office Supplies",
        time: "03:15 PM",
        modeOfPayment: "card",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-22"),
        month: "October 2024",
        earnings: 0,
        expenses: 9500,
        description: "Deep cleaning and sanitation",
        type: "expense",
        requestType: "housekeeping",
        name: "Deep Cleaning Services",
        time: "10:30 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-25"),
        month: "October 2024",
        earnings: 0,
        expenses: 20000,
        description: "Annual day event arrangements",
        type: "expense",
        requestType: "other",
        name: "Annual Day Event",
        time: "01:00 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-10-30"),
        month: "October 2024",
        earnings: 0,
        expenses: 11000,
        description: "Network and system maintenance",
        type: "expense",
        requestType: "admin office",
        name: "IT Maintenance",
        time: "04:30 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    // ==================== NOVEMBER 2024 ====================
    const novemberRevenue = [
      {
        date: new Date("2024-11-05"),
        month: "November 2024",
        earnings: 38000,
        expenses: 0,
        description: "November term fee",
        type: "revenue",
        requestType: "school fee",
        name: "November Fee Collection",
        time: "09:45 AM",
        modeOfPayment: "bank transfer",
        feePeriod: "Q4 2024",
        studentUniqueId: "STU2024051",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-11-05"),
      },
      {
        date: new Date("2024-11-11"),
        month: "November 2024",
        earnings: 21000,
        expenses: 0,
        description: "November hostel fee",
        type: "revenue",
        requestType: "hostel fee",
        name: "November Hostel Fee",
        time: "02:30 PM",
        modeOfPayment: "upi",
        feePeriod: "November 2024",
        studentUniqueId: "STU2024052",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-16"),
        month: "November 2024",
        earnings: 120000,
        expenses: 0,
        description: "Year-end government grant",
        type: "revenue",
        requestType: "grant",
        name: "Year-End Education Grant",
        time: "10:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-11-16"),
        reviewNotes: "Annual grant disbursement",
      },
      {
        date: new Date("2024-11-20"),
        month: "November 2024",
        earnings: 60000,
        expenses: 0,
        description: "Parent association fundraiser",
        type: "revenue",
        requestType: "donation",
        name: "Parent Fundraiser Donation",
        time: "04:00 PM",
        modeOfPayment: "cheque",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-11-20"),
      },
      {
        date: new Date("2024-11-25"),
        month: "November 2024",
        earnings: 8000,
        expenses: 0,
        description: "Final exam registration fees",
        type: "revenue",
        requestType: "other fees",
        name: "Final Exam Fees",
        time: "11:15 AM",
        modeOfPayment: "upi",
        feePeriod: "November 2024",
        studentUniqueId: "STU2024053",
        status: "approved",
        requestedBy: adminUser._id,
      },
    ];

    const novemberExpenses = [
      {
        date: new Date("2024-11-01"),
        month: "November 2024",
        earnings: 0,
        expenses: 55000,
        description: "November staff salaries",
        type: "expense",
        requestType: "salary",
        name: "November Staff Salaries",
        time: "09:00 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
        reviewedBy: adminUser._id,
        reviewedAt: new Date("2024-11-01"),
      },
      {
        date: new Date("2024-11-06"),
        month: "November 2024",
        earnings: 0,
        expenses: 7500,
        description: "Transport vehicle repairs",
        type: "expense",
        requestType: "transport",
        name: "Vehicle Repairs",
        time: "01:00 PM",
        modeOfPayment: "cash",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-10"),
        month: "November 2024",
        earnings: 0,
        expenses: 18500,
        description: "Canteen supplies and groceries",
        type: "expense",
        requestType: "food",
        name: "Monthly Food Supplies",
        time: "10:30 AM",
        modeOfPayment: "upi",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-14"),
        month: "November 2024",
        earnings: 0,
        expenses: 6000,
        description: "Exam papers and stationery",
        type: "expense",
        requestType: "stationary",
        name: "Exam Materials",
        time: "02:00 PM",
        modeOfPayment: "card",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-19"),
        month: "November 2024",
        earnings: 0,
        expenses: 8800,
        description: "Monthly cleaning services",
        type: "expense",
        requestType: "housekeeping",
        name: "Housekeeping Services",
        time: "11:45 AM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-23"),
        month: "November 2024",
        earnings: 0,
        expenses: 13500,
        description: "Admin office upgrades",
        type: "expense",
        requestType: "admin office",
        name: "Office Upgrades",
        time: "03:30 PM",
        modeOfPayment: "bank transfer",
        status: "approved",
        requestedBy: adminUser._id,
      },
      {
        date: new Date("2024-11-27"),
        month: "November 2024",
        earnings: 0,
        expenses: 25000,
        description: "Building winterization and repairs",
        type: "expense",
        requestType: "other",
        name: "Winter Preparation",
        time: "09:30 AM",
        modeOfPayment: "cheque",
        status: "pending",
        requestedBy: adminUser._id,
      },
    ];

    // ==================== COMBINE ALL DATA ====================
    const allRevenue = [
      ...julyRevenue,
      ...augustRevenue,
      ...septemberRevenue,
      ...octoberRevenue,
      ...novemberRevenue,
    ];

    const allExpenses = [
      ...julyExpenses,
      ...augustExpenses,
      ...septemberExpenses,
      ...octoberExpenses,
      ...novemberExpenses,
    ];

    // ==================== INSERT DATA ====================
    const insertedRevenue = await Earning.insertMany(allRevenue);
    console.log(`✅ Seeded ${insertedRevenue.length} revenue records`);

    const insertedExpenses = await Earning.insertMany(allExpenses);
    console.log(`✅ Seeded ${insertedExpenses.length} expense records`);

    // ==================== SUMMARY ====================
    const calculateTotal = (data, field) =>
      data.reduce((sum, item) => sum + item[field], 0);

    const julyRevenueTotal = calculateTotal(julyRevenue, "earnings");
    const julyExpensesTotal = calculateTotal(julyExpenses, "expenses");
    const augustRevenueTotal = calculateTotal(augustRevenue, "earnings");
    const augustExpensesTotal = calculateTotal(augustExpenses, "expenses");
    const septemberRevenueTotal = calculateTotal(septemberRevenue, "earnings");
    const septemberExpensesTotal = calculateTotal(
      septemberExpenses,
      "expenses"
    );
    const octoberRevenueTotal = calculateTotal(octoberRevenue, "earnings");
    const octoberExpensesTotal = calculateTotal(octoberExpenses, "expenses");
    const novemberRevenueTotal = calculateTotal(novemberRevenue, "earnings");
    const novemberExpensesTotal = calculateTotal(novemberExpenses, "expenses");

    const totalRevenue = calculateTotal(allRevenue, "earnings");
    const totalExpenses = calculateTotal(allExpenses, "expenses");

    console.log("\n📊 Seeding Summary (July - November 2024):");
    console.log("\n   JULY 2024:");
    console.log(
      `   Revenue: ₹${julyRevenueTotal.toLocaleString()} (${
        julyRevenue.length
      } records)`
    );
    console.log(
      `   Expenses: ₹${julyExpensesTotal.toLocaleString()} (${
        julyExpenses.length
      } records)`
    );
    console.log(
      `   Net: ₹${(julyRevenueTotal - julyExpensesTotal).toLocaleString()}`
    );

    console.log("\n   AUGUST 2024:");
    console.log(
      `   Revenue: ₹${augustRevenueTotal.toLocaleString()} (${
        augustRevenue.length
      } records)`
    );
    console.log(
      `   Expenses: ₹${augustExpensesTotal.toLocaleString()} (${
        augustExpenses.length
      } records)`
    );
    console.log(
      `   Net: ₹${(augustRevenueTotal - augustExpensesTotal).toLocaleString()}`
    );

    console.log("\n   SEPTEMBER 2024:");
    console.log(
      `   Revenue: ₹${septemberRevenueTotal.toLocaleString()} (${
        septemberRevenue.length
      } records)`
    );
    console.log(
      `   Expenses: ₹${septemberExpensesTotal.toLocaleString()} (${
        septemberExpenses.length
      } records)`
    );
    console.log(
      `   Net: ₹${(
        septemberRevenueTotal - septemberExpensesTotal
      ).toLocaleString()}`
    );

    console.log("\n   OCTOBER 2024:");
    console.log(
      `   Revenue: ₹${octoberRevenueTotal.toLocaleString()} (${
        octoberRevenue.length
      } records)`
    );
    console.log(
      `   Expenses: ₹${octoberExpensesTotal.toLocaleString()} (${
        octoberExpenses.length
      } records)`
    );
    console.log(
      `   Net: ₹${(
        octoberRevenueTotal - octoberExpensesTotal
      ).toLocaleString()}`
    );

    console.log("\n   NOVEMBER 2024:");
    console.log(
      `   Revenue: ₹${novemberRevenueTotal.toLocaleString()} (${
        novemberRevenue.length
      } records)`
    );
    console.log(
      `   Expenses: ₹${novemberExpensesTotal.toLocaleString()} (${
        novemberExpenses.length
      } records)`
    );
    console.log(
      `   Net: ₹${(
        novemberRevenueTotal - novemberExpensesTotal
      ).toLocaleString()}`
    );

    console.log("\n   ═══════════════════════════════");
    console.log("   TOTAL (JULY - NOVEMBER 2024):");
    console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`   Total Expenses: ₹${totalExpenses.toLocaleString()}`);
    console.log(
      `   Net Profit: ₹${(totalRevenue - totalExpenses).toLocaleString()}`
    );
    console.log(`   Total Records: ${allRevenue.length + allExpenses.length}`);

    console.log("\n🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedFinanceData();
