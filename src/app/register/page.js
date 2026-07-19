"use client";
import { useState, useRef, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { useToast } from "@/components/Toast";
import { Country, State, City } from "country-state-city";
import {
  CountrySelector,
  DialCodePreview,
  defaultCountries,
  parseCountry,
} from "react-international-phone";
import "react-international-phone/style.css";
import {
  registerCandidate,
  sendOtp,
  verifyOtp,
  createCandidateOrder,
  googleLogin,
  linkedInLogin,

} from "@/services/candidate/candidateAuthService";
import {
  registerWithGoogle,
  registerWithLinkedIn,
  verifyWithGoogle,
  verifyWithLinkedIn
} from "@/services/candidate/registrationService";
import {
  gstCheck,
  saveCompanyDetails,
  saveContactDetails,
  sendMobileOtp,
  verifyMobileOtp,
  resendMobileOtp,
  sendEmailOtp,
  verifyEmailOtp,
  resendEmailOtp,
  uploadLicences,
  submitRegistration,
  resumeRegistration,
} from "@/services/recruiter/recruiterRegistrationService";
// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
// Built from react-international-phone's full country dataset (~218
// countries) instead of a hand-picked list of 4. Expected digit-length is
// derived from each country's format mask (each "." is one digit) so
// validation still works per-country without hardcoding it.
const PHONE_COUNTRIES = defaultCountries.map((c) => {
  const parsed = parseCountry(c);
  const masks =
    typeof parsed.format === "string"
      ? [parsed.format]
      : parsed.format && typeof parsed.format === "object"
        ? Object.values(parsed.format)
        : [];
  const dotCounts = masks
    .map((m) => (typeof m === "string" ? (m.match(/\./g) || []).length : 0))
    .filter((n) => n > 0);
  return {
    iso2: parsed.iso2,
    name: parsed.name,
    code: `+${parsed.dialCode}`,
    dialCode: parsed.dialCode,
    minLen: dotCounts.length ? Math.min(...dotCounts) : 6,
    maxLen: dotCounts.length ? Math.max(...dotCounts) : 14,
  };
});

const INDUSTRIES = [
  "Recruitment agency",
  "Construction & Infrastructure",
  "Marine & Shipping",
  "Oil & Gas",
  "Manufacturing",
  "Logistics & Transportation",
  "Warehousing & Supply Chain",
  "Hospitality & Facilities",
  "Ports & Terminals",
  "Mining",
  "Aviation",
  "Renewable Energy",
  "Engineering Services",
  "Healthcare",
  "IT & Technology",
  "Retail",
  "Other",
];

const BUSINESS_TYPES = [
  { value: "Private_Ltd", label: "Private Limited" },
  { value: "Public_Ltd", label: "Public Limited" },
  { value: "LLP", label: "Limited Liability Partnership (LLP)" },
  { value: "Partnership", label: "Partnership" },
  { value: "Proprietorship", label: "Sole Proprietorship" },
  { value: "OPC", label: "One Person Company (OPC)" },
  { value: "Section8", label: "Section 8 Company (Non-Profit)" },
  { value: "Trust", label: "Trust" },
  { value: "Society", label: "Society" },
  { value: "Cooperative", label: "Cooperative Society" },
  { value: "PSU", label: "Public Sector Undertaking (PSU)" },
  { value: "Government", label: "Government Entity" },
  { value: "Branch_Office", label: "Branch Office" },
  { value: "Liaison_Office", label: "Liaison Office" },
  { value: "Joint_Venture", label: "Joint Venture" },
  { value: "Other", label: "Other" },
];

const COMPANY_SIZES = [
  { value: "Size_1_10", label: "1-10 employees" },
  { value: "Size_11_50", label: "11-50 employees" },
  { value: "Size_51_200", label: "51-200 employees" },
  { value: "Size_201_500", label: "201-500 employees" },
  { value: "Size_500_Plus", label: "500+ employees" },
];

const COMPANY_TYPES = [
  { value: "startup", label: "Startup" },
  { value: "mid-size", label: "Mid-size" },
  { value: "enterprise", label: "Enterprise" },
  { value: "government", label: "Government" },
  { value: "non-profit", label: "Non-profit" },
];

const labelFor = (list, value) =>
  list.find((o) => o.value === value)?.label || value;

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
const PIN_REGEX = /^[0-9]{6}$/;

// Full country list for the Registered Address section — replaces the old
// India-only STATES constant. State and City options now cascade from
// whichever country/state the employer actually picks, instead of always
// assuming India.
const ALL_COUNTRIES = Country.getAllCountries();
const COUNTRY_NAMES = ALL_COUNTRIES.map((c) => c.name);

const getCountryIso = (countryName) =>
  ALL_COUNTRIES.find((c) => c.name === countryName)?.isoCode || "";

const getStateNamesForCountry = (countryIso) =>
  countryIso ? State.getStatesOfCountry(countryIso).map((s) => s.name) : [];

const getStateIso = (countryIso, stateName) =>
  countryIso
    ? State.getStatesOfCountry(countryIso).find((s) => s.name === stateName)
        ?.isoCode || ""
    : "";

const getCityNamesForState = (countryIso, stateIso) =>
  countryIso && stateIso
    ? City.getCitiesOfState(countryIso, stateIso).map((c) => c.name)
    : [];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

const getCountryMeta = (code) =>
  PHONE_COUNTRIES.find((c) => c.code === code) ||
  PHONE_COUNTRIES.find((c) => c.code === "+91") ||
  PHONE_COUNTRIES[0];

const isValidMobile = (mobile, countryCode) => {
  const digits = mobile.replace(/\D/g, "");
  const meta = getCountryMeta(countryCode);
  return digits.length >= meta.minLen && digits.length <= meta.maxLen;
};

const TOTAL_EMP_STEPS = 5;
const EMPLOYER_UI_PREVIEW_MODE = false;

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

function Field({ label, hint, required, error, children }) {
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
      {error ? (
        <p
          style={{
            fontSize: "var(--font-xs)",
            color: "#E24B4A",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--color-text-tertiary)",
              marginTop: 4,
            }}
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function Input({ className = "", style = {}, error, onFocus, onBlur, ...props }) {
  return (
    <input
      {...props}
      className={`form-control ${className}`.trim()}
      style={{
        height: 53,
        border: error
          ? "1px solid #E24B4A"
          : "1px solid var(--color-border-secondary, #C7D2E0)",
        backgroundColor: error ? "#FFF5F5" : undefined,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
      onFocus={(e) => {
        if (!error) e.currentTarget.style.border = "1px solid #ff9900";
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!error) e.currentTarget.style.border = "1px solid var(--color-border-secondary, #C7D2E0)";
        onBlur?.(e);
      }}
    />
  );
}

function Select({ children, className = "", style = {}, error, onFocus, onBlur, ...props }) {
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
        border: error
          ? "1px solid #E24B4A"
          : "1px solid var(--color-border-secondary, #C7D2E0)",
        backgroundColor: error ? "#FFF5F5" : undefined,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
      onFocus={(e) => {
        if (!error) e.currentTarget.style.border = "1px solid #ff9900";
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!error) e.currentTarget.style.border = "1px solid var(--color-border-secondary, #C7D2E0)";
        onBlur?.(e);
      }}
    >
      {children}
    </select>
  );
}

// ── Combobox: type-to-search dropdown, select-only ───────────────────────
// Accepts either a plain string[] or a {value,label}[] options array.
// Typing only filters the list below — it never sets the field's value on
// its own. The value only changes when an option is actually picked (click,
// or pressing Enter on an exact/singular match). Typing something that
// matches nothing and clicking away snaps the text back to whatever is
// actually selected, so nothing gets silently saved.
function Combobox({ value, onChange, options, placeholder, error, disabled }) {
  const normalized = (options || []).map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const justSelectedRef = useRef(false);

  const matched = normalized.find((o) => o.value === value);
  const [query, setQuery] = useState(matched ? matched.label : value || "");

  useEffect(() => {
    const m = normalized.find((o) => o.value === value);
    setQuery(m ? m.label : value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const revertIfUnmatched = () => {
    const m = normalized.find((o) => o.value === value);
    setQuery(m ? m.label : value || "");
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        revertIfUnmatched();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const filtered = query
    ? normalized.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalized;

  const selectOption = (opt) => {
    justSelectedRef.current = true;
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <Input
        value={query}
        disabled={disabled}
        error={error}
        placeholder={placeholder || "Type to search…"}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length === 1) {
              selectOption(filtered[0]);
            } else {
              const exact = normalized.find(
                (o) => o.label.toLowerCase() === query.trim().toLowerCase()
              );
              if (exact) selectOption(exact);
              else revertIfUnmatched();
            }
            setOpen(false);
          } else if (e.key === "Escape") {
            setOpen(false);
            revertIfUnmatched();
          }
        }}
        onBlur={() => {
          // Give a just-clicked option (onMouseDown, which fires first) a
          // chance to register before deciding whether to revert.
          window.setTimeout(() => {
            if (justSelectedRef.current) {
              justSelectedRef.current = false;
              return;
            }
            setOpen(false);
            revertIfUnmatched();
          }, 0);
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: "#fff",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 8,
            boxShadow: "0 12px 28px rgba(18,35,89,0.14)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.map((opt) => (
            <div
              key={opt.value}
              onMouseDown={() => selectOption(opt)}
              style={{
                padding: "9px 14px",
                fontSize: "var(--font-sm)",
                cursor: "pointer",
                color: "var(--color-text-primary)",
                background: opt.label === query ? "#FFF4E0" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF4E0")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  opt.label === query ? "#FFF4E0" : "transparent")
              }
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: "#fff",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 8,
            boxShadow: "0 12px 28px rgba(18,35,89,0.14)",
            padding: "9px 14px",
            fontSize: "var(--font-xs)",
            color: "var(--color-text-tertiary)",
          }}
        >
          No matches — pick from the list
        </div>
      )}
    </div>
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

// ── Country code selector backed by react-international-phone's full list ──
function CountryCodeSelect({ value, onChange, disabled, verified }) {
  const meta = getCountryMeta(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 53,
        borderRadius: 8,
        border: verified ? "1px solid #3B6D11" : "0.5px solid var(--color-border-secondary)",
        background: verified ? "#f4f9f1" : disabled ? "var(--color-background-secondary)" : "#fff",
        paddingLeft: 2,
        paddingRight: 10,
        gap: 2,
        flexShrink: 0,
      }}
    >
      <CountrySelector
        selectedCountry={meta.iso2}
        onSelect={(country) => onChange(`+${country.dialCode}`)}
        disabled={disabled}
        buttonStyle={{
          border: "none",
          background: "transparent",
          height: 44,
          padding: "0 6px",
        }}
      />
      <DialCodePreview
        dialCode={meta.dialCode}
        prefix="+"
        style={{
          fontWeight: 600,
          fontSize: "var(--font-sm)",
          color: "var(--color-text-primary)",
        }}
      />
    </div>
  );
}

// ── 6-box OTP input: auto-advances focus, supports backspace and paste ──
function OtpDigitsInput({ value, onChange, length = 6, disabled, autoFocus }) {
  const inputsRef = useRef([]);
  const digits = (value || "")
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const focusInput = (idx) => inputsRef.current[idx]?.focus();

  const handleChange = (idx, raw) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join("").slice(0, length));
    if (char && idx < length - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) focusInput(idx - 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }} onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="form-control"
          style={{
            width: 42,
            height: 48,
            padding: 0,
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
          }}
        />
      ))}
    </div>
  );
}

