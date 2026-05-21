"use client";
import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { useToast } from "@/components/Toast";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
];

const INDUSTRIES = [
  "Construction",
  "Shipping / Marine",
  "Manufacturing",
  "Hospitality",
  "Oil & Gas",
  "Healthcare",
  "IT / Technology",
  "Other",
];

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

const TOTAL_EMP_STEPS = 5;
const EMPLOYER_UI_PREVIEW_MODE = true;

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StepBar({ current, total, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < total - 1 ? 1 : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-xs)",
                  fontWeight: 600,
                  flexShrink: 0,
                  background: done
                    ? "#ff9900"
                    : active
                      ? "#ff9900"
                      : "var(--color-background-secondary)",
                  color: done || active ? "#fff" : "var(--color-text-tertiary)",
                  border: active ? "3px solid #ffc151" : "none",
                  boxSizing: "border-box",
                }}
              >
                {done ? "✓" : n}
              </div>
              {labels && (
                <span
                  style={{
                    fontSize: "var(--font-xxs)",
                    color: active ? "#ff9900" : "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {labels[i]}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 4px",
                  marginBottom: labels ? 20 : 0,
                  background: done ? "#ff9900" : "var(--color-border-tertiary)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: "var(--font-xs)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: 5,
        }}
      >
        {label}
        {required && <span style={{ color: "#E24B4A", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontSize: "var(--font-xs)",
            color: "var(--color-text-tertiary)",
            marginTop: 4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({ className = "", style = {}, ...props }) {
  return (
    <input
      {...props}
      className={`form-control ${className}`.trim()}
      style={{ height: 53, ...style }}
    />
  );
}

function Select({ children, className = "", style = {}, ...props }) {
  return (
    <select
      {...props}
      className={`form-control ${className}`.trim()}
      style={{
        height: 53,
        paddingRight: 34,
        backgroundImage: "url('/assets/imgs/template/icons/arrow-down.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function Btn({ children, variant = "primary", disabled, onClick, style = {} }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 20px",
    borderRadius: 8,
    fontSize: "var(--font-sm)",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity .15s",
    ...style,
  };
  const vars = {
    primary: { background: "#ff9900", color: "#fff" },
    outline: {
      background: "transparent",
      border: "0.5px solid var(--color-border-secondary)",
      color: "var(--color-text-secondary)",
    },
    success: { background: "#3B6D11", color: "#fff" },
    danger: { background: "#A32D2D", color: "#fff" },
    ghost: {
      background: "var(--color-background-secondary)",
      color: "var(--color-text-secondary)",
      border: "0.5px solid var(--color-border-secondary)",
    },
  };
  return (
    <button
      style={{ ...base, ...vars[variant] }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Alert({ type = "info", children }) {
  const colors = {
    info: { bg: "#ffffff", color: "#ff9900", border: "#ffc151" },
    success: { bg: "#EAF3DE", color: "#3B6D11", border: "#C0DD97" },
    warning: { bg: "#FAEEDA", color: "#854F0B", border: "#FAC775" },
    error: { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1" },
  };
  const c = colors[type];
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: "var(--font-xs)",
        background: c.bg,
        color: c.color,
        border: `0.5px solid ${c.border}`,
        marginBottom: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

// ── Mobile OTP block with inline ✓ tick in input ──────────────────────────────
function MobileOtpField({
  countryCode,
  onCountryCodeChange,
  mobile,
  onMobileChange,
  otp,
  onOtpStateChange,
}) {
  const { sent, verified, generated, userVal } = otp;
  const showToast = useToast();

  const sendOtp = () => {
    const code = genOtp();
    onOtpStateChange({
      sent: true,
      verified: false,
      generated: code,
      userVal: "",
    });
    showToast(`Mobile OTP (demo): ${code}`, "info");
  };
  const verifyOtp = () => {
    if (userVal === generated) {
      onOtpStateChange({ ...otp, verified: true });
      showToast("Mobile number verified successfully.", "success");
    } else {
      showToast("Invalid OTP", "error");
    }
  };

  return (
    <div>
      {/* Mobile input row with tick */}
      <div style={{ display: "flex", gap: 8 }}>
        <Select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          style={{ width: 110, flexShrink: 0 }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
        <div style={{ position: "relative", flex: 1 }}>
          <Input
            type="tel"
            maxLength={10}
            placeholder="9876543210"
            value={mobile}
            onChange={(e) => onMobileChange(e.target.value)}
            style={{ paddingRight: verified ? 40 : undefined }}
          />
          {verified && (
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#3B6D11",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
          )}
        </div>
      </div>

      {/* OTP row */}
      {!verified && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Btn
            variant="ghost"
            disabled={mobile.length < 10 || verified}
            onClick={sendOtp}
            style={{
              flexShrink: 0,
              fontSize: "var(--font-xs)",
              padding: "0 12px",
              height: 38,
            }}
          >
            {sent ? "Resend OTP" : "Send OTP"}
          </Btn>
          {sent && (
            <>
              <Input
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                value={userVal}
                onChange={(e) =>
                  onOtpStateChange({ ...otp, userVal: e.target.value })
                }
                style={{ height: 38, flex: 1 }}
              />
              <Btn
                variant="primary"
                disabled={userVal.length !== 6}
                onClick={verifyOtp}
                style={{
                  flexShrink: 0,
                  fontSize: "var(--font-xs)",
                  padding: "0 14px",
                  height: 38,
                }}
              >
                Verify
              </Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Standard OTP block for email
function OtpBlock({
  label,
  target,
  sent,
  verified,
  onSend,
  onVerify,
  otpVal,
  setOtpVal,
  disabled,
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn
          variant={verified ? "success" : "ghost"}
          disabled={disabled || verified}
          onClick={onSend}
          style={{
            flexShrink: 0,
            fontSize: "var(--font-xs)",
            padding: "0 12px",
            height: 38,
          }}
        >
          {verified ? "✓ Verified" : sent ? "Resend OTP" : "Send OTP"}
        </Btn>
        {sent && !verified && (
          <div style={{ display: "flex", gap: 6, flex: 1 }}>
            <Input
              type="text"
              maxLength={6}
              placeholder="Enter OTP"
              value={otpVal}
              onChange={(e) => setOtpVal(e.target.value)}
              style={{ flex: 1 }}
            />
            <Btn
              variant="primary"
              disabled={otpVal.length !== 6}
              onClick={onVerify}
              style={{
                flexShrink: 0,
                fontSize: "var(--font-xs)",
                padding: "0 14px",
                height: 38,
              }}
            >
              Verify
            </Btn>
          </div>
        )}
      </div>
      {verified && (
        <p
          style={{ fontSize: "var(--font-xs)", color: "#3B6D11", marginTop: 4 }}
        >
          ✓ {target} verified successfully
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CANDIDATE FORM
// ─────────────────────────────────────────────
function CandidateForm() {
  const router = useRouter();
  const showToast = useToast();
  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [mobileOtp, setMobileOtp] = useState({
    sent: false,
    verified: false,
    generated: "",
    userVal: "",
  });
  const [emailOtp, setEmailOtp] = useState({
    sent: false,
    verified: false,
    generated: "",
    userVal: "",
  });
  const [terms, setTerms] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const sendEmail = () => {
    const otp = genOtp();
    setEmailOtp({ sent: true, verified: false, generated: otp, userVal: "" });
    showToast(`Email OTP (demo): ${otp}`, "info");
  };
  const verifyEmail = () => {
    if (emailOtp.userVal === emailOtp.generated) {
      setEmailOtp((p) => ({ ...p, verified: true }));
      showToast("Email verified successfully.", "success");
    } else {
      showToast("Invalid OTP", "error");
    }
  };

  // Razorpay test payment ₹100
  const handlePay = () => {
    setLoading(true);
    // Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local with your Razorpay test key
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const completeAsDemo = () => {
      setPayStatus("success");
      setPaymentMessage(
        "Payment captured in demo mode. Add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local for live checkout.",
      );
      setLoading(false);
    };

    if (!window.Razorpay || !key) {
      window.setTimeout(completeAsDemo, 300);
      return;
    }

    const options = {
      key,
      amount: 10000,
      currency: "INR",
      name: "SkillBridge",
      description: "Candidate Registration Fee",
      handler: function (response) {
        setPayStatus("success");
        setPaymentMessage(
          `Payment successful. Reference: ${response?.razorpay_payment_id || "N/A"}`,
        );
        setLoading(false);
      },
      prefill: { name: form.name, contact: form.mobile, email: form.email },
      theme: { color: "#ff9900" },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setPaymentMessage("Payment window closed before completion.");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization error", error);
      completeAsDemo();
    }
  };

  const canSubmit = mobileOtp.verified && terms && payStatus === "success";

  const handleCandidateSubmit = () => {
    showToast(
      `Welcome ${form.name}! Registration complete. Redirecting to login...`,
      "success",
    );
    window.setTimeout(() => {
      router.push("/Login");
    }, 900);
  };

  return (
    <div>
      <Alert type="info">
        Smart AI note: after CV upload, profile fields are auto-filled from AI
        parsing. You only verify and save.
      </Alert>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Field label="Full Name" required>
        <Input
          placeholder="Enter full name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>

      <Field label="Mobile Number" required>
        <MobileOtpField
          countryCode={form.countryCode}
          onCountryCodeChange={(v) => set("countryCode", v)}
          mobile={form.mobile}
          onMobileChange={(v) => set("mobile", v)}
          otp={mobileOtp}
          onOtpStateChange={setMobileOtp}
        />
      </Field>

      <Field label="Email" hint="Optional — verify to improve account security">
        <Input
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        {form.email && (
          <div style={{ marginTop: 8 }}>
            <OtpBlock
              target="email"
              sent={emailOtp.sent}
              verified={emailOtp.verified}
              disabled={!form.email}
              onSend={sendEmail}
              onVerify={verifyEmail}
              otpVal={emailOtp.userVal}
              setOtpVal={(v) => setEmailOtp((p) => ({ ...p, userVal: v }))}
            />
          </div>
        )}
      </Field>

      {mobileOtp.verified && (
        <Field label="Registration Fee">
          {payStatus === "success" ? (
            <Alert type="success">
              Payment successful for INR 100. Your receipt will be sent to your
              registered email.
            </Alert>
          ) : (
            <Btn
              variant="primary"
              onClick={handlePay}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 0",
                fontSize: "var(--font-sm)",
              }}
            >
              {loading ? "Processing..." : "Pay INR 100 via Razorpay"}
            </Btn>
          )}
          {paymentMessage && (
            <p
              style={{
                fontSize: "var(--font-xs)",
                marginTop: 8,
                color: "var(--color-text-tertiary)",
              }}
            >
              {paymentMessage}
            </p>
          )}
        </Field>
      )}
      {/* Social Register */}
      <div style={{ marginBottom: 26 }}>
        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 18,
            gap: 14,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#ececec",
            }}
          />

          <span
            style={{
              fontSize: 13,
              color: "var(--color-text-tertiary)",
              fontWeight: 600,
            }}
          >
            OR REGISTER WITH
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: "#ececec",
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Google */}
          <button
            type="button"
            style={{
              width: "100%",
              height: 54,
              borderRadius: 10,
              border: "1px solid #ffc151",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontWeight: 600,
              fontSize: 14,
              color: "#122359",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff9900";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(255,153,0,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#122359";
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              width={20}
              height={20}
            />
            Register with Google
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            style={{
              width: "100%",
              height: 54,
              borderRadius: 10,
              border: "1px solid #ffc151",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontWeight: 600,
              fontSize: 14,
              color: "#122359",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff9900";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(255,153,0,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#122359";
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
              alt="linkedin"
              width={18}
              height={18}
            />
            Register with LinkedIn
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontSize: "var(--font-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          I agree to the Terms of Service and Privacy Policy
        </label>
      </div>

      <Btn
        variant="primary"
        disabled={!canSubmit}
        style={{ width: "100%", padding: "13px 0", fontSize: "var(--font-md)" }}
        onClick={handleCandidateSubmit}
      >
        Create Account & Get Started
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────
// EMPLOYER MULTI-STEP FORM
// ─────────────────────────────────────────────
const STEP_LABELS = [
  "GST Check",
  "Company Details",
  "Contact & OTP",
  "Licences",
  "Review",
];

function EmployerForm() {
  const router = useRouter();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    hasGst: null,
    industry: "",
    gstn: "",
    legalName: "",
    tradeName: "",
    businessType: "",
    companySize: "",
    companyType: "",
    pan: "",
    gstRegDate: "",
    cin: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    officialWebsite: "",
    companyLogo: null,
    contactName: "",
    designation: "",
    contactPersonEmail: "",
    corpEmail: "",
    countryCode: "+91",
    mobile: "",
    profileSummary: "",
    licDocs: [],
    mobileOtp: { sent: false, verified: false, generated: "", userVal: "" },
    corpEmailOtp: { sent: false, verified: false, generated: "", userVal: "" },
    profileStatus: "pending",
  });
  const [ocrLoading, setOcrLoading] = useState(false);
  const logoRef = useRef();
  const licRef = useRef();

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const autoFillGst = () => {
    if (data.gstn.length < 15) {
      showToast("Enter a valid 15-character GSTN", "error");
      return;
    }
    setOcrLoading(true);
    setTimeout(() => {
      setData((p) => ({
        ...p,
        legalName: "Horizon Marine Services Pvt. Ltd.",
        tradeName: "Horizon Marine",
        pan: "AAPFU0939F",
        businessType: "Private Limited",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400001",
        address: "Unit 4B, Trade Tower, Ballard Estate, Mumbai",
        gstRegDate: "2018-07-01",
      }));
      setOcrLoading(false);
    }, 1500);
  };

  const sendMobileOtp = () => {
    const otp = genOtp();
    setData((p) => ({
      ...p,
      mobileOtp: { sent: true, verified: false, generated: otp, userVal: "" },
    }));
    showToast(`Mobile OTP (demo): ${otp}`, "info");
  };
  const verifyMobileOtp = () => {
    if (data.mobileOtp.userVal === data.mobileOtp.generated) {
      setData((p) => ({ ...p, mobileOtp: { ...p.mobileOtp, verified: true } }));
      showToast("Mobile number verified successfully.", "success");
    } else {
      showToast("Invalid OTP", "error");
    }
  };
  const sendCorpEmailOtp = () => {
    if (
      !data.corpEmail.includes("@") ||
      data.corpEmail.includes("gmail") ||
      data.corpEmail.includes("yahoo")
    ) {
      showToast(
        "Please use a corporate email — free domains like Gmail/Yahoo are not allowed",
        "warning",
      );
      return;
    }
    const otp = genOtp();
    setData((p) => ({
      ...p,
      corpEmailOtp: {
        sent: true,
        verified: false,
        generated: otp,
        userVal: "",
      },
    }));
    showToast(`Corporate email OTP (demo): ${otp}`, "info");
  };
  const verifyCorpEmailOtp = () => {
    if (data.corpEmailOtp.userVal === data.corpEmailOtp.generated) {
      setData((p) => ({
        ...p,
        corpEmailOtp: { ...p.corpEmailOtp, verified: true },
      }));
      showToast("Corporate email verified successfully.", "success");
    } else {
      showToast("Invalid OTP", "error");
    }
  };

  const isStep2Valid = data.hasGst !== null && data.industry;
  const isStep3Valid =
    data.legalName && data.state && data.city && data.pincode;
  // Corporate email is optional — only mobile OTP is mandatory
  const isStep4Valid =
    data.contactName && data.designation && data.mobileOtp.verified;
  const canGoStep2 = EMPLOYER_UI_PREVIEW_MODE || isStep2Valid;
  const canGoStep3 = EMPLOYER_UI_PREVIEW_MODE || isStep3Valid;
  const canGoStep4 = EMPLOYER_UI_PREVIEW_MODE || isStep4Valid;
  const canSubmit = EMPLOYER_UI_PREVIEW_MODE || isStep4Valid;

  const handleEmployerSubmit = () => {
    showToast(
      `Welcome ${data.contactName}! Your employer account for ${data.legalName} has been created. You'll receive an email at ${data.corpEmail} once verified. Redirecting to login...`,
      "success",
    );
    window.setTimeout(() => {
      router.push("/Login");
    }, 900);
  };

  const InfoRow = ({ label, val, mono }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "7px 0",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        fontSize: "var(--font-sm)",
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        style={{
          fontFamily: mono ? "monospace" : undefined,
          fontWeight: 500,
          textAlign: "right",
          maxWidth: "55%",
        }}
      >
        {val || "—"}
      </span>
    </div>
  );

  // ── Step 1: GST Selector ──────────────────
  const renderStep1 = () => (
    <div>
      <h3
        style={{
          fontSize: "var(--font-md)",
          fontWeight: 600,
          marginBottom: 6,
          color: "var(--color-text-primary)",
        }}
      >
        Is your company GST registered?
      </h3>
      <p
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: 20,
        }}
      >
        GST-registered companies get auto-filled details and a verified badge.
      </p>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {[
          {
            val: true,
            icon: "✓",
            title: "Yes, GST Registered",
            sub: "GSTN → auto-fills all company details • No security deposit",
          },
          {
            val: false,
            icon: "—",
            title: "No, not registered",
            sub: "Manual entry required",
          },
        ].map((opt) => (
          <div
            key={String(opt.val)}
            onClick={() => set("hasGst", opt.val)}
            style={{
              flex: 1,
              padding: "18px 16px",
              borderRadius: 10,
              cursor: "pointer",
              border:
                data.hasGst === opt.val
                  ? "2px solid #ff9900"
                  : "0.5px solid var(--color-border-secondary)",
              background:
                data.hasGst === opt.val
                  ? "#ffffff"
                  : "var(--color-background-primary)",
              transition: "all .15s",
            }}
          >
            <div style={{ fontSize: "var(--font-h6)", marginBottom: 8 }}>
              {opt.icon}
            </div>
            <div
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: 600,
                marginBottom: 4,
                color: "var(--color-text-primary)",
              }}
            >
              {opt.title}
            </div>
            <div
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {opt.sub}
            </div>
          </div>
        ))}
      </div>

      {data.hasGst === false && (
        <Alert type="warning">
          <strong>Non-GST entities:</strong> No registration fee for non-GST
          companies.
        </Alert>
      )}

      <Field label="Industry Type" required>
        <Select
          value={data.industry}
          onChange={(e) => set("industry", e.target.value)}
        >
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </Field>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
        <Btn
          variant="primary"
          disabled={!canGoStep2}
          onClick={() => setStep(2)}
        >
          Continue →
        </Btn>
      </div>
    </div>
  );

  // ── Step 2: Company Details ───────────────
  const renderStep2 = () => (
    <div>
      <h3
        style={{
          fontSize: "var(--font-md)",
          fontWeight: 600,
          marginBottom: 16,
          color: "var(--color-text-primary)",
        }}
      >
        Company details
      </h3>

      {/* GST fields only for GST-registered employers */}
      {data.hasGst ? (
        <>
          <Alert type="info">
            ⚡ Enter your GSTN and click <strong>Auto-fill</strong> — our OCR
            will fetch legal name, trade name, PAN, address, and registration
            date automatically.
          </Alert>
          <Field
            label="GSTN"
            required
            hint="15-character alphanumeric GST number"
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                value={data.gstn}
                onChange={(e) => set("gstn", e.target.value.toUpperCase())}
                placeholder="27AAPFU0939F1ZV"
                maxLength={15}
                style={{ fontFamily: "monospace", flex: 1 }}
              />
              <Btn
                variant="primary"
                disabled={data.gstn.length < 15 || ocrLoading}
                onClick={autoFillGst}
                style={{ flexShrink: 0, whiteSpace: "nowrap" }}
              >
                {ocrLoading ? "Fetching…" : "Auto-fill →"}
              </Btn>
            </div>
          </Field>
          <div
            style={{
              height: 0.5,
              background: "var(--color-border-tertiary)",
              margin: "16px 0",
            }}
          />
        </>
      ) : (
        <Alert type="warning">
          Manual entry mode — fill in your company details below.
        </Alert>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Legal / Company Name" required>
          <Input
            value={data.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            placeholder="Acme Pvt. Ltd."
            style={{
              background: data.hasGst && data.legalName ? "#ffffff" : undefined,
            }}
          />
        </Field>
        <Field label="Trade Name" hint="Brand / display name">
          <Input
            value={data.tradeName}
            onChange={(e) => set("tradeName", e.target.value)}
            placeholder="Acme"
          />
        </Field>

        {/* PAN only for GST employers (pre-filled from GSTN) */}
        {data.hasGst && (
          <Field label="PAN" hint="Auto-filled from GSTN for GST users">
            <Input
              value={data.pan}
              onChange={(e) => set("pan", e.target.value.toUpperCase())}
              placeholder="AAPFU0939F"
              maxLength={10}
              style={{
                fontFamily: "monospace",
                background: data.pan ? "#ffffff" : undefined,
              }}
            />
          </Field>
        )}

        <Field label="Business Type">
          <Select
            value={data.businessType}
            onChange={(e) => set("businessType", e.target.value)}
          >
            <option value="">Select…</option>
            {[
              "Private Limited",
              "LLP",
              "Proprietorship",
              "Partnership",
              "Public Limited",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company Size" required>
          <Select
            value={data.companySize}
            onChange={(e) => set("companySize", e.target.value)}
          >
            <option value="">Select size...</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </Select>
        </Field>
        <Field label="Company Type">
          <Select
            value={data.companyType}
            onChange={(e) => set("companyType", e.target.value)}
          >
            <option value="">Select type...</option>
            <option value="startup">Startup</option>
            <option value="mid-size">Mid-size</option>
            <option value="enterprise">Enterprise</option>
            <option value="government">Government</option>
            <option value="non-profit">Non-profit</option>
          </Select>
        </Field>

        {/* GST Registration Date only for GST employers */}
        {data.hasGst && (
          <Field label="GST Registration Date" hint="Auto-filled for GST users">
            <Input
              type="date"
              value={data.gstRegDate}
              onChange={(e) => set("gstRegDate", e.target.value)}
              style={{ background: data.gstRegDate ? "#ffffff" : undefined }}
            />
          </Field>
        )}

        <Field label="CIN" hint="Company Identification Number (if applicable)">
          <Input
            value={data.cin}
            onChange={(e) => set("cin", e.target.value.toUpperCase())}
            placeholder="U74999MH2018PTC..."
            style={{ fontFamily: "monospace" }}
          />
        </Field>
      </div>

      <div
        style={{
          height: 0.5,
          background: "var(--color-border-tertiary)",
          margin: "8px 0 16px",
        }}
      />
      <p
        style={{
          fontSize: "var(--font-xs)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: 14,
        }}
      >
        Registered Address
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="State" required>
          <Select
            value={data.state}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Select state…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="City" required>
          <Input
            value={data.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Mumbai"
            style={{
              background: data.hasGst && data.city ? "#ffffff" : undefined,
            }}
          />
        </Field>
        <Field label="PIN Code" required>
          <Input
            value={data.pincode}
            maxLength={6}
            onChange={(e) => set("pincode", e.target.value)}
            placeholder="400001"
            style={{
              background: data.hasGst && data.pincode ? "#ffffff" : undefined,
            }}
          />
        </Field>
        <Field label="Official Website">
          <Input
            value={data.officialWebsite}
            onChange={(e) => set("officialWebsite", e.target.value)}
            placeholder="https://www.company.com"
          />
        </Field>
      </div>

      <Field label="Full Registered Address" required>
        <Input
          value={data.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Building, Street, City, State, PIN"
          style={{
            background: data.hasGst && data.address ? "#ffffff" : undefined,
          }}
        />
      </Field>

      <Field label="Company Logo">
        <div
          onClick={() => logoRef.current?.click()}
          style={{
            border: "1px dashed var(--color-border-secondary)",
            borderRadius: 8,
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            background: "var(--color-background-secondary)",
          }}
        >
          {data.companyLogo ? (
            <p
              style={{
                fontSize: "var(--font-sm)",
                color: "#3B6D11",
                fontWeight: 600,
              }}
            >
              ✓ {data.companyLogo.name}
            </p>
          ) : (
            <>
              <p
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Click to upload logo
              </p>
              <p
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--color-text-tertiary)",
                  marginTop: 4,
                }}
              >
                PNG / JPG · Max 2 MB · Recommended 200×200px
              </p>
            </>
          )}
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => set("companyLogo", e.target.files?.[0] ?? null)}
        />
      </Field>

      {data.hasGst && data.legalName && (
        <Alert type="success">
          ✓ Company details auto-filled from GSTN via OCR. Highlighted fields
          are editable.
        </Alert>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Btn variant="outline" onClick={() => setStep(1)}>
          ← Back
        </Btn>
        <Btn
          variant="primary"
          disabled={!canGoStep3}
          onClick={() => setStep(3)}
        >
          Continue →
        </Btn>
      </div>
    </div>
  );

  // ── Step 3: Contact & OTP ─────────────────
  const renderStep3 = () => (
    <div>
      <h3
        style={{
          fontSize: "var(--font-md)",
          fontWeight: 600,
          marginBottom: 16,
          color: "var(--color-text-primary)",
        }}
      >
        Contact details & verification
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Contact Person Name" required>
          <Input
            value={data.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            placeholder="Arjun Mehta"
          />
        </Field>
        <Field label="Designation" required>
          <Input
            value={data.designation}
            onChange={(e) => set("designation", e.target.value)}
            placeholder="HR Manager"
          />
        </Field>
        <Field label="Contact Person Email" required>
          <Input
            type="email"
            value={data.contactPersonEmail}
            onChange={(e) => set("contactPersonEmail", e.target.value)}
            placeholder="contact@personal.com"
          />
        </Field>
      </div>

      <Field
        label="Corporate Email (Optional)"
        hint="Free domains (Gmail, Yahoo etc.) are not accepted"
      >
        <Input
          type="email"
          value={data.corpEmail}
          onChange={(e) => set("corpEmail", e.target.value)}
          placeholder="you@yourcompany.com"
        />

        {data.corpEmail && (
          <div style={{ marginTop: 8 }}>
            <OtpBlock
              target="corporate email"
              sent={data.corpEmailOtp.sent}
              verified={data.corpEmailOtp.verified}
              disabled={!data.corpEmail}
              onSend={sendCorpEmailOtp}
              onVerify={verifyCorpEmailOtp}
              otpVal={data.corpEmailOtp.userVal}
              setOtpVal={(v) =>
                setData((p) => ({
                  ...p,
                  corpEmailOtp: {
                    ...p.corpEmailOtp,
                    userVal: v,
                  },
                }))
              }
            />
          </div>
        )}
      </Field>

      <Field label="Mobile Number" required>
        <MobileOtpField
          countryCode={data.countryCode}
          onCountryCodeChange={(v) => set("countryCode", v)}
          mobile={data.mobile}
          onMobileChange={(v) => set("mobile", v)}
          otp={data.mobileOtp}
          onOtpStateChange={(v) => setData((p) => ({ ...p, mobileOtp: v }))}
        />
      </Field>

      <Field
        label="Company Profile Summary"
        hint="Brief description of your company and hiring focus (shown on job listings)"
      >
        <textarea
          className="form-control"
          value={data.profileSummary}
          onChange={(e) => set("profileSummary", e.target.value)}
          placeholder="e.g. We are a leading marine services company specialising in offshore and vessel crew placement."
          rows={4}
          style={{ resize: "vertical" }}
        />
      </Field>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Btn variant="outline" onClick={() => setStep(2)}>
          ← Back
        </Btn>
        <Btn
          variant="primary"
          disabled={!canGoStep4}
          onClick={() => setStep(4)}
        >
          Continue →
        </Btn>
      </div>
    </div>
  );

  // ── Step 4: Licence Upload ────────────────
  const renderStep4 = () => (
    <div>
      <h3
        style={{
          fontSize: "var(--font-md)",
          fontWeight: 600,
          marginBottom: 4,
          color: "var(--color-text-primary)",
        }}
      >
        Licence & document upload
        <span
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: 400,
            color: "var(--color-text-tertiary)",
            marginLeft: 10,
            background: "var(--color-background-secondary)",
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          Optional
        </span>
      </h3>
      <p
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Upload recruitment licences to earn trust badges displayed on all job
        listings.
      </p>
      <Alert type="info">
        <strong>Blue Tick</strong> requires: GST Verified + one active licence +
        corporate domain email — all simultaneously.
      </Alert>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {[
          {
            id: "poe",
            label: "Recruitment Licence",
            badge: "Recruitment Licensed",

            color: "#3B6D11",
            bg: "#EAF3DE",
            desc: "Recruitment licence for overseas placement",
          },
          {
            id: "rpsl",
            label: "RPSL Licence",
            badge: "RPSL Licensed",
            color: "#0F6E56",
            bg: "#E1F5EE",
            desc: "Shipping recruitment licence for vessel placements",
          },
        ].map((lic) => {
          const file = data.licDocs.find((d) => d.id === lic.id);
          return (
            <div key={lic.id}>
              <p
                style={{
                  fontSize: "var(--font-xs)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: 8,
                }}
              >
                {lic.label}
              </p>
              <div
                onClick={() => licRef.current?.click()}
                style={{
                  border: "1px dashed var(--color-border-secondary, #ffc151)",
                  borderRadius: 8,
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: file
                    ? "#EAF3DE"
                    : "var(--color-background-secondary)",
                }}
              >
                {file ? (
                  <p
                    style={{
                      fontSize: "var(--font-xs)",
                      color: "#3B6D11",
                      fontWeight: 600,
                    }}
                  >
                    ✓ {file.name}
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: "var(--font-xl)", opacity: 0.3 }}>
                      ↑
                    </p>
                    <p
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Upload {lic.label}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--color-text-tertiary)",
                        marginTop: 3,
                      }}
                    >
                      PDF / JPG / PNG · Max 5 MB
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    setData((p) => ({
                      ...p,
                      licDocs: [
                        ...p.licDocs.filter((d) => d.id !== lic.id),
                        { id: lic.id, name: f.name },
                      ],
                    }));
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  background: lic.bg,
                  borderRadius: 6,
                  fontSize: "var(--font-xs)",
                  color: lic.color,
                }}
              >
                Awards: <strong>{lic.badge}</strong> badge
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Btn variant="outline" onClick={() => setStep(3)}>
          ← Back
        </Btn>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={() => setStep(5)}>
            Skip for now
          </Btn>
          <Btn variant="primary" onClick={() => setStep(5)}>
            Continue →
          </Btn>
        </div>
      </div>
    </div>
  );

  // ── Step 5: Review & Submit ───────────────
  const renderStep5 = () => (
    <div>
      <h3
        style={{
          fontSize: "var(--font-md)",
          fontWeight: 600,
          marginBottom: 4,
          color: "var(--color-text-primary)",
        }}
      >
        Review & submit
      </h3>
      <p
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: 20,
        }}
      >
        Confirm all details before creating your account.
      </p>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: 600,
            color: "var(--color-text-tertiary)",
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          COMPANY
        </p>
        <InfoRow label="Legal name" val={data.legalName} />
        {data.hasGst && <InfoRow label="GSTN" val={data.gstn} mono />}
        {data.hasGst && <InfoRow label="PAN" val={data.pan} mono />}
        <InfoRow label="Business type" val={data.businessType} />
        <InfoRow label="Industry" val={data.industry} />
        {data.hasGst && <InfoRow label="GST Reg. date" val={data.gstRegDate} />}
        <InfoRow label="CIN" val={data.cin} mono />
        <InfoRow
          label="Address"
          val={
            data.address
              ? `${data.address}, ${data.city}, ${data.state} – ${data.pincode}`
              : ""
          }
        />
        <InfoRow label="Website" val={data.officialWebsite} />
      </div>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: 600,
            color: "var(--color-text-tertiary)",
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          CONTACT
        </p>
        <InfoRow label="Contact person" val={data.contactName} />
        <InfoRow label="Designation" val={data.designation} />
        <InfoRow
          label="Corporate email"
          val={`${data.corpEmail} ${data.corpEmailOtp.verified ? "✓" : ""}`}
        />
        <InfoRow
          label="Mobile"
          val={`${data.countryCode} ${data.mobile} ${data.mobileOtp.verified ? "✓ Verified" : ""}`}
        />
      </div>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: 600,
            color: "var(--color-text-tertiary)",
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          DOCUMENTS
        </p>
        <InfoRow
          label="Company logo"
          val={data.companyLogo ? `✓ ${data.companyLogo.name}` : "Not uploaded"}
        />
        <InfoRow
          label="Licences"
          val={
            data.licDocs.length > 0
              ? data.licDocs.map((d) => d.id.toUpperCase()).join(", ")
              : "Skipped"
          }
        />
        <InfoRow label="GST Registered" val={data.hasGst ? "Yes" : "No"} />
      </div>
      <div
        style={{
          background: "#ffffff",
          border: "0.5px solid #ffc151",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: 600,
            color: "#ff9900",
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          TRIAL TERMS
        </p>
        <InfoRow label="Trial period" val="14 days" />
        <InfoRow label="Free credits" val="5 × Band A" />
        <InfoRow label="CV downloads" val="Disabled during trial" />
        <InfoRow
          label="Account status"
          val="Trial — pending admin verification"
        />
      </div>
      <Btn
        variant="primary"
        disabled={!canSubmit}
        style={{ width: "100%", padding: "13px 0", fontSize: "var(--font-md)" }}
        onClick={handleEmployerSubmit}
      >
        Create Account & Start Trial
      </Btn>
      <p
        style={{
          fontSize: "var(--font-xs)",
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        By submitting you agree to our Terms of Service and Employer Policy
      </p>
      <div
        style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}
      >
        <Btn variant="outline" onClick={() => setStep(4)}>
          ← Back
        </Btn>
      </div>
    </div>
  );

  const steps = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
  ];
  return (
    <div>
      <StepBar current={step} total={TOTAL_EMP_STEPS} labels={STEP_LABELS} />
      {steps[step - 1]?.()}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT PAGE — reads ?type= from URL
// ─────────────────────────────────────────────
function RegisterPageInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type"); // "candidate" | "employer" | null
  const [role, setRole] = useState(
    typeParam === "candidate" || typeParam === "employer" ? typeParam : null,
  );

  return (
    <main style={{ minHeight: "100vh", padding: "40px 16px 60px" }}>
      <div
        style={{ maxWidth: role === "employer" ? 680 : 460, margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: "var(--font-xs)",
              fontWeight: 700,
              letterSpacing: 1.5,
              color: "#ff9900",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            SkillBridge
          </div>
          <h1
            style={{
              fontSize: "var(--font-h5)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            {role === "employer"
              ? "Employer Registration"
              : role === "candidate"
                ? "Candidate Registration"
                : "Create your account"}
          </h1>
          <p
            style={{
              fontSize: "var(--font-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            {role === "employer"
              ? "Complete your company profile to start posting jobs and accessing candidates."
              : role === "candidate"
                ? "Join thousands of skilled professionals finding their next opportunity."
                : "Select your account type to get started."}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 16,
            padding: "32px 36px",
            boxSizing: "border-box",
          }}
        >
          {/* Role selector */}
          <div style={{ marginBottom: role ? 28 : 8 }}>
            {!role && (
              <p
                style={{
                  fontSize: "var(--font-xs)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: 12,
                }}
              >
                I am registering as…
              </p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                {
                  val: "candidate",
                  icon: "👤",
                  label: "Job Seeker / Candidate",
                  sub: "Find jobs, build profile",
                },
                {
                  val: "employer",
                  icon: "🏢",
                  label: "Employer / Company",
                  sub: "Post jobs, hire talent",
                },
              ].map((r) => (
                <div
                  key={r.val}
                  onClick={() => setRole(r.val)}
                  style={{
                    flex: 1,
                    padding: role ? "10px 14px" : "18px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border:
                      role === r.val
                        ? "2px solid #ff9900"
                        : "1px solid var(--color-border-secondary, #C7D2E0)",
                    background:
                      role === r.val
                        ? "#ffffff"
                        : "var(--color-background-secondary)",
                    transition: "all .15s",
                    display: "flex",
                    alignItems: role ? "center" : "flex-start",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: role ? 18 : 24, flexShrink: 0 }}>
                    {r.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: role ? 13 : 14,
                        fontWeight: 600,
                        color:
                          role === r.val
                            ? "#ff9900"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {r.label}
                    </div>
                    {!role && (
                      <div
                        style={{
                          fontSize: "var(--font-xs)",
                          color: "var(--color-text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {r.sub}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {role === "candidate" && <CandidateForm />}
          {role === "employer" && <EmployerForm />}

          {!role && (
            <p
              style={{
                textAlign: "center",
                fontSize: "var(--font-sm)",
                color: "var(--color-text-tertiary)",
                marginTop: 24,
              }}
            >
              Select an account type above to continue
            </p>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "var(--font-sm)",
            color: "var(--color-text-secondary)",
            marginTop: 20,
          }}
        >
          Already have an account?{" "}
          <a
            href="/Login"
            style={{
              color: "#ff9900",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading…
        </main>
      }
    >
      <RegisterPageInner />
    </Suspense>
  );
}
