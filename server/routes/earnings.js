// routes/earnings.js

const express = require("express");
const Earning = require("../models/Earning");
const Student = require("../models/Student");
const upload = require("../middleware/upload"); // ADD THIS
const fs = require("fs"); // ADD THIS
const router = express.Router();
const path = require("path");


// Add a revenue/expense entry (with studentUniqueId handling)
// Add a revenue/expense entry (with studentUniqueId handling)
router.post("/", upload.array("attachments", 2), async (req, res) => {
  try {
    console.log("Received body:", req.body); // DEBUG
    console.log("Received files:", req.files); // DEBUG

    // Handle file attachments
    const attachments = req.files ? req.files.map((file) => file.path) : [];

    // Parse numeric values from FormData (they come as strings)
    const earningsValue = parseFloat(req.body.earnings) || 0;
    const expensesValue = parseFloat(req.body.expenses) || 0;

    const earningData = {
      type: req.body.type,
      requestType: req.body.requestType,
      name: req.body.name,
      date: req.body.date,
      time: req.body.time,
      month: req.body.month,
      earnings: earningsValue,
      expenses: expensesValue,
      modeOfPayment: req.body.modeOfPayment,
      description: req.body.description,
      requestedBy: req.body.requestedBy,
      feePeriod: req.body.feePeriod,
      status: "pending",
      attachments: attachments,
    };

    // Remove undefined/null values
    Object.keys(earningData).forEach((key) => {
      if (
        earningData[key] === undefined ||
        earningData[key] === null ||
        earningData[key] === "undefined"
      ) {
        delete earningData[key];
      }
    });

    console.log("Processed earning data:", earningData); // DEBUG

    const earning = new Earning(earningData);
    await earning.save();

    // If fee payment, update student payments array
    if (req.body.studentUniqueId) {
      await Student.findOneAndUpdate(
        { uniqueId: req.body.studentUniqueId },
        {
          $push: {
            payments: {
              amount: earningsValue,
              date: req.body.date,
              description: req.body.description,
              revenueId: earning._id,
            },
          },
        }
      );
    }

    res
      .status(201)
      .json({ message: "Entry submitted, pending chairman approval", earning });
  } catch (err) {
    console.error("Error saving earning:", err); // DEBUG
    // Clean up uploaded files if save fails
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(400).json({ error: err.message });
  }
});
// Get all earnings raised by the currently logged-in user (admin/teacher)
router.get("/my-requests", async (req, res) => {
  try {
    // Assuming you pass user info in req.user (with email or id)
    // If not using authentication middleware, use req.query.email
    const email = req.user?.email || req.query.email; // fallback to query param
    if (!email) return res.status(401).json({ error: "Unauthorized" });
    const myRequests = await Earning.find({ createdBy: email })
      .populate("requestedBy", "name email")
      .sort({
        date: -1,
      });
    res.json(myRequests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all pending earnings (with optional filtering)
router.get("/pending-earnings", async (req, res) => {
  try {
    // Optional filters: createdBy, minAmount, maxAmount, from, to
    const {
      createdBy,
      minAmount,
      maxAmount,
      from,
      to,
      page = 1,
      limit = 10,
    } = req.query;
    const query = { status: "pending" };

    if (createdBy) query.createdBy = createdBy;
    if (minAmount) query.earnings = { $gte: Number(minAmount) };
    if (maxAmount)
      query.earnings = { ...query.earnings, $lte: Number(maxAmount) };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const skip = (pageInt - 1) * limitInt;

    const pendingEarnings = await Earning.find(query)
      .populate("requestedBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitInt);
    const total = await Earning.countDocuments(query);

    // Return with success and data structure for frontend consistency
    res.json({
      success: true,
      data: pendingEarnings,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: total,
        totalPages: Math.ceil(total / limitInt),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// PATCH approve a single earning - with safe attachment deletion (robust)
router.patch("/:id/approve", async (req, res) => {
  try {
    const { approvedBy } = req.body;

    // Load the document first (so we can inspect attachments safely)
    const earning = await Earning.findById(req.params.id);
    if (!earning) return res.status(404).json({ error: "Earning not found" });

    // Safe uploads directory (adjust if your uploads folder is elsewhere)
    const uploadsDir = path.resolve(path.join(__dirname, "..", "uploads"));

    // Delete attachments from disk if they exist and are inside uploadsDir
    if (Array.isArray(earning.attachments) && earning.attachments.length > 0) {
      for (const relPath of earning.attachments) {
        if (!relPath) continue;

        // Resolve candidate path relative to project root
        const candidatePath = path.isAbsolute(relPath)
          ? path.normalize(relPath)
          : path.normalize(path.join(__dirname, "..", relPath));

        // Ensure candidatePath is inside uploadsDir (safety guard) using path.relative
        const relative = path.relative(uploadsDir, candidatePath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          console.warn(`Skipping deletion of file outside uploads directory: ${candidatePath}`);
          continue;
        }

        try {
          if (fs.existsSync(candidatePath)) {
            fs.unlinkSync(candidatePath);
            console.log("Deleted attachment:", candidatePath);
          } else {
            console.log("Attachment not found, skipping:", candidatePath);
          }
        } catch (err) {
          console.error("Failed to delete attachment:", candidatePath, err);
          // continue with other files
        }
      }
    }

    // Update the earning - set approved status and clear attachments
    earning.status = "approved";
    if (approvedBy) earning.approvedBy = approvedBy;
    // Clear attachments to reflect deletion
    earning.attachments = [];
    earning.reviewedAt = new Date();

    const saved = await earning.save();

    // Return populated document (if you use populate elsewhere)
    const populated = await Earning.findById(saved._id).populate(
      "requestedBy",
      "name email uniqueId"
    );

    res.json(populated);
  } catch (error) {
    console.error("Error approving earning:", error);
    res.status(400).json({ error: error.message });
  }
});



// PATCH decline a single earning
router.patch("/:id/decline", async (req, res) => {
  try {
    const { declinedBy, declineReason } = req.body;
    const updated = await Earning.findByIdAndUpdate(
      req.params.id,
      { status: "declined", declinedBy, declineReason },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH approve all pending earnings
router.patch("/bulk-approve", async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const result = await Earning.updateMany(
      { status: "pending" },
      { $set: { status: "approved", approvedBy } }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH decline all pending earnings
router.patch("/bulk-decline", async (req, res) => {
  try {
    const { declinedBy, declineReason } = req.body;
    const result = await Earning.updateMany(
      { status: "pending" },
      { $set: { status: "declined", declinedBy, declineReason } }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// (Optional) GET earning by ID
router.get("/:id", async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id).populate(
      "requestedBy",
      "name email"
    );
    if (!earning) return res.status(404).json({ error: "Not found" });
    res.json(earning);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all earnings with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      requestType,
      startDate,
      endDate,
      createdBy,
    } = req.query;

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const skip = (pageInt - 1) * limitInt;

    let query = {};

    // Apply filters only if they exist and are not 'all' or empty
    if (status && status !== "all" && status !== "") query.status = status;
    if (type && type !== "all" && type !== "") query.type = type;
    if (requestType && requestType !== "all" && requestType !== "")
      query.requestType = requestType;
    if (createdBy && createdBy !== "all" && createdBy !== "")
      query.createdBy = createdBy;

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const earnings = await Earning.find(query)
      .populate("requestedBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitInt);
    const total = await Earning.countDocuments(query);

    res.json({
      success: true,
      data: earnings,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: total,
        totalPages: Math.ceil(total / limitInt),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a single earning
router.delete("/:id", async (req, res) => {
  try {
    const earning = await Earning.findByIdAndDelete(req.params.id);
    if (!earning) return res.status(404).json({ error: "Earning not found" });
    res.json({ message: "Earning deleted successfully", earning });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