// Small resend-cooldown timer shared by both OTP blocks below.
function useResendCooldown(seconds = 30) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);
  return [remaining, () => setRemaining(seconds)];
}

// ── Mobile OTP block: country selector + number + boxed OTP entry ──────────
function MobileOtpField({
  countryCode,
  onCountryCodeChange,
  mobile,
  onMobileChange,
  otp,
  onOtpStateChange,
  sendMobileOtp,
  verifyMobileOtp,
  resendMobileOtp,
}) {
  const { sent, verified, userVal } = otp;
  const meta = getCountryMeta(countryCode);
  const digitsOnly = mobile.replace(/\D/g, "");
  const touched = digitsOnly.length > 0;
  const mobileValid = isValidMobile(mobile, countryCode);
  const showMobileError = touched && !verified && !mobileValid;
  const [cooldown, startCooldown] = useResendCooldown(30);

  const handleSend = () => {
    sent ? resendMobileOtp() : sendMobileOtp();
    startCooldown();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <CountryCodeSelect
          value={countryCode}
          disabled={verified}
          verified={verified}
          onChange={(v) => {
            onCountryCodeChange(v);
            // re-trim number to new country's max length
            const newMeta = getCountryMeta(v);
            onMobileChange(digitsOnly.slice(0, newMeta.maxLen));
          }}
        />
        <div style={{ position: "relative", flex: 1 }}>
          <Input
            type="tel"
            maxLength={meta.maxLen}
            placeholder={`${meta.minLen}-digit number`}
            value={mobile}
            disabled={verified}
            error={showMobileError}
            onChange={(e) =>
              onMobileChange(
                e.target.value.replace(/\D/g, "").slice(0, meta.maxLen)
              )
            }
            style={{
              paddingRight: verified ? 40 : undefined,
              borderColor: verified ? "#3B6D11" : undefined,
              backgroundColor: verified ? "#f4f9f1" : undefined,
              color: verified ? "#2b4e0c" : undefined,
              border: verified ? "1px solid #3B6D11" : undefined,
            }}
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

      {showMobileError && (
        <p style={{ fontSize: "var(--font-xs)", color: "#E24B4A", marginTop: 4 }}>
          Enter a valid {meta.minLen === meta.maxLen ? meta.minLen : `${meta.minLen}-${meta.maxLen}`}-digit number for {meta.code}
        </p>
      )}

      {!verified && !sent && (
        <div style={{ marginTop: 8 }}>
          <Btn
            variant="ghost"
            disabled={!mobileValid}
            onClick={handleSend}
            style={{ fontSize: "var(--font-xs)", padding: "0 12px", height: 38 }}
          >
            Send OTP
          </Btn>
        </div>
      )}

      {!verified && sent && (
        <div
          style={{
            marginTop: 12,
            padding: "14px 16px",
            borderRadius: 10,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-xs)",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              marginBottom: 10,
            }}
          >
            Enter the 6-digit code sent to {meta.code} {mobile}
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <OtpDigitsInput
              value={userVal}
              onChange={(v) => onOtpStateChange({ ...otp, userVal: v })}
              autoFocus
            />
            <Btn
              variant="primary"
              disabled={userVal.length !== 6}
              onClick={verifyMobileOtp}
              style={{ height: 42, padding: "0 18px" }}
            >
              Verify
            </Btn>
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={handleSend}
              disabled={cooldown > 0}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "var(--font-xs)",
                fontWeight: 600,
                color: cooldown > 0 ? "var(--color-text-tertiary)" : "#ff9900",
                cursor: cooldown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Standard OTP block for email — same boxed-input treatment as mobile above.
function OtpBlock({
  target,
  sent,
  verified,
  onSend,
  onResend,
  onVerify,
  otpVal,
  setOtpVal,
  disabled,
}) {
  const [cooldown, startCooldown] = useResendCooldown(30);

  const handleSend = () => {
    sent ? onResend() : onSend();
    startCooldown();
  };

  if (verified) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 8,
          background: "#EAF3DE",
          border: "0.5px solid #C0DD97",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#3B6D11",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✓
        </span>
        <span style={{ fontSize: "var(--font-xs)", color: "#3B6D11", fontWeight: 600 }}>
          {target} verified successfully
        </span>
      </div>
    );
  }

  if (!sent) {
    return (
      <Btn
        variant="ghost"
        disabled={disabled}
        onClick={handleSend}
        style={{ fontSize: "var(--font-xs)", padding: "0 12px", height: 38 }}
      >
        Send OTP
      </Btn>
    );
  }

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 10,
        border: "0.5px solid var(--color-border-secondary)",
        background: "var(--color-background-secondary)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-xs)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: 10,
        }}
      >
        Enter the 6-digit code sent to your {target}
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <OtpDigitsInput value={otpVal} onChange={setOtpVal} autoFocus />
        <Btn
          variant="primary"
          disabled={otpVal.length !== 6}
          onClick={onVerify}
          style={{ height: 42, padding: "0 18px" }}
        >
          Verify
        </Btn>
      </div>
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          onClick={handleSend}
          disabled={cooldown > 0}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: "var(--font-xs)",
            fontWeight: 600,
            color: cooldown > 0 ? "var(--color-text-tertiary)" : "#ff9900",
            cursor: cooldown > 0 ? "not-allowed" : "pointer",
          }}
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CANDIDATE FORM
// ─────────────────────────────────────────────
function CandidateForm() {
  const router = useRouter();
  const showToast = useToast();
  const [socialAuth, setSocialAuth] = useState(null);

  const [attemptSubmit, setAttemptSubmit] = useState(false);
// shape: { provider: "google" | "linkedin", accessToken }
  const [otpToken, setOtpToken] = useState("");
  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    mobile: "",
    email: "",
  });

  const [mobileOtp, setMobileOtp] = useState({
    sent: false,
    verified: false,
    userVal: "",
  });

  const [emailOtp, setEmailOtp] = useState({
    sent: false,
    verified: false,
    userVal: "",
  });
  const [paymentData, setPaymentData] = useState({
    razorpayOrderId: "",
    razorpayPaymentId: "",
    razorpaySignature: ""
  });
  const [terms, setTerms] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [registering, setRegistering] = useState(false);
   const isSocialVerified = !!socialAuth;
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
useEffect(() => {
  const pending = sessionStorage.getItem("linkedinVerifiedState");
  if (pending) {
    const { accessToken, email, fullName, mobileNumber, countryCode } = JSON.parse(pending);
    setForm((p) => ({ ...p, name: fullName || p.name, email, mobile: mobileNumber || p.mobile, countryCode: countryCode || p.countryCode }));
    setEmailOtp((p) => ({ ...p, sent: true, verified: true }));
    setSocialAuth({ provider: "linkedin", accessToken });
    sessionStorage.removeItem("linkedinVerifiedState");
  }
}, []);
  const sendMobileOtp = async () => {
    try {
      const response = await sendOtp({
        identifier: form.mobile.replace(/\D/g, ""),
        countryCode: form.countryCode,
      });

      if (response.data.success) {
        setMobileOtp((p) => ({
          ...p,
          sent: true,
          verified: false,
          userVal: "",
        }));

        showToast(response.data.message, "success");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to send OTP",
        "error"
      );
    }
  };

  const verifyMobileOtp = async () => {
    try {
      const response = await verifyOtp({
        identifier: form.mobile.replace(/\D/g, ""),
        countryCode: form.countryCode,
        otpCode: mobileOtp.userVal,
      });
      if (response.data.success) {

        setOtpToken(response.data.otpToken);

        setMobileOtp((p) => ({
          ...p,
          verified: true,
        }));

        showToast("Mobile verified successfully", "success");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Invalid OTP",
        "error"
      );
    }
  };

  const sendEmail = async () => {
    try {
      const response = await sendOtp({
        identifier: form.email,
      });

      if (response.data.success) {
        setEmailOtp((p) => ({
          ...p,
          sent: true,
          verified: false,
          userVal: "",
        }));

        showToast(response.data.message, "success");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to send OTP",
        "error"
      );
    }
  };

  const verifyEmail = async () => {
    try {
      const response = await verifyOtp({
        identifier: form.email,
        otpCode: emailOtp.userVal,
      });

      if (response.data.success) {

        setOtpToken(response.data.otpToken);

        setEmailOtp((p) => ({
          ...p,
          verified: true,
        }));

        showToast("Email verified successfully", "success");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Invalid OTP",
        "error"
      );
    }
  };

  // Razorpay test payment ₹100
  const handlePay = async () => {
    try {
      setLoading(true);

      const key =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      if (!window.Razorpay || !key) {
        setLoading(false);

        setPaymentMessage(
          "Razorpay SDK or key missing."
        );

        return;
      }

      // Create order from backend
      const orderResponse =
        await createCandidateOrder({
          amount: 100,
        });

      const order = orderResponse.data;

      if (!order.success) {
        setLoading(false);

        setPaymentMessage(
          "Unable to create payment order."
        );

        return;
      }

      const options = {
        key,

        amount: order.amount * 100,

        currency: order.currency,

        order_id: order.orderId,

        name: "Job Box",

        description: "Candidate Registration Fee",

        handler: function (response) {

          console.log("RAZORPAY RESPONSE", response);

          const paymentInfo = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          setPaymentData(paymentInfo);

          setPayStatus("success");

          setPaymentMessage(
            `Payment successful. Reference: ${response.razorpay_payment_id}`
          );

          setLoading(false);

          // Payment succeeded — complete registration right away instead of
          // requiring a second click on "Create Account & Get Started".
          handleCandidateSubmit(paymentInfo);
        },

        prefill: {
          name: form.name,
          contact: form.mobile,
          email: form.email,
        },

        theme: {
          color: "#ff9900",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);

            setPaymentMessage(
              "Payment window closed before completion."
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();

    } catch (error) {

      console.error(
        "Razorpay initialization error",
        error
      );

      setLoading(false);

      setPaymentMessage(
        "Payment initialization failed."
      );

    }
  };

  
  const canShowPayment = mobileOtp.verified || emailOtp.verified;
  const canSubmit = canShowPayment && terms && payStatus === "success";

// paymentOverride lets the Razorpay success handler pass the just-received
// razorpayOrderId/PaymentId/Signature straight through, since React state
// (paymentData) hasn't re-rendered yet at that point in the callback.
const handleCandidateSubmit = async (paymentOverride) => {
    setAttemptSubmit(true);

  if (!form.name.trim()) {
    showToast("Please enter your full name.", "error");
    return;
  }

  if (!terms) {
    showToast("Please accept the Terms of Service to continue.", "error");
    return;
  }

  if (!socialAuth) {
    const hasVerifiedMobile = mobileOtp.verified;
    const hasVerifiedEmail = emailOtp.verified;

    if (!hasVerifiedMobile && !hasVerifiedEmail) {
      showToast("Please verify your mobile number or email address to continue.", "error");
      return;
    }

    // If they typed an email but never verified it, don't silently drop it —
    // ask them to finish verifying or clear the field.
    if (form.email.trim() && !emailOtp.verified) {
      showToast("Please verify your email address, or remove it to continue with mobile only.", "error");
      return;
    }
  }

  const payInfo = paymentOverride || paymentData;

  try {
    setRegistering(true);

    if (socialAuth) {
      const registerFn =
        socialAuth.provider === "google" ? registerWithGoogle : registerWithLinkedIn;

      const response = await registerFn({
        accessToken: socialAuth.accessToken,
        fullName: form.name,
        mobileNumber: form.mobile ? form.mobile.replace(/\D/g, "") : null,
        countryCode: form.mobile ? form.countryCode : null,
        termsAccepted: terms,
        razorpayOrderId: payInfo.razorpayOrderId,
        razorpayPaymentId: payInfo.razorpayPaymentId,
        razorpaySignature: payInfo.razorpaySignature,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        showToast(response.data.message, "success");
        setTimeout(() => router.push("/Login"), 1000);
      } else {
        showToast(response.data.message, "error");
      }
      return;
    }

    // existing OTP-based path — unchanged
    const response = await registerCandidate({
      fullName: form.name,
      mobileNumber: form.mobile.replace(/\D/g, ""),
      countryCode: form.countryCode,
      email: form.email,
      otpToken,
      razorpayOrderId: payInfo.razorpayOrderId,
      razorpayPaymentId: payInfo.razorpayPaymentId,
      razorpaySignature: payInfo.razorpaySignature,
      termsAccepted: terms,
    });

    showToast(response.data.message, "success");
    setTimeout(() => router.push("/Login"), 1000);
  }catch (err) {
  console.log("REGISTER ERROR", err);
  console.log("STATUS", err?.response?.status);
  console.log("DATA", err?.response?.data);

  showToast(
    err?.response?.data?.message || "Registration failed",
    "error"
  );
} finally {
  setRegistering(false);
}
};


const handleGoogleRegister = () => {
  if (typeof window === "undefined" || !window.google) {
    showToast("Google sign-in is still loading, try again", "error");
    return;
  }

  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    scope: "openid email profile",
    callback: async (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        showToast("Google sign-in failed", "error");
        return;
      }

      try {
        const response = await verifyWithGoogle({
          accessToken: tokenResponse.access_token,
        });

        if (response.data.success) {
          setForm((p) => ({
            ...p,
            name: response.data.fullName || p.name,
            email: response.data.email,
          }));
          setEmailOtp((p) => ({ ...p, sent: true, verified: true }));
          setSocialAuth({ provider: "google", accessToken: tokenResponse.access_token });
          showToast("Google account verified. Complete payment to finish.", "success");
        } else {
          showToast(response.data.message, "error");
        }
      } catch (err) {
        showToast(err?.response?.data?.message || "Verification failed", "error");
      }
    },
  });

  client.requestAccessToken();
};

