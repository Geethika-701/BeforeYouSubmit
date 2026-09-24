import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://smartsubmit-backend-tjwn.onrender.com/api";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("smartsubmit_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("smartsubmit_token") || "";
  });

  const [page, setPage] = useState("dashboard");

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [submissions, setSubmissions] = useState([]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("smartsubmit_user", JSON.stringify(data.user));
    localStorage.setItem("smartsubmit_token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setSelectedTemplate(null);

    localStorage.removeItem("smartsubmit_user");
    localStorage.removeItem("smartsubmit_token");
  };

  const loadSubmissions = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/submissions/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubmissions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      loadSubmissions();
    }
  }, [token]);

  if (!user || !token) {
    return <AuthPage onLogin={login} />;
  }

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} logout={logout} />

      <main className="main-content">
        <Header user={user} />

        {page === "dashboard" && (
          <Dashboard
            user={user}
            submissions={submissions}
            startSubmission={() => {
              setSelectedTemplate(null);
              setPage("templates");
            }}
          />
        )}

        {page === "templates" && (
          <Templates
            onSelect={(template) => {
              setSelectedTemplate(template);
              setPage("workflow");
            }}
          />
        )}

        {page === "workflow" && selectedTemplate && (
          <VerificationWorkflow
            template={selectedTemplate}
            token={token}
            user={user}
            onComplete={async () => {
              await loadSubmissions();
              setSelectedTemplate(null);
              setPage("history");
            }}
            onBack={() => {
              setSelectedTemplate(null);
              setPage("templates");
            }}
          />
        )}

        {page === "submissions" && (
          <Submissions submissions={submissions} />
        )}

        {page === "history" && (
          <History submissions={submissions} />
        )}
      </main>
    </div>
  );
}

