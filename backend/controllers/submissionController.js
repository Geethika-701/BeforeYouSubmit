const Submission = require("../models/Submission");

const getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: "internship",
        name: "Internship Application",
        description:
          "Verify declaration, resume, ID proof and supporting documents before submission.",
        documents: [
          {
            type: "Declaration",
            required: true,
            expectedFileName: "Declaration.pdf",
          },
          {
            type: "Resume",
            required: true,
            expectedFileName: "Resume.pdf",
          },
          {
            type: "ID Proof",
            required: true,
            expectedFileName: "ID_Proof.pdf",
          },
          {
            type: "Supporting Document",
            required: true,
            expectedFileName: "Supporting_Document.pdf",
          },
        ],
        rules: [
          "Required documents must be uploaded",
          "File naming convention must be correct",
          "Signature must be confirmed",
          "Required fields must be completed",
        ],
      },

      {
        id: "scholarship",
        name: "Scholarship Application",
        description:
          "Verify application documents before scholarship submission.",
        documents: [
          {
            type: "Application Form",
            required: true,
            expectedFileName: "Application_Form.pdf",
          },
          {
            type: "ID Proof",
            required: true,
            expectedFileName: "ID_Proof.pdf",
          },
          {
            type: "Income Certificate",
            required: true,
            expectedFileName: "Income_Certificate.pdf",
          },
          {
            type: "Supporting Document",
            required: true,
            expectedFileName: "Supporting_Document.pdf",
          },
        ],
        rules: [
          "Required documents must be uploaded",
          "File naming convention must be correct",
          "Signature must be confirmed",
          "Required fields must be completed",
        ],
      },

      {
        id: "project",
        name: "Project Approval Form",
        description:
          "Verify project approval documents before final submission.",
        documents: [
          {
            type: "Project Form",
            required: true,
            expectedFileName: "Project_Form.pdf",
          },
          {
            type: "Project Report",
            required: true,
            expectedFileName: "Project_Report.pdf",
          },
          {
            type: "ID Proof",
            required: true,
            expectedFileName: "ID_Proof.pdf",
          },
          {
            type: "Supporting Document",
            required: true,
            expectedFileName: "Supporting_Document.pdf",
          },
        ],
        rules: [
          "Required documents must be uploaded",
          "File naming convention must be correct",
          "Signature must be confirmed",
          "Required fields must be completed",
        ],
      },
    ];

    res.json(templates);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load templates",
    });
  }
};

const createSubmission = async (req, res) => {
  try {
    const { templateName, verification } = req.body;

    if (!templateName) {
      return res.status(400).json({
        message: "Template name is required",
      });
    }

    const files = req.files || [];

    const documents = files.map((file) => ({
      type: file.fieldname,
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      uploaded: true,
    }));

    const verificationData = verification
      ? JSON.parse(verification)
      : {
          documentsUploaded: false,
          filenameValid: false,
          signatureConfirmed: false,
          requiredFieldsCompleted: false,
        };

    const allVerified =
      verificationData.documentsUploaded &&
      verificationData.filenameValid &&
      verificationData.signatureConfirmed &&
      verificationData.requiredFieldsCompleted;

    const submission = await Submission.create({
      userId: req.user.id,
      templateName,
      documents,
      verification: verificationData,
      status: allVerified ? "Verified" : "Pending Verification",
      submittedAt: allVerified ? new Date() : null,
    });

    res.status(201).json({
      message: "Submission created successfully",
      submission,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create submission",
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load submissions",
    });
  }
};

module.exports = {
  getTemplates,
  createSubmission,
  getMySubmissions,
};