const handleLinkedInRegister = () => {
  const redirectUri = `${window.location.origin}/linkedin/register`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "openid profile email",
  });

  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
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

    <Field
        label="Full Name"
        required
        error={attemptSubmit && !form.name.trim() ? "Full name is required" : null}
      >
        <Input
          placeholder="Enter your full name (e.g. Arjun Mehta)"
          value={form.name}
          disabled={isSocialVerified}
          error={attemptSubmit && !form.name.trim()}
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
          sendMobileOtp={sendMobileOtp}
          verifyMobileOtp={verifyMobileOtp}
          resendMobileOtp={sendMobileOtp}
        />
      </Field>

      <Field
  label="Email"
  hint={!form.email || isValidEmail(form.email) ? "Optional — verify to improve account security" : null}
  error={form.email && !isValidEmail(form.email) ? "Enter a complete, valid email address" : null}
>
  <Input
    type="email"
    placeholder="Enter your email address (e.g. john@example.com)"
    value={form.email}
    error={form.email && !isValidEmail(form.email)}
    disabled={isSocialVerified || emailOtp.verified}
    onChange={(e) => {
      const val = e.target.value;
      if (val && /^\d+$/.test(val)) return;
      set("email", val);
    }}
    style={{
      borderColor: emailOtp.verified ? "#3B6D11" : undefined,
      backgroundColor: emailOtp.verified ? "#f4f9f1" : undefined,
      color: emailOtp.verified ? "#2b4e0c" : undefined,
      border: emailOtp.verified ? "1px solid #3B6D11" : undefined,
    }}
  />
  {form.email && isValidEmail(form.email) && (
    <div style={{ marginTop: 8 }}>
      <OtpBlock
        target="email"
        sent={emailOtp.sent}
        verified={emailOtp.verified}
        disabled={!isValidEmail(form.email)}
        onSend={sendEmail}
        onResend={sendEmail}
        onVerify={verifyEmail}
        otpVal={emailOtp.userVal}
        setOtpVal={(v) =>
          setEmailOtp((p) => ({
            ...p,
            userVal: v,
          }))
        }
      />
    </div>
  )}