/* =========================
   AUTH
========================= */

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitAuth = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? `${API_URL}/auth/login`
          : `${API_URL}/auth/signup`;

      const body =
        mode === "login"
          ? {
              email,
              password,
            }
          : {
              name,
              email,
              password,
            };

      const response = await axios.post(endpoint, body);

      onLogin(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✓</div>

        <h1>SmartSubmit</h1>

        <p className="auth-subtitle">
          Document Verification Workflow
        </p>

        <h2>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <p className="auth-description">
          {mode === "login"
            ? "Login to continue your submissions."
            : "Create your account to start verifying documents."}
        </p>

        <form onSubmit={submitAuth}>
          {mode === "signup" && (
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="primary-button full-width"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar({ page, setPage, logout }) {
  const menu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "submissions",
      label: "My Submissions",
      icon: "▣",
    },
    {
      id: "templates",
      label: "Templates",
      icon: "▤",
    },
    {
      id: "history",
      label: "History",
      icon: "◷",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">✓</div>

        <div>
          <h2>SmartSubmit</h2>
          <span>Verification Workflow</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">Workspace</p>

        {menu.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${
              page === item.id ? "active" : ""
            }`}
            onClick={() => setPage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="help-box">
          <strong>Need Help?</strong>

          <p>
            Check your documents before submitting.
          </p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          ⇥ Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================
   HEADER
========================= */

function Header({ user }) {
  return (
    <header className="top-header">
      <div>
        <span className="breadcrumb">
          Workspace / SmartSubmit
        </span>
      </div>

      <div className="user-area">
        <div className="notification">
          ♢
        </div>

        <div className="avatar">
          {user.name
            .split(" ")
            .map((word) => word[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>

        <div>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      </div>
    </header>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  user,
  submissions,
  startSubmission,
}) {
  const total = submissions.length;

  const verified = submissions.filter(
    (item) =>
      item.status === "Verified" ||
      item.status === "Submitted"
  ).length;

  const pending = submissions.filter(
    (item) => item.status === "Pending Verification"
  ).length;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>

          <h1>
            Ready to submit, {user.name.split(" ")[0]}?
          </h1>

          <p>
            Verify your documents before sending them.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={startSubmission}
        >
          + Start New Submission
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          number={String(total).padStart(2, "0")}
          label="Total Submissions"
        />

        <StatCard
          number={String(pending).padStart(2, "0")}
          label="Pending Verification"
        />

        <StatCard
          number={String(verified).padStart(2, "0")}
          label="Verified"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Submissions</h2>
              <p>Your latest document submissions.</p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <EmptyState text="No submissions yet." />
          ) : (
            submissions.slice(0, 5).map((submission) => (
              <SubmissionRow
                key={submission._id}
                submission={submission}
              />
            ))
          )}
        </div>

        <div className="panel verification-info">
          <div className="info-icon">✓</div>

          <h2>Why verify before submitting?</h2>

          <p>
            Small mistakes such as missing documents,
            incorrect filenames, or unconfirmed signatures
            can cause a submission to be rejected.
          </p>

          <ul>
            <li>Check required documents</li>
            <li>Verify filenames</li>
            <li>Confirm signature</li>
            <li>Complete required fields</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="stat-card">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}

/* =========================
   TEMPLATES
========================= */

function Templates({ onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("smartsubmit_token");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/submissions/templates`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTemplates(response.data);
      } catch (err) {
        setError("Unable to load templates.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [token]);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Submission Templates</p>

          <h1>Select a Template</h1>

          <p>
            Choose the type of submission you want to verify.
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading">
          Loading templates...
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="template-grid">
        {templates.map((template) => (
          <div
            className="template-card"
            key={template.id}
          >
            <div className="template-icon">
              ▤
            </div>

            <h2>{template.name}</h2>

            <p>{template.description}</p>

            <div className="template-documents">
              <strong>Required documents</strong>

              {template.documents.map((document) => (
                <div
                  className="template-document"
                  key={document.type}
                >
                  <span>✓</span>
                  {document.type}
                </div>
              ))}
            </div>

            <button
              className="primary-button full-width"
              onClick={() => onSelect(template)}
            >
              Select Template
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   VERIFICATION WORKFLOW
========================= */

function VerificationWorkflow({
  template,
  token,
  user,
  onComplete,
  onBack,
}) {
  const [files, setFiles] = useState({});

  const [signatureConfirmed, setSignatureConfirmed] =
    useState(false);

  const [fieldsCompleted, setFieldsCompleted] =
    useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successData, setSuccessData] = useState(null);

  const handleFileChange = (type, file) => {
    if (!file) return;

    setFiles((previous) => ({
      ...previous,
      [type]: file,
    }));
  };

  const requiredDocumentsUploaded = useMemo(() => {
    return template.documents.every(
      (document) => files[document.type]
    );
  }, [template.documents, files]);

  const filenameValid = useMemo(() => {
    return template.documents.every((document) => {
      const file = files[document.type];

      if (!file) {
        return false;
      }

      return (
        file.name.toLowerCase() ===
        document.expectedFileName.toLowerCase()
      );
    });
  }, [template.documents, files]);

  const allVerified =
    requiredDocumentsUploaded &&
    filenameValid &&
    signatureConfirmed &&
    fieldsCompleted;

  const handleFinalSubmit = async () => {
    if (!allVerified) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "templateName",
        template.name
      );

      const verification = {
        documentsUploaded: requiredDocumentsUploaded,
        filenameValid,
        signatureConfirmed,
        requiredFieldsCompleted: fieldsCompleted,
      };

      formData.append(
        "verification",
        JSON.stringify(verification)
      );

      template.documents.forEach((document) => {
        const file = files[document.type];

        if (file) {
          formData.append(
            "documents",
            file,
            file.name
          );
        }
      });

      const response = await axios.post(
        `${API_URL}/submissions/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessData(response.data.submission);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit documents."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted && successData) {
    return (
      <SuccessScreen
        submission={successData}
        user={user}
        onComplete={onComplete}
      />
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            New Submission
          </p>

          <h1>{template.name}</h1>

          <p>
            Upload the required documents and complete
            every verification rule.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back to Templates
        </button>
      </div>

      <div className="workflow-layout">
        <div>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>1. Upload Documents</h2>
                <p>
                  Upload each required document.
                </p>
              </div>
            </div>

            <div className="upload-list">
              {template.documents.map((document) => {
                const file = files[document.type];

                return (
                  <div
                    className="upload-item"
                    key={document.type}
                  >
                    <div>
                      <strong>
                        {document.type}
                      </strong>

                      <span>
                        Expected filename:{" "}
                        {document.expectedFileName}
                      </span>
                    </div>

                    <label className="file-button">
                      {file
                        ? "Change File"
                        : "Choose File"}

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          handleFileChange(
                            document.type,
                            e.target.files[0]
                          )
                        }
                      />
                    </label>

                    {file && (
                      <div className="selected-file">
                        ✓ {file.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>2. Verification</h2>
                <p>
                  Resolve every warning before submitting.
                </p>
              </div>
            </div>

            <div className="verification-list">
              <VerificationItem
                status={requiredDocumentsUploaded}
                successText="All required documents uploaded"
                warningText="Required document(s) missing"
              />

              <VerificationItem
                status={filenameValid}
                successText="File naming convention correct"
                warningText="File naming convention incorrect"
              />

              <VerificationItem
                status={signatureConfirmed}
                successText="Signature confirmed"
                warningText="Signature not confirmed"
                interactive
                checked={signatureConfirmed}
                onChange={setSignatureConfirmed}
                label="I confirm that the required document contains my signature."
              />

              <VerificationItem
                status={fieldsCompleted}
                successText="Required fields completed"
                warningText="Required fields incomplete"
                interactive
                checked={fieldsCompleted}
                onChange={setFieldsCompleted}
                label="I confirm that all required fields have been completed."
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="submit-area">
            <div>
              <strong>
                {allVerified
                  ? "Verification complete"
                  : "Verification incomplete"}
              </strong>

              <span>
                {allVerified
                  ? "All requirements have been satisfied."
                  : "Resolve all warnings before final submission."}
              </span>
            </div>

            <button
              className="primary-button submit-button"
              disabled={!allVerified || loading}
              onClick={handleFinalSubmit}
            >
              {loading
                ? "Submitting..."
                : "Final Submit"}
            </button>
          </div>
        </div>

        <div className="panel rules-panel">
          <div className="rules-icon">!</div>

          <h2>Validation Rules</h2>

          <p>
            This template requires all of the following
            checks to pass:
          </p>

          <ul>
            {template.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================
   VERIFICATION ITEM
========================= */

function VerificationItem({
  status,
  successText,
  warningText,
  interactive,
  checked,
  onChange,
  label,
}) {
  return (
    <div
      className={`verification-item ${
        status ? "success" : "warning"
      }`}
    >
      <div className="verification-status">
        <span>
          {status ? "✓" : "⚠"}
        </span>

        <strong>
          {status ? successText : warningText}
        </strong>
      </div>

      {interactive && (
        <label className="verification-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) =>
              onChange(e.target.checked)
            }
          />

          <span>{label}</span>
        </label>
      )}
    </div>
  );
}

/* =========================
   SUCCESS
========================= */

function SuccessScreen({
  submission,
  user,
  onComplete,
}) {
  return (
    <section className="success-page">
      <div className="success-card">
        <div className="success-icon">
          ✓
        </div>

        <h1>Submission Verified Successfully</h1>

        <p>
          Your documents passed all required verification
          checks.
        </p>

        <div className="success-details">
          <div>
            <span>Applicant</span>
            <strong>{user.name}</strong>
          </div>

          <div>
            <span>Submission</span>
            <strong>
              {submission.templateName}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>Verified</strong>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={onComplete}
        >
          View Submission History
        </button>
      </div>
    </section>
  );
}

/* =========================
   SUBMISSIONS
========================= */

function Submissions({ submissions }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            My Submissions
          </p>

          <h1>Your Submissions</h1>

          <p>
            View the documents you have submitted.
          </p>
        </div>
      </div>

      <div className="panel">
        {submissions.length === 0 ? (
          <EmptyState text="You have no submissions yet." />
        ) : (
          submissions.map((submission) => (
            <SubmissionRow
              key={submission._id}
              submission={submission}
            />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================
   HISTORY
========================= */

function History({ submissions }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">History</p>

          <h1>Submission History</h1>

          <p>
            Track your completed verification submissions.
          </p>
        </div>
      </div>

      <div className="panel">
        {submissions.length === 0 ? (
          <EmptyState text="No submission history available." />
        ) : (
          submissions.map((submission) => (
            <SubmissionRow
              key={submission._id}
              submission={submission}
            />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================
   SUBMISSION ROW
========================= */

function SubmissionRow({ submission }) {
  const date = new Date(
    submission.createdAt
  ).toLocaleDateString();

  const verified =
    submission.status === "Verified" ||
    submission.status === "Submitted";

  return (
    <div className="submission-row">
      <div className="submission-icon">
        ▤
      </div>

      <div className="submission-info">
        <strong>
          {submission.templateName}
        </strong>

        <span>
          {date} •{" "}
          {submission.documents?.length || 0} documents
        </span>
      </div>

      <div
        className={`status-badge ${
          verified ? "verified" : "pending"
        }`}
      >
        {submission.status}
      </div>
    </div>
  );
}

/* =========================
   EMPTY
========================= */

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>□</div>
      <p>{text}</p>
    </div>
  );
}

export default App;