</Field>

      {canShowPayment && payStatus !== "success" && (
        <div style={{ marginBottom: 14 }}>
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
      )}

      {canShowPayment && (
        <Field label="Registration Fee">
          {payStatus === "success" ? (
            <Alert type="success">
              {registering
                ? "Payment successful — creating your account..."
                : "Payment successful for INR 100. Your receipt will be sent to your registered email."}
            </Alert>
          ) : (
            <>
              <Btn
                variant="primary"
                onClick={handlePay}
                disabled={loading || !terms}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  fontSize: "var(--font-sm)",
                }}
              >
                {loading ? "Processing..." : "Pay INR 100 via Razorpay"}
              </Btn>
              {!terms && (
                <p
                  style={{
                    fontSize: "var(--font-xs)",
                    marginTop: 8,
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Please accept the Terms of Service above to continue to payment.
                </p>
              )}
            </>
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

     {/* Social Register */}
{!socialAuth ? (
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
      onClick={handleGoogleRegister}
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
      onClick={handleLinkedInRegister}
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
) : (
  <Alert type="success">
    ✓ Verified via {socialAuth.provider === "google" ? "Google" : "LinkedIn"} — complete payment below to finish registration.
  </Alert>
)}
      </div>

      {/* Registration completes automatically once payment succeeds (see the
          Razorpay handler above). This button stays only as a manual fallback
          in case that auto-submit ever fails. */}
      {payStatus === "success" && (
        <Btn
          variant="primary"
          disabled={!canSubmit || registering}
          style={{ width: "100%", padding: "13px 0", fontSize: "var(--font-md)" }}
          onClick={() => handleCandidateSubmit()}
        >
          {registering ? "Creating your account..." : "Create Account & Get Started"}
        </Btn>
      )}
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
    stateIso: "",
    city: "",
    country: "",
    countryIso: "",
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
    mobileOtp: { sent: false, verified: false, userVal: "" },
    corpEmailOtp: { sent: false, verified: false, userVal: "" },
    profileStatus: "pending",
  });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [attempt1, setAttempt1] = useState(false);
  const [attempt2, setAttempt2] = useState(false);
  const [attempt3, setAttempt3] = useState(false);
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
        country: "India",
        countryIso: "IN",
        state: "Maharashtra",
        stateIso: getStateIso("IN", "Maharashtra"),
        city: "Mumbai",
        pincode: "400001",
        address: "Unit 4B, Trade Tower, Ballard Estate, Mumbai",
        gstRegDate: "2018-07-01",
      }));
      setOcrLoading(false);
    }, 1500);
  };
  const handleSendMobileOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      await saveStep3();

      const response = await sendMobileOtp(
        {
          mobileNumber: data.mobile.replace(/\D/g, ""),
          countryCode: data.countryCode,
        },
        sessionId,
      );

      setData((p) => ({
        ...p,
        mobileOtp: {
          ...p.mobileOtp,
          sent: true,
        },
      }));

      showToast(response.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };
  const handleVerifyMobileOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await verifyMobileOtp(
        {
          mobileNumber: data.mobile.replace(/\D/g, ""),
          countryCode: data.countryCode,
          mobileOtpCode: data.mobileOtp.userVal,
        },
        sessionId,
      );

      if (response.data.success) {
        setData((p) => ({
          ...p,
          mobileOtp: {
            ...p.mobileOtp,
            verified: true,
          },
        }));

        showToast("Mobile verified", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };

  const handleResendMobileOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await resendMobileOtp(sessionId);

      showToast(response.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };

  const sendCorpEmailOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await sendEmailOtp(
        {
          companyEmail: data.corpEmail,
        },
        sessionId,
      );

      setData((p) => ({
        ...p,
        corpEmailOtp: {
          ...p.corpEmailOtp,
          sent: true,
        },
      }));

      showToast(response.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };
  const verifyCorpEmailOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await verifyEmailOtp(
        {
          companyEmail: data.corpEmail,
          emailOtpCode: data.corpEmailOtp.userVal,
        },
        sessionId,
      );

      if (response.data.success) {
        setData((p) => ({
          ...p,
          corpEmailOtp: {
            ...p.corpEmailOtp,
            verified: true,
          },
        }));

        showToast("Email verified", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };

  const isGstnValid = !data.hasGst || data.gstn.trim().length === 15;
  const isStep2Valid = data.hasGst !== null && !!data.industry;
  const isStep3Valid =
    !!data.legalName &&
    !!data.state &&
    !!data.city &&
    !!data.country &&
    PIN_REGEX.test(data.pincode) &&
    !!data.address &&
    isGstnValid;
const isStep4Valid =
  data.contactName &&
  data.designation &&
  isValidEmail(data.contactPersonEmail) &&
  isValidEmail(data.corpEmail) &&
  isValidMobile(data.mobile, data.countryCode) &&
  data.mobileOtp.verified &&
  data.corpEmailOtp.verified;
  const canGoStep2 = EMPLOYER_UI_PREVIEW_MODE || isStep2Valid;
  const canGoStep3 = EMPLOYER_UI_PREVIEW_MODE || isStep3Valid;
  const canGoStep4 = EMPLOYER_UI_PREVIEW_MODE || isStep4Valid;
  const canSubmit = EMPLOYER_UI_PREVIEW_MODE || step === 5;

  useEffect(() => {
    const resume = async () => {
      const sessionId = localStorage.getItem("registrationSessionId");

      if (!sessionId) return;

      try {
        const response = await resumeRegistration(sessionId);

        if (!response.data.success) return;

        try {
          const session = response.data;
          console.log(response.data);
          // restore form values
          const step1 = session.step1Data || {};
          const step2 = session.step2Data || {};
          const step3 = session.step3Data || {};
          const step4 = session.step4Data || {};

          setData((p) => ({
            ...p,

            // STEP 1
            hasGst: step1.gstRegistered,
            industry: step1.industryType,

            // STEP 2
            legalName: step2.legalName || "",
            tradeName: step2.tradeName || "",

            businessType: step2.businessType || "",
            companySize: step2.companySize || "",

            gstn: step2.gstn || "",
            pan: step2.pan || "",
            cin: step2.cin || "",

            state: step2.state || "",
            stateIso: getStateIso(
              getCountryIso(step2.country || ""),
              step2.state || "",
            ),
            city: step2.city || "",
            country: step2.country || "",
            countryIso: getCountryIso(step2.country || ""),
            pincode: step2.pincode || "",
            address: step2.addressLine1 || "",

            officialWebsite: step2.websiteUrl || "",

            companyLogo: step2.companyLogoUrl
              ? {
                name: step2.companyLogoUrl.split("/").pop(),
                url: step2.companyLogoUrl,
              }
              : null,

            // STEP 3
            contactName: step3.contactPersonName || "",
            designation: step3.designation || "",

            contactPersonEmail: step3.contactPersonEmail || "",

            corpEmail: step3.companyEmail || "",

            mobile: step3.mobileNumber || "",

            countryCode: step3.countryCode || "+91",

            profileSummary: step3.companyDescription || "",

            mobileOtp: {
              ...p.mobileOtp,
              sent: !!step3.mobileNumber,
              verified: step3.mobileVerified || false,
            },

            corpEmailOtp: {
              ...p.corpEmailOtp,
              sent: !!step3.companyEmail,
              verified: step3.companyEmailVerified || false,
            },

            // STEP 4
            licDocs: [
              ...(step4.poeLicenceUrl
                ? [
                  {
                    id: "poe",
                    name: step4.poeLicenceUrl.split("/").pop(),
                    url: step4.poeLicenceUrl,
                  },
                ]
                : []),

              ...(step4.rpslLicenceUrl
                ? [
                  {
                    id: "rpsl",
                    name: step4.rpslLicenceUrl.split("/").pop(),
                    url: step4.rpslLicenceUrl,
                  },
                ]
                : []),
            ],
          }));
          console.log("hasGst being set to", session.gstRegistered);
          // move to next step
          setStep(Math.min(session.stepStatus.lastCompletedStep + 1, 5));
        } finally {
          setLoadingResume(false);
        }
      } catch (err) {
        console.log("Resume failed", err);
      }
    };

    resume();
  }, []);
  const [attempt5, setAttempt5] = useState(false);
  const handleEmployerSubmit = async () => {
    setAttempt5(true);
    if (!termsAccepted) {
      showToast("Please accept the Terms of Service to continue.", "warning");
      return;
    }
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await submitRegistration({
        sessionId,
        consentGiven: termsAccepted,
      });

      if (response.data.success) {
        showToast("Registration completed", "success");

        router.push("/Login");
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
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

  const handleStep1 = async () => {
    try {
      const response = await gstCheck({
        gstRegistered: data.hasGst,
        industryType: data.industry,
      });

      if (response.data.success) {
        localStorage.setItem(
          "registrationSessionId",
          response.data.registrationSessionId,
        );

        setStep(2);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };
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
                  : attempt1 && data.hasGst === null
                    ? "1px solid #E24B4A"
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

      {attempt1 && data.hasGst === null && (
        <p style={{ fontSize: "var(--font-xs)", color: "#E24B4A", marginTop: -12, marginBottom: 16, fontWeight: 500 }}>
          Please select whether your company is GST registered.
        </p>
      )}

      <Field
        label="Industry Type"
        required
        hint="Start typing to search, or pick from the list — you can also enter your own industry."
        error={attempt1 && !data.industry ? "Industry type is required" : null}
      >
        <Combobox
          value={data.industry}
          onChange={(v) => set("industry", v)}
          options={INDUSTRIES}
          placeholder="Type or select your industry (e.g. IT Services, Manufacturing)"
          error={attempt1 && !data.industry}
        />
      </Field>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
        <Btn
          variant="primary"
          onClick={() => {
            setAttempt1(true);
            if (data.hasGst === null || !data.industry.trim()) return;
            handleStep1();
          }}
        >
          Continue →
        </Btn>
      </div>
    </div>
  );

  const handleStep2 = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const formData = new FormData();

      formData.append("legalName", data.legalName);
      formData.append("tradeName", data.tradeName);
      formData.append("businessType", data.businessType);
      formData.append("companySize", data.companySize);
      formData.append("cin", data.cin);
      formData.append("state", data.state);
      formData.append("city", data.city);
      formData.append("country", data.country || "India");
      formData.append("pincode", data.pincode);
      formData.append("addressLine1", data.address);
      formData.append("websiteUrl", data.officialWebsite);
      formData.append("gstn", data.gstn);
      formData.append("pan", data.pan);

      formData.append("companyDisplayName", data.tradeName || data.legalName);

      formData.append("addressLine2", "");

      formData.append("industryType", data.industry);

      formData.append("gstnRegistrationDate", data.gstRegDate);

      if (data.companyLogo) formData.append("companyLogo", data.companyLogo);

      const response = await saveCompanyDetails(formData, sessionId);

      if (response.data.success) {
        setStep(3);
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };
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
            error={
              attempt2 && data.hasGst && !isGstnValid
                ? "GSTN must be exactly 15 characters"
                : attempt2 &&
                    data.hasGst &&
                    data.gstn.length === 15 &&
                    !GSTIN_REGEX.test(data.gstn)
                  ? "This doesn't look like a valid GSTN format — please double-check"
                  : null
            }
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                value={data.gstn}
                onChange={(e) => set("gstn", e.target.value.toUpperCase())}
                placeholder="Enter your 15-character GSTN (e.g. 27AAPFU0939F1ZV)"
                maxLength={15}
                error={attempt2 && data.hasGst && !isGstnValid}
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
        <Field
          label="Legal / Company Name"
          required
          error={attempt2 && !data.legalName ? "Legal / company name is required" : null}
        >
          <Input
            value={data.legalName}
            error={attempt2 && !data.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            placeholder="Enter your registered company name (e.g. Acme Pvt. Ltd.)"
            style={{
              background: data.hasGst && data.legalName ? "#ffffff" : undefined,
            }}
          />
        </Field>
        <Field label="Trade Name" hint="Brand / display name">
          <Input
            value={data.tradeName}
            onChange={(e) => set("tradeName", e.target.value)}
            placeholder="Enter your brand/trade name (e.g. Acme)"
          />
        </Field>

        {/* PAN only for GST employers (pre-filled from GSTN) */}
        {data.hasGst && (
          <Field label="PAN" hint="Auto-filled from GSTN for GST users">
            <Input
              value={data.pan}
              onChange={(e) => set("pan", e.target.value.toUpperCase())}
              placeholder="Enter your 10-character PAN (e.g. AAPFU0939F)"
              maxLength={10}
              style={{
                fontFamily: "monospace",
                background: data.pan ? "#ffffff" : undefined,
              }}
            />
          </Field>
        )}

        <Field
          label="Business Type"
          hint="Start typing to search, or pick from the list"
        >
          <Combobox
            value={data.businessType}
            onChange={(v) => set("businessType", v)}
            options={BUSINESS_TYPES}
            placeholder="Type or select business type (e.g. Private Limited)"
          />
        </Field>
        <Field label="Company Size">
          <Combobox
            value={data.companySize}
            onChange={(v) => set("companySize", v)}
            options={COMPANY_SIZES}
            placeholder="Type or select company size (e.g. 51-200 employees)"
          />
        </Field>
        <Field label="Company Type">
          <Combobox
            value={data.companyType}
            onChange={(v) => set("companyType", v)}
            options={COMPANY_TYPES}
            placeholder="Type or select company type (e.g. Product-based)"
          />
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
            placeholder="Enter your CIN, if applicable (e.g. U74999MH2018PTC123456)"
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
        <Field
          label="Country"
          required
          error={attempt2 && !data.country ? "Country is required" : null}
        >
          <Combobox
            value={data.country}
            error={attempt2 && !data.country}
            onChange={(v) => {
              const iso = getCountryIso(v);
              setData((p) => ({
                ...p,
                country: v,
                countryIso: iso,
                // Changing the country invalidates whatever state/city was
                // previously picked for a different country.
                state: "",
                stateIso: "",
                city: "",
              }));
            }}
            options={COUNTRY_NAMES}
            placeholder="Type or select your country (e.g. India)"
          />
        </Field>
        <Field
          label="State"
          required
          error={attempt2 && !data.state ? "State is required" : null}
        >
          <Combobox
            value={data.state}
            error={attempt2 && !data.state}
            disabled={!data.countryIso}
            onChange={(v) => {
              const iso = getStateIso(data.countryIso, v);
              setData((p) => ({
                ...p,
                state: v,
                stateIso: iso,
                city: "",
              }));
            }}
            options={getStateNamesForCountry(data.countryIso)}
            placeholder={
              data.countryIso
                ? "Type or select your state (e.g. Maharashtra)"
                : "Select a country first"
            }
          />
        </Field>
        <Field
          label="City"
          required
          error={attempt2 && !data.city ? "City is required" : null}
        >
          <Combobox
            value={data.city}
            error={attempt2 && !data.city}
            disabled={!data.stateIso}
            onChange={(v) => set("city", v)}
            options={getCityNamesForState(data.countryIso, data.stateIso)}
            placeholder={
              data.stateIso
                ? "Type or select your city (e.g. Mumbai)"
                : "Select a state first"
            }
          />
        </Field>
        <Field
          label="PIN Code"
          required
          error={
            attempt2 && !data.pincode
              ? "PIN code is required"
              : attempt2 && !PIN_REGEX.test(data.pincode)
                ? "Enter a valid 6-digit PIN code"
                : null
          }
        >
          <Input
            value={data.pincode}
            maxLength={6}
            error={attempt2 && !PIN_REGEX.test(data.pincode)}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
            placeholder="Enter your 6-digit PIN code (e.g. 400001)"
            style={{
              background: data.hasGst && data.pincode ? "#ffffff" : undefined,
            }}
          />
        </Field>
        <Field label="Official Website">
          <Input
            value={data.officialWebsite}
            onChange={(e) => set("officialWebsite", e.target.value)}
            placeholder="Enter your company website (e.g. https://www.company.com)"
          />
        </Field>
      </div>

      <Field
        label="Full Registered Address"
        required
        error={attempt2 && !data.address ? "Full registered address is required" : null}
      >
        <Input
          value={data.address}
          error={attempt2 && !data.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter your full registered address (e.g. 4th Floor, Business Park, Andheri, Mumbai, MH, 400001)"
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
                Any image format · Max 2 MB · Recommended 200×200px
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
          disabled={ocrLoading}
          onClick={() => {
            setAttempt2(true);
            if (!isStep3Valid) return;
            handleStep2();
          }}
        >
          Continue →
        </Btn>
      </div>
    </div>
  );
  const saveStep3 = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await saveContactDetails(
        {
          contactPersonName: data.contactName,
          designation: data.designation,
          contactPersonEmail: data.contactPersonEmail,
          companyEmail: data.corpEmail,
          mobileNumber: data.mobile,
          countryCode: data.countryCode,
          companyDescription: data.profileSummary,
        },
        sessionId,
      );

      if (response.data.success) {
        showToast(response.data.message, "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };

  const handleResendEmailOtp = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const response = await resendEmailOtp(sessionId);

      showToast(response.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message, "error");
    }
  };
  // ── Step 3: Contact & OTP ─────────────────
 const renderStep3 = () => {
  const contactEmailTouched = data.contactPersonEmail.length > 0;
  const contactEmailValid = isValidEmail(data.contactPersonEmail);
  const corpEmailTouched = data.corpEmail.length > 0;
  const corpEmailValid = isValidEmail(data.corpEmail);

  return (
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
        <Field
          label="Contact Person Name"
          required
          error={attempt3 && !data.contactName ? "Contact person name is required" : null}
        >
          <Input
            value={data.contactName}
            error={attempt3 && !data.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            placeholder="Enter contact person's full name (e.g. Arjun Mehta)"
          />
        </Field>
        <Field
          label="Designation"
          required
          error={attempt3 && !data.designation ? "Designation is required" : null}
        >
          <Input
            value={data.designation}
            error={attempt3 && !data.designation}
            onChange={(e) => set("designation", e.target.value)}
            placeholder="Enter their designation/role (e.g. HR Manager)"
          />
        </Field>
        <Field
          label="Contact Person Email"
          required
          error={
            contactEmailTouched && !contactEmailValid
              ? "Enter a valid email address"
              : null
          }
        >
          <Input
            type="email"
            value={data.contactPersonEmail}
            error={contactEmailTouched && !contactEmailValid}
            onChange={(e) => {
              const val = e.target.value;
              if (val && /^\d+$/.test(val.trim())) return;
              set("contactPersonEmail", val.trim());
            }}
            placeholder="Enter contact person's email (e.g. contact@personal.com)"
          />
        </Field>
      </div>

      <Field
        label="Company Email"
        required
        error={
          corpEmailTouched && !corpEmailValid
            ? "Enter a valid company email address"
            : null
        }
      >
        <Input
          type="email"
          value={data.corpEmail}
          error={corpEmailTouched && !corpEmailValid && !data.corpEmailOtp.verified}
          disabled={data.corpEmailOtp.verified}
          onChange={(e) => {
            const val = e.target.value;
            if (val && /^\d+$/.test(val.trim())) return;
            set("corpEmail", val.trim());
          }}
          placeholder="Enter your official company email (e.g. hr@yourcompany.com)"
          style={{
            borderColor: data.corpEmailOtp.verified ? "#3B6D11" : undefined,
            backgroundColor: data.corpEmailOtp.verified ? "#f4f9f1" : undefined,
            color: data.corpEmailOtp.verified ? "#2b4e0c" : undefined,
            border: data.corpEmailOtp.verified ? "1px solid #3B6D11" : undefined,
          }}
        />

        {data.corpEmail && corpEmailValid && (
          <div style={{ marginTop: 8 }}>
            <OtpBlock
              target="corporate email"
              sent={data.corpEmailOtp.sent}
              verified={data.corpEmailOtp.verified}
              disabled={!corpEmailValid}
              onSend={sendCorpEmailOtp}
              onResend={handleResendEmailOtp}
              onVerify={verifyCorpEmailOtp}
              otpVal={data.corpEmailOtp.userVal}
              setOtpVal={(v) =>
                setData((p) => ({
                  ...p,
                  corpEmailOtp: { ...p.corpEmailOtp, userVal: v.replace(/\D/g, "") },
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
          sendMobileOtp={handleSendMobileOtp}
          verifyMobileOtp={handleVerifyMobileOtp}
          resendMobileOtp={handleResendMobileOtp}
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

      {attempt3 && !isStep4Valid && (
        <Alert type="error">
          Please complete all required fields and verify both your mobile
          number and company email before continuing.
        </Alert>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Btn variant="outline" onClick={() => setStep(2)}>
          ← Back
        </Btn>
       <Btn
  variant="primary"
  onClick={async () => {
    setAttempt3(true);
    if (!isStep4Valid) return;
    await saveStep3();
    setStep(4);
  }}
>
  Continue →
</Btn>
      </div>
    </div>
  );
};
  const handleStep4 = async () => {
    try {
      const sessionId = localStorage.getItem("registrationSessionId");

      const formData = new FormData();

      // Find files
      const poeDoc = data.licDocs.find((x) => x.id === "poe");

      const rpslDoc = data.licDocs.find((x) => x.id === "rpsl");

      if (!poeDoc || !rpslDoc) {
        showToast("Both POE and RPSL licences are required.", "error");
        return;
      }

      formData.append("PoeLicence", poeDoc.file);

      formData.append("RpslLicence", rpslDoc.file);

      const response = await uploadLicences(formData, sessionId);

      if (response.data.success) {
        showToast(response.data.message, "success");

        setStep(5);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Licence upload failed.",
        "error",
      );
    }
  };
  // ── Step 4: Licence Upload ────────────────
  // const renderStep4 = () => (
  //   <div>
  //     <h3
  //       style={{
  //         fontSize: "var(--font-md)",
  //         fontWeight: 600,
  //         marginBottom: 4,
  //         color: "var(--color-text-primary)",
  //       }}
  //     >
  //       Licence & document upload
  //       <span
  //         style={{
  //           fontSize: "var(--font-xs)",
  //           fontWeight: 400,
  //           color: "var(--color-text-tertiary)",
  //           marginLeft: 10,
  //           background: "var(--color-background-secondary)",
  //           padding: "2px 8px",
  //           borderRadius: 6,
  //         }}
  //       >
  //         Optional
  //       </span>
  //     </h3>
  //     <p
  //       style={{
  //         fontSize: "var(--font-sm)",
  //         color: "var(--color-text-secondary)",
  //         marginBottom: 20,
  //         lineHeight: 1.5,
  //       }}
  //     >
  //       Upload recruitment licences to earn trust badges displayed on all job
  //       listings.
  //     </p>
  //     <Alert type="info">
  //       <strong>Blue Tick</strong> requires: GST Verified + one active licence +
  //       corporate domain email — all simultaneously.
  //     </Alert>
  //     <div
  //       style={{
  //         marginTop: 12,
  //         marginBottom: 14,
  //         display: "inline-flex",
  //         alignItems: "center",
  //         gap: 8,
  //         padding: "8px 12px",
  //         borderRadius: 8,
  //         border: "1px solid rgba(255, 163, 0, 0.32)",
  //         background: "#fff8ee",
  //         color: "#8a5a00",
  //         fontSize: "var(--font-xs)",
  //         fontWeight: 600,
  //       }}
  //     >
  //       <i className="fi fi-rr-lock" />
  //       Documents uploaded for verification are private and are not shared with
  //       candidates.
  //     </div>
  //     <div
  //       style={{
  //         display: "grid",
  //         gridTemplateColumns: "1fr 1fr",
  //         gap: 14,
  //         marginBottom: 14,
  //       }}
  //     >
  //       {[
  //         {
  //           id: "poe",
  //           label: "Recruitment Licence",
  //           badge: "Recruitment Licensed",

  //           color: "#3B6D11",
  //           bg: "#EAF3DE",
  //           desc: "Recruitment licence for overseas placement",
  //         },
  //         {
  //           id: "rpsl",
  //           label: "RPSL Licence",
  //           badge: "RPSL Licensed",
  //           color: "#0F6E56",
  //           bg: "#E1F5EE",
  //           desc: "Shipping recruitment licence for vessel placements",
  //         },
  //       ].map((lic) => {
  //         const file = data.licDocs.find((d) => d.id === lic.id);
  //         return (
  //           <div key={lic.id}>
  //             <p
  //               style={{
  //                 fontSize: "var(--font-xs)",
  //                 fontWeight: 600,
  //                 color: "var(--color-text-secondary)",
  //                 marginBottom: 8,
  //               }}
  //             >
  //               {lic.label}
  //             </p>
  //             <div
  //               onClick={() => licRef.current?.click()}
  //               style={{
  //                 border: "1px dashed var(--color-border-secondary, #ffc151)",
  //                 borderRadius: 8,
  //                 padding: "24px 16px",
  //                 textAlign: "center",
  //                 cursor: "pointer",
  //                 background: file
  //                   ? "#EAF3DE"
  //                   : "var(--color-background-secondary)",
  //               }}
  //             >
  //               {file ? (
  //                 <p
  //                   style={{
  //                     fontSize: "var(--font-xs)",
  //                     color: "#3B6D11",
  //                     fontWeight: 600,
  //                   }}
  //                 >
  //                   ✓ {file.name}
  //                 </p>
  //               ) : (
  //                 <>
  //                   <p style={{ fontSize: "var(--font-xl)", opacity: 0.3 }}>
  //                     ↑
  //                   </p>
  //                   <p
  //                     style={{
  //                       fontSize: "var(--font-xs)",
  //                       color: "var(--color-text-secondary)",
  //                     }}
  //                   >
  //                     Upload {lic.label}
  //                   </p>
  //                   <p
  //                     style={{
  //                       fontSize: "var(--font-xs)",
  //                       color: "var(--color-text-tertiary)",
  //                       marginTop: 3,
  //                     }}
  //                   >
  //                     PDF / JPG / PNG · Max 5 MB
  //                   </p>
  //                 </>
  //               )}
  //             </div>
  //             <input
  //               type="file"
  //               accept=".pdf,.jpg,.jpeg,.png"
  //               style={{ display: "none" }}
  //               onChange={(e) => {
  //                 const f = e.target.files?.[0];
  //                 if (f)
  //                   setData((p) => ({
  //                     ...p,
  //                     licDocs: [
  //                       ...p.licDocs.filter((d) => d.id !== lic.id),
  //                       { id: lic.id, name: f.name, file: f },
  //                     ],
  //                   }));
  //               }}
  //             />
  //             <div
  //               style={{
  //                 marginTop: 8,
  //                 padding: "8px 10px",
  //                 background: lic.bg,
  //                 borderRadius: 6,
  //                 fontSize: "var(--font-xs)",
  //                 color: lic.color,
  //               }}
  //             >
  //               Awards: <strong>{lic.badge}</strong> badge
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         marginTop: 8,
  //       }}
  //     >
  //       <Btn variant="outline" onClick={() => setStep(3)}>
  //         ← Back
  //       </Btn>
  //       <div style={{ display: "flex", gap: 10 }}>
  //         <Btn
  //           variant="ghost"
  //           onClick={() => setStep(5)}
  //         >
  //           Skip for now
  //         </Btn>
  //         <Btn variant="primary" onClick={handleStep4}>
  //           Continue →
  //         </Btn>
  //       </div>
  //     </div>
  //   </div>
  // );

  const [attempt4, setAttempt4] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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
        <span style={{ color: "#E24B4A", marginLeft: 6 }}>*</span>
      </h3>

      <p
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Both licences below are required to complete your registration and
        also earn trust badges displayed on all job listings.
      </p>

      <Alert type="info">
        <strong>Blue Tick</strong> requires: GST Verified + one active licence +
        corporate domain email — all simultaneously.
      </Alert>

      {attempt4 && (!data.licDocs.find((d) => d.id === "poe") || !data.licDocs.find((d) => d.id === "rpsl")) && (
        <Alert type="error">
          Both the Recruitment Licence and RPSL Licence are required — please
          upload both files to continue.
        </Alert>
      )}

      <div
        style={{
          marginTop: 12,
          marginBottom: 14,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,163,0,.32)",
          background: "#fff8ee",
          color: "#8a5a00",
          fontSize: "var(--font-xs)",
          fontWeight: 600,
        }}
      >
        <i className="fi fi-rr-lock" />
        Documents uploaded for verification are private and are not shared with
        candidates.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 14,
          width: "100%",
        }}
      >
        {[
          {
            id: "poe",
            label: "Recruitment Licence",
            badge: "Recruitment Licensed",
            color: "#3B6D11",
            bg: "#EAF3DE",
          },
          {
            id: "rpsl",
            label: "RPSL Licence",
            badge: "RPSL Licensed",
            color: "#0F6E56",
            bg: "#E1F5EE",
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

              {/* Hidden Input */}
              <input
                id={`file-${lic.id}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];

                  if (!f) return;

                  setData((prev) => ({
                    ...prev,
                    licDocs: [
                      ...prev.licDocs.filter((d) => d.id !== lic.id),
                      {
                        id: lic.id,
                        name: f.name,
                        file: f,
                      },
                    ],
                  }));
                }}
              />

              {/* Upload Box */}
              <div
                onClick={() =>
                  document.getElementById(`file-${lic.id}`)?.click()
                }
                style={{
                  border: attempt4 && !file
                    ? "1px dashed #E24B4A"
                    : "1px dashed var(--color-border-secondary,#ffc151)",
                  borderRadius: 8,
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: file
                    ? "#EAF3DE"
                    : "var(--color-background-secondary)",
                  transition: ".2s",

                  minHeight: "95px",      // Makes both boxes same height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",

                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {file ? (
                  <>
                    <p
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "#3B6D11",
                        fontWeight: 600,

                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",

                        lineHeight: "18px",
                        minHeight: "18px",
                      }}
                      title={file.name}
                    >
                      ✓ {file.name}
                    </p>

                    <p
                      style={{
                        marginTop: 8,
                        fontSize: "var(--font-xs)",
                        color: "#666",
                      }}
                    >
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: "var(--font-xl)",
                        opacity: 0.3,
                      }}
                    >
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
          <Btn
            variant="primary"
            onClick={() => {
              setAttempt4(true);
              handleStep4();
            }}
          >
            Continue →
          </Btn>
        </div>
      </div>
    </div>
  );

  const ReviewSection = ({ icon, title, editStep, children }) => (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(18,35,89,0.08)",
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg,#122359,#1e3a8a)",
              color: "#ffa300",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            <i className={icon} />
          </span>
          <p
            style={{
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              color: "#122359",
              margin: 0,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </p>
        </div>
        {editStep && (
          <button
            type="button"
            onClick={() => setStep(editStep)}
            style={{
              background: "none",
              border: "none",
              color: "#ff9900",
              fontSize: "var(--font-xs)",
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            <i className="fi fi-rr-pencil" style={{ marginRight: 4 }} />
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );

  const ReviewRow = ({ label, val, mono }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid #f1f4fb",
        fontSize: "var(--font-sm)",
      }}
    >
      <span style={{ color: "#66789c" }}>{label}</span>
      {val ? (
        <span
          style={{
            fontFamily: mono ? "monospace" : undefined,
            fontWeight: 600,
            color: "#122359",
            textAlign: "right",
            maxWidth: "60%",
          }}
        >
          {val}
        </span>
      ) : (
        <span style={{ color: "#b6c0d6", fontStyle: "italic", fontSize: "var(--font-xs)" }}>
          Not provided
        </span>
      )}
    </div>
  );

  const VerifyPill = ({ ok, label }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: "var(--font-xs)",
        fontWeight: 700,
        background: ok ? "#DCFCE7" : "#FEF3C7",
        color: ok ? "#166534" : "#92400E",
      }}
    >
      <i className={ok ? "fi fi-rr-check" : "fi fi-rr-clock"} style={{ fontSize: 10 }} />
      {label}
    </span>
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
          marginBottom: 18,
        }}
      >
        Confirm all details before creating your account. Use{" "}
        <strong>Edit</strong> on any section to make changes.
      </p>

      {/* ── Verification status strip ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "12px 14px",
          marginBottom: 20,
          background: "#F8FAFF",
          border: "1px solid rgba(18,35,89,0.08)",
          borderRadius: 14,
        }}
      >
        <VerifyPill ok={!!data.hasGst} label={data.hasGst ? "GST Verified" : "Non-GST entity"} />
        <VerifyPill ok={data.mobileOtp.verified} label={data.mobileOtp.verified ? "Mobile Verified" : "Mobile Pending"} />
        <VerifyPill ok={data.corpEmailOtp.verified} label={data.corpEmailOtp.verified ? "Email Verified" : "Email Pending"} />
        <VerifyPill
          ok={data.licDocs.length === 2}
          label={data.licDocs.length === 2 ? "Licences Uploaded" : "Licences Pending"}
        />
      </div>

      <ReviewSection icon="fi fi-rr-briefcase" title="Company Details" editStep={2}>
        <ReviewRow label="Legal name" val={data.legalName} />
        <ReviewRow label="Trade name" val={data.tradeName} />
        {data.hasGst && <ReviewRow label="GSTN" val={data.gstn} mono />}
        {data.hasGst && <ReviewRow label="PAN" val={data.pan} mono />}
        <ReviewRow label="Business type" val={labelFor(BUSINESS_TYPES, data.businessType)} />
        <ReviewRow label="Company size" val={labelFor(COMPANY_SIZES, data.companySize)} />
        <ReviewRow label="Company type" val={labelFor(COMPANY_TYPES, data.companyType)} />
        <ReviewRow label="Industry" val={data.industry} />
        {data.hasGst && <ReviewRow label="GST reg. date" val={data.gstRegDate} />}
        <ReviewRow label="CIN" val={data.cin} mono />
        <ReviewRow label="Website" val={data.officialWebsite} />
      </ReviewSection>

      <ReviewSection icon="fi fi-rr-marker" title="Registered Address" editStep={2}>
        <ReviewRow
          label="Address"
          val={
            data.address
              ? `${data.address}, ${data.city}, ${data.state} – ${data.pincode}, ${data.country}`
              : ""
          }
        />
      </ReviewSection>

      <ReviewSection icon="fi fi-rr-user" title="Contact & Verification" editStep={3}>
        <ReviewRow label="Contact person" val={data.contactName} />
        <ReviewRow label="Designation" val={data.designation} />
        <ReviewRow label="Personal email" val={data.contactPersonEmail} />
        <ReviewRow
          label="Company email"
          val={data.corpEmail ? `${data.corpEmail}${data.corpEmailOtp.verified ? "  ✓ Verified" : ""}` : ""}
        />
        <ReviewRow
          label="Mobile"
          val={data.mobile ? `${data.countryCode} ${data.mobile}${data.mobileOtp.verified ? "  ✓ Verified" : ""}` : ""}
        />
      </ReviewSection>

      <ReviewSection icon="fi fi-rr-document" title="Documents & Licences" editStep={4}>
        <ReviewRow
          label="Company logo"
          val={data.companyLogo ? `✓ ${data.companyLogo.name}` : ""}
        />
        <ReviewRow
          label="Licences"
          val={
            data.licDocs.length > 0
              ? data.licDocs.map((d) => d.id.toUpperCase()).join(", ")
              : ""
          }
        />
        <ReviewRow label="GST registered" val={data.hasGst ? "Yes" : "No"} />
      </ReviewSection>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          marginBottom: 8,
          borderRadius: 12,
          border: attempt5 && !termsAccepted ? "1px solid #E24B4A" : "1px solid rgba(18,35,89,0.08)",
          background: attempt5 && !termsAccepted ? "#FFF5F5" : "#F8FAFF",
        }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: "#ff9900" }}
        />
        <label style={{ fontSize: "var(--font-xs)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          I agree to the Terms of Service and Employer Policy, and confirm
          that the details provided above are accurate.
        </label>
      </div>
      {attempt5 && !termsAccepted && (
        <p style={{ fontSize: "var(--font-xs)", color: "#E24B4A", marginTop: 0, marginBottom: 14, fontWeight: 500 }}>
          Please accept the terms to continue.
        </p>
      )}

      <Btn
        variant="primary"
        style={{ width: "100%", padding: "13px 0", fontSize: "var(--font-md)", marginTop: 6 }}
        onClick={handleEmployerSubmit}
      >
        Create Account 
      </Btn>
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
  // Coming in via a direct link (the header's Register ▸ Candidate/Employer
  // menu) locks the page to that one role — no tab to switch away from it.
  // Only a plain /register visit (no type in the URL) shows both tiles so
  // the visitor can choose.
  const lockedRole =
    typeParam === "candidate" || typeParam === "employer" ? typeParam : null;
  const [role, setRole] = useState(lockedRole);

  // Client-side navigation (e.g. clicking Register ▸ Employer while already
  // on /register?type=candidate) changes the URL without remounting this
  // component, so the `role` state above — set only once on first mount —
  // would otherwise keep showing whichever form loaded first. Keep it in
  // sync with the URL whenever the locked-in type actually changes.
  useEffect(() => {
    setRole(lockedRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedRole]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src="/assets/imgs/page/login-register/img-3.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -90,
          bottom: -26,
          width: "min(520px, 50vw)",
          opacity: 0.13,
          pointerEvents: "none",
          userSelect: "none",
          filter: "var(--theme-image-palette-filter)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-2.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -120,
          top: -42,
          width: "min(560px, 52vw)",
          opacity: 0.1,
          pointerEvents: "none",
          userSelect: "none",
          filter: "var(--theme-image-palette-filter)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-6.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 26,
          left: 22,
          width: "min(96px, 13vw)",
          opacity: 0.2,
          pointerEvents: "none",
          userSelect: "none",
          filter: "var(--theme-image-palette-filter)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-4.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 24,
          right: 26,
          width: "min(132px, 16vw)",
          opacity: 0.2,
          pointerEvents: "none",
          userSelect: "none",
          filter: "var(--theme-image-palette-filter)",
        }}
      />
      <div
        style={{
          maxWidth: role === "employer" ? 820  : 460,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
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
            <img src="assets/imgs/template/logo.svg"/>
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
          className="auth-shadow-card"
          style={{
            background: "#ffffff",
            border: "none",
            borderRadius: 24,
           padding: role === "employer" ? "40px 44px" : "38px 34px",
            marginBottom: 0,
            boxSizing: "border-box",
          }}
        >
          {/* Role selector — only shown when no role was locked in via URL */}
        {!role ? (
  <div style={{ marginBottom: 8 }}>
    <p style={{ fontSize: "var(--font-xs)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 12 }}>
      I am registering as…
    </p>
    <div style={{ display: "flex", gap: 12 }}>
      {[
        { val: "candidate", icon: "👤", label: "Job Seeker / Candidate", sub: "Find jobs, build profile" },
        { val: "employer", icon: "🏢", label: "Employer / Company", sub: "Post jobs, hire talent" },
      ].map((r) => (
        <div
          key={r.val}
          onClick={() => setRole(r.val)}
          style={{
            flex: 1,
            padding: "18px 14px",
            borderRadius: 10,
            cursor: "pointer",
            border: "1px solid var(--color-border-secondary, #C7D2E0)",
            background: "var(--color-background-secondary)",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
              {r.label}
            </div>
            <div style={{ fontSize: "var(--font-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
              {r.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  !lockedRole && (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-secondary)" }}>
        Registering as{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>
          {role === "candidate" ? "Job Seeker / Candidate" : "Employer / Company"}
        </strong>
      </span>
      <button
        type="button"
        onClick={() => setRole(null)}
        style={{
          background: "none",
          border: "none",
          color: "#ff9900",
          fontWeight: 600,
          fontSize: "var(--font-xs)",
          cursor: "pointer",
        }}
      >
        Change
      </button> */}
    </div>
  )
)}

          {role === "candidate" && <CandidateForm />}
          {role === "employer" && <EmployerForm />}

          {!role && !lockedRole && (
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