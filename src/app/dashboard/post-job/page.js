"use client"; 
 
import React, { useState, useEffect, useRef, useMemo } from "react"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link"; 
import styles from "./post-job.module.css"; 
import { useToast } from "@/components/Toast"; 
 
import currencyCodes from "currency-codes"; 
import countries from "world-countries"; 
import JobPreviewModal from "@/components/JobPreviewModal"; 
import { mapResumeToForm } from "@/utils/jobFormMapper"; 
 
 
 
const countryOptions = countries 
  .map((country) => country.name.common) 
  .sort((a, b) => a.localeCompare(b)); 
 
const currencies = currencyCodes.data.map((currency) => ({ 
  value: currency.code, 
  label: `${currency.code} - ${currency.currency}`, 
})); 
 
import { 
  saveJobDetails, 
  saveCompensation, 
  saveSkills, 
  saveEligibility, 
  saveLocation, 
  saveQuestions, 
  publishJob, 
  saveDraft, 
  getJobResume, 
  generateJobDescription, 
  getInlineSuggestion, 
  searchRoles, 
  suggestSkills, 
} from "@/services/recruiter/recruiterJobPostService"; 
 
/* ─── static data ─────────────────────────────────────────────────────────── */ 
const roleCategories = [ 
  "Welding", 
  "Fabrication", 
  "Electrician", 
  "Plumber", 
  "Machine Operator", 
  "Marine Crew", 
  "Warehouse", 
  "Carpenter", 
  "Mason", 
  "Painter", 
  "HVAC Technician", 
  "Rigger", 
  "Scaffolder", 
  "Crane Operator", 
  "Forklift Operator", 
  "Mechanic", 
  "Diesel Mechanic", 
  "Pipefitter", 
  "Boilermaker", 
  "Insulation Technician", 
  "Sheet Metal Worker", 
  "CNC Operator", 
  "Quality Inspector", 
  "Safety Officer", 
  "Logistics Coordinator", 
  "Driver", 
  "Security Guard", 
  "Housekeeping Staff", 
  "Chef / Cook", 
  "Waiter / Steward", 
  "Technician (General)", 
  "Civil Engineer", 
  "Site Supervisor", 
  "Store Keeper", 
  "Data Entry Operator", 
  "Customer Service Executive", 
  "Other", 
]; 
const jobPostTypes = [ 
  { label: "Regular Hiring", value: "Regular_Hiring" }, 
  { label: "Hot Vacancy", value: "Hot_Vacancy" }, 
  { label: "Urgent Hiring", value: "Urgent_Hiring" }, 
  { label: "Bulk Hiring", value: "Bulk_Hiring" }, 
  { label: "Classified", value: "Classified" }, 
]; 
const employmentTypeOptions = [ 
  { label: "Full Time", value: "Full_Time" }, 
  { label: "Part Time", value: "Part_Time" }, 
  { label: "Contract", value: "Contract" }, 
  { label: "Freelance", value: "Freelance" }, 
  { label: "Internship / Trainee", value: "Internship" }, 
  { label: "Apprenticeship", value: "Apprenticeship" }, 
  { label: "Permanent", value: "Permanent" }, 
  { label: "Temporary", value: "Temporary" }, 
]; 
const employmentModeOptions = [ 
  { label: "Onsite", value: "Onsite" }, 
  { label: "Remote", value: "Remote" }, 
  { label: "Hybrid", value: "Hybrid" }, 
]; 
const suggestedSkills = [ 
  "Java", 
  "JavaScript", 
  "Spring Boot", 
  "Welding Inspection", 
  "Safety Compliance", 
  "AutoCAD", 
]; 
const suggestedBenefits = [ 
  "Health Insurance", 
  "Provident Fund", 
  "Paid Leave", 
  "Accommodation", 
  "Food Allowance", 
  "Transport", 
  "Overtime Pay", 
  "Annual Bonus", 
  "Life Insurance", 
  "Skill Training", 
]; 
const suggestedLicenceDocs = [ 
  "Government-issued ID", 
  "Aadhaar Card / Identity Proof", 
  "Passport", 
  "Driving License", 
  "ITI Certificate", 
  "Diploma Certificate", 
  "Degree Certificate", 
  "Safety Training Certificate", 
  "Heavy Equipment Operator Certificate", 
  "Forklift Operator License", 
  "Welding Certification (CSWIP / AWS)", 
  "Work Experience Certificate", 
  "Medical Fitness Certificate", 
  "Police Verification Certificate", 
]; 
const suggestedLanguages = [ 
  "English", 
  "Hindi", 
  "Marathi", 
  "Tamil", 
  "Telugu", 
  "Kannada", 
  "Bengali", 
  "Gujarati", 
  "Punjabi", 
  "Malayalam", 
  "Odia", 
  "Local Language", 
]; 
const industryOptions = [ 
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
  "Power & Utilities", 
  "Chemicals & Petrochemicals", 
  "Automotive", 
  "Real Estate", 
  "Telecommunications", 
  "Agriculture", 
  "Banking & Financial Services", 
  "Education", 
  "Government / Public Sector", 
  "Other", 
]; 
const departmentOptions = [ 
  "Operations", 
  "Production", 
  "Maintenance", 
  "Quality Assurance", 
  "Human Resources", 
  "Administration", 
  "Logistics", 
  "Safety", 
  "Procurement", 
  "Other", 
]; 
const indianStates = [ 
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
const salaryDisplayOptions = [ 
  { value: "Show Range", label: "Show Range" }, 
  { value: "Show Min Only", label: "Show Minimum Only" }, 
  { value: "Show Max Only", label: "Show Maximum Only" }, 
  { value: "Negotiable", label: "Negotiable" }, 
]; 
const educationOptions = [ 
  { value: "No Specific Requirement", label: "No Specific Requirement" }, 
  { value: "Below_10th", label: "Below 10th" }, 
  { value: "10th_Pass", label: "10th Pass" }, 
  { value: "12th_Pass", label: "12th Pass" }, 
  { value: "ITI_Diploma", label: "ITI / Diploma" }, 
  { value: "Graduate", label: "Graduate" }, 
  { value: "Post_Graduate", label: "Post Graduate" }, 
]; 
const genderOptions = [ 
  { value: "Any", label: "Not Specified" }, 
  { value: "Male", label: "Male" }, 
  { value: "Female", label: "Female" }, 
]; 
const locationTypeOptions = [ 
  { value: "Onshore", label: "Onshore" }, 
  { value: "Offshore", label: "Offshore" }, 
]; 
const companyVisibilityOptions = [ 
  { value: "ShowName", label: "Show Company Name" }, 
  { value: "HideName", label: "Hide Company Name" }, 
]; 
 
const JOB_STEPS = [ 
  { id: "job-details", step: "01", title: "Job Details" }, 
  { id: "compensation", step: "02", title: "Compensation" }, 
  { id: "skills-jd", step: "03", title: "Skills & JD" }, 
  { id: "eligibility", step: "04", title: "Eligibility" }, 
  { id: "location", step: "05", title: "Location" }, 
  { id: "screening-questions", step: "06", title: "Questions" }, 
  { id: "publishing", step: "07", title: "Publishing" }, 
]; 
 
/** 
 * Single source of truth for "is this job ready to publish?". 
 * Walks every step's required fields (mirroring each handleStepN's own 
 * checks) so the Step 7 checklist and the final Publish guard never 
 * drift out of sync with each other. 
 * Returns an array of { stepNum, title, message } — empty means all good. 
 */ 
function validateAllSteps(jobForm) { 
  const issues = []; 
 
  // Step 1 – Job Details 
  if (!jobForm.JobTitle?.trim()) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Job Title is required" }); 
  if (!jobForm.TradeCategory) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Trade / Role Category is required" }); 
  if (!jobForm.IndustryType) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Industry Type is required" }); 
  if (!jobForm.JobType) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Job Type is required" }); 
  if (!jobForm.JobDescription?.trim()) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Job Description is required" }); 
  if (!jobForm.EmploymentType) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Employment Type is required" }); 
  if (!jobForm.EmploymentMode) 
    issues.push({ stepNum: 1, title: "Job Details", message: "Employment Mode is required" }); 
 
  // Step 2 – Compensation 
  if (!jobForm.SalaryMin) 
    issues.push({ stepNum: 2, title: "Compensation", message: "Minimum Salary is required" }); 
  if (!jobForm.SalaryMax) 
    issues.push({ stepNum: 2, title: "Compensation", message: "Maximum Salary is required" }); 
 
  // Step 4 – Eligibility 
  if (!jobForm.Vacancies) 
    issues.push({ stepNum: 4, title: "Eligibility", message: "Number of Vacancies is required" }); 
 
  // Step 5 – Location 
  if (!jobForm.LocationType) 
    issues.push({ stepNum: 5, title: "Location", message: "Location Type is required" }); 
  if (jobForm.LocationType === "Offshore" && !jobForm.OffshoreVesselName?.trim()) 
    issues.push({ stepNum: 5, title: "Location", message: "Vessel / Platform Name is required" }); 
 
  // Step 7 – Publishing 
  if (!jobForm.ApplicationDeadline) 
    issues.push({ stepNum: 7, title: "Publishing", message: "Application Deadline is required" }); 
 
  return issues; 
} 
 
/* ─── helpers ─────────────────────────────────────────────────────────────── */ 
function Field({ label, required, hint, children }) { 
  return ( 
    <div className={styles.field}> 
      <label className={styles.label}> 
        {label} 
        {required && <span className={styles.required}>*</span>} 
      </label> 
      {children} 
      {hint && <p className={styles.hint}>{hint}</p>} 
    </div> 
  ); 
} 
 
/** 
 * Dropdown-with-search field: pick from a known list only — typing is purely 
 * a filter/search aid over the option list and never sets the field's value 
 * on its own. The underlying value only changes when the user actually picks 
 * an option (click, or pressing Enter on an exact/singular match). If the 
 * user types something that matches nothing and clicks away/tabs out, the 
 * text snaps back to whatever is actually selected. 
 */ 
function Combobox({ value, onChange, options, placeholder }) { 
  const normalized = (options || []).map((o) => 
    typeof o === "string" ? { value: o, label: o } : o 
  ); 
  const [open, setOpen] = useState(false); 
  const wrapRef = useRef(null); 
  const justSelectedRef = useRef(false); 
 
  const matched = normalized.find((o) => o.value === value); 
  const [query, setQuery] = useState(matched ? matched.label : (value || "")); 
 
  // Keep the visible text in sync whenever the selected value changes from 
  // outside (loading a draft, parent resetting the field, etc). 
  useEffect(() => { 
    const m = normalized.find((o) => o.value === value); 
    setQuery(m ? m.label : (value || "")); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [value]); 
 
  const revertIfUnmatched = () => { 
    const m = normalized.find((o) => o.value === value); 
    setQuery(m ? m.label : (value || "")); 
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
      <input 
        className={styles.control} 
        value={query} 
        placeholder={placeholder || "Type to search…"} 
        autoComplete="off" 
        onChange={(e) => { 
          // Typing only filters the dropdown below — it never submits the 
          // raw text as the field's value. Only selecting an option does. 
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
            border: "1px solid rgba(18,35,89,0.12)", 
            borderRadius: 10, 
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
                padding: "10px 16px", 
                fontSize: "14px", 
                cursor: "pointer", 
                color: "#122359", 
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
            border: "1px solid rgba(18,35,89,0.12)", 
            borderRadius: 10, 
            boxShadow: "0 12px 28px rgba(18,35,89,0.14)", 
            padding: "10px 16px", 
            fontSize: 13, 
            color: "#94a3b8", 
          }} 
        > 
          No matches — pick from the list 
        </div> 
      )} 
    </div> 
  ); 
} 
 
/** 
 * Same dropdown-with-typing UX as Combobox, but the option list comes from 
 * a live API call (GET /api/recruiter/jobs/search-roles) instead of a fixed 
 * array — used for "Role / Specialisation" so suggestions are based on roles 
 * already posted across the platform. Falls back to free typing (AllowCustom) 
 * when there are no matches or the query is too short. 
 */ 
function AsyncCombobox({ value, onChange, fetchOptions, placeholder, minChars = 2 }) { 
  const [open, setOpen] = useState(false); 
  const [options, setOptions] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const wrapRef = useRef(null); 
  const debounceRef = useRef(null); 
 
  useEffect(() => { 
    const onClickOutside = (e) => { 
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); 
    }; 
    document.addEventListener("mousedown", onClickOutside); 
    return () => document.removeEventListener("mousedown", onClickOutside); 
  }, []); 
 
  const runSearch = (q) => { 
    clearTimeout(debounceRef.current); 
    if (!q || q.length < minChars) { 
      setOptions([]); 
      return; 
    } 
    debounceRef.current = setTimeout(async () => { 
      setLoading(true); 
      try { 
        const result = await fetchOptions(q); 
        setOptions(result?.suggestions ?? []); 
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      } 
    }, 300); 
  }; 
 
  return ( 
    <div ref={wrapRef} style={{ position: "relative" }}> 
      <input 
        className={styles.control} 
        value={value || ""} 
        placeholder={placeholder || "Type to search…"} 
        autoComplete="off" 
        onChange={(e) => { 
          onChange(e.target.value); 
          setOpen(true); 
          runSearch(e.target.value); 
        }} 
        onFocus={() => setOpen(true)} 
      /> 
      {open && (loading || options.length > 0) && ( 
        <div 
          style={{ 
            position: "absolute", 
            top: "calc(100% + 4px)", 
            left: 0, 
            right: 0, 
            zIndex: 40, 
            background: "#fff", 
            border: "1px solid rgba(18,35,89,0.12)", 
            borderRadius: 10, 
            boxShadow: "0 12px 28px rgba(18,35,89,0.14)", 
            maxHeight: 220, 
            overflowY: "auto", 
          }} 
        > 
          {loading ? ( 
            <div style={{ padding: "10px 16px", fontSize: 13, color: "#66789c" }}> 
              Searching… 
            </div> 
          ) : ( 
            options.map((opt) => ( 
              <div 
                key={opt} 
                onMouseDown={() => { 
                  onChange(opt); 
                  setOpen(false); 
                }} 
                style={{ 
                  padding: "10px 16px", 
                  fontSize: "14px", 
                  cursor: "pointer", 
                  color: "#122359", 
                }} 
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF4E0")} 
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} 
              > 
                {opt} 
              </div> 
            )) 
          )} 
        </div> 
      )} 
    </div> 
  ); 
} 
 
/** Split a comma-separated string into a trimmed array, ignoring blanks */ 
const splitComma = (value) => 
  value 
    .split(",") 
    .map((s) => s.trim()) 
    .filter(Boolean); 
 
/** Join an array back to a comma-separated display string */ 
const joinComma = (arr) => (arr ?? []).join(", "); 
 
/** Toggle a value inside a comma-separated string (add if absent, remove if present) */ 
const toggleCommaValue = (currentString, item) => { 
  const list = splitComma(currentString || ""); 
  const next = list.includes(item) 
    ? list.filter((x) => x !== item) 
    : [...list, item]; 
  return joinComma(next); 
}; 
 
/** 
 * "Pick from a list, don't type" multi-select rendered as toggleable chips. 
 * Used for fields that should only ever be built by selecting predefined 
 * options — never free-typed — such as required licences/documents, 
 * languages, and benefits. 
 */ 
function ChipSelect({ options, selected, onToggle }) { 
  return ( 
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}> 
      {(options || []).map((opt) => { 
        const active = (selected || []).includes(opt); 
        return ( 
          <button 
            key={opt} 
            type="button" 
            onClick={() => onToggle(opt)} 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 6, 
              padding: "8px 16px", 
              borderRadius: 999, 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: "pointer", 
              transition: "all .15s ease", 
              border: active ? "1px solid #FFA300" : "1px solid #E2E8F0", 
              background: active ? "#FFA300" : "#fff", 
              color: active ? "#fff" : "#122359", 
              boxShadow: active ? "0 4px 10px rgba(255,163,0,0.28)" : "none", 
            }} 
          > 
            {active && ( 
              <span 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  width: 16, 
                  height: 16, 
                  borderRadius: "50%", 
                  background: "rgba(255,255,255,0.3)", 
                  fontSize: 10, 
                  lineHeight: 1, 
                }} 
              > 
                ✓ 
              </span> 
            )} 
            {opt} 
          </button> 
        ); 
      })} 
    </div> 
  ); 
} 
 
/** 
 * Same idea as Key Skills: pick from suggested chips, or type your own and 
 * press Enter / click Add. Typing never submits on its own — if what you 
 * typed already matches an existing chip (suggested or previously added), 
 * that chip is simply selected instead of creating a near-duplicate. Only 
 * genuinely new text becomes a new chip. 
 */ 
function ChipSelectWithAdd({ options, selected, onToggle, placeholder }) { 
  const [inputValue, setInputValue] = useState(""); 
 
  // Suggested options plus any already-selected custom entries that aren't 
  // part of the fixed list, so manually-added chips show up (and can be 
  // removed the same way as any other chip). 
  const allChips = [...(options || [])]; 
  (selected || []).forEach((s) => { 
    if (!allChips.some((o) => o.toLowerCase() === s.toLowerCase())) { 
      allChips.push(s); 
    } 
  }); 
 
  const commitInput = () => { 
    const value = inputValue.trim(); 
    if (!value) return; 
 
    const existing = allChips.find( 
      (o) => o.toLowerCase() === value.toLowerCase() 
    ); 
    const target = existing || value; 
    const alreadySelected = (selected || []).some( 
      (s) => s.toLowerCase() === target.toLowerCase() 
    ); 
 
    // Only adds a brand-new chip when nothing below already matches it; 
    // otherwise it just selects the existing one. 
    if (!alreadySelected) onToggle(target); 
    setInputValue(""); 
  }; 
 
  return ( 
    <div> 
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}> 
        <input 
          className={styles.control} 
          style={{ flex: 1 }} 
          placeholder={placeholder || "Type and press Enter…"} 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={(e) => { 
            if (e.key === "Enter") { 
              e.preventDefault(); 
              commitInput(); 
            } 
          }} 
        /> 
        <button 
          type="button" 
          className="btn btn-sm btn-border" 
          onClick={commitInput} 
        > 
          + Add 
        </button> 
      </div> 
 
      <ChipSelect options={allChips} selected={selected} onToggle={onToggle} /> 
    </div> 
  ); 
} 
 
/* ─── Top progress bar ────────────────────────────────────────────────────── */ 
function StepProgressBar({ activeStep, onStepClick, lastCompletedStep = 0 }) { 
  return ( 
    <div className={styles.progressContainer}> 
      <div className={styles.stepWrapper}> 
        {JOB_STEPS.map((s, i) => { 
          const n = i + 1; 
          const active = n === activeStep; 
          // A checkmark only appears once that step's data has actually been 
          // saved (Save & Continue) — simply navigating past it doesn't count. 
          const done = n <= lastCompletedStep && !active; 
          const handleClick = () => onStepClick?.(n); 
          return ( 
            <React.Fragment key={s.id}> 
              <div 
                className={styles.stepItem} 
                onClick={handleClick} 
                role="button" 
                tabIndex={0} 
                onKeyDown={(e) => { 
                  if (e.key === "Enter" || e.key === " ") onStepClick?.(n); 
                }} 
                title={`Go to ${s.title}`} 
                style={{ cursor: "pointer" }} 
              > 
                <div 
                  className={[ 
                    styles.stepCircle, 
                    done ? styles.stepCompleted : "", 
                    active ? styles.stepActive : "", 
                  ].join(" ")} 
                > 
                  {done ? "✓" : s.step} 
                </div> 
                <span 
                  className={[ 
                    styles.stepLabel, 
                    active ? styles.stepLabelActive : "", 
                  ].join(" ")} 
                > 
                  {s.title} 
                </span> 
              </div> 
              {i < JOB_STEPS.length - 1 && ( 
                <div 
                  className={[ 
                    styles.stepLine, 
                    done ? styles.stepLineActive : "", 
                  ].join(" ")} 
                /> 
              )} 
            </React.Fragment> 
          ); 
        })} 
      </div> 
    </div> 
  ); 
} 
 
/* ─── Step card wrapper ───────────────────────────────────────────────────── */ 
function StepCard({ stepNum, title, subtitle, children, onBack, onContinue, isLast }) { 
  return ( 
    <div className={styles.sectionCard}> 
      <div className={styles.sectionBody}> 
        <div className={styles.sectionHeading}> 
          <span className={styles.sectionStep}> 
            {String(stepNum).padStart(2, "0")} 
          </span> 
          <div> 
            <h5 className={styles.sectionTitle}>{title}</h5> 
            {subtitle && <p className={styles.sectionSub}>{subtitle}</p>} 
          </div> 
        </div> 
 
        <div style={{ marginTop: 24 }}>{children}</div> 
 
        <div className={styles.stepActions}> 
          {stepNum > 1 && ( 
            <button 
              type="button" 
              className={`btn btn-border ${styles.backBtn}`} 
              onClick={onBack} 
            > 
              Back 
            </button> 
          )} 
          <button 
            type="button" 
            className={`btn btn-default ${styles.continueBtn}`} 
            onClick={onContinue} 
          > 
            {isLast ? "Save & Publish" : "Save & Continue"} 
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
} 
 
/* ─── STEP 1 – Job Details ────────────────────────────────────────────────── */ 
function Step1({ go, jobForm, setJobForm, onSubmit, handleGenerateJD, loadingAI, jdSuggestions, ghostSuggestion, handleJDTab }) { 
  return ( 
    <StepCard 
      stepNum={1} 
      title="Job Details" 
      subtitle="Core role information" 
      onContinue={onSubmit} 
      isFirst 
    > 
      {/* Job Title */} 
      <Field label="Job Title" required> 
        <input 
          className={styles.control} 
          value={jobForm.JobTitle} 
          onChange={(e) => setJobForm((p) => ({ ...p, JobTitle: e.target.value }))} 
          placeholder="e.g. Senior Welder" 
        /> 
      </Field> 
 
      <div className={styles.grid2}> 
        {/* Trade Category */} 
        <Field label="Trade / Role Category" required hint="Pick from the list, or type your own"> 
          <Combobox 
            value={jobForm.TradeCategory} 
            onChange={(v) => setJobForm((p) => ({ ...p, TradeCategory: v }))} 
            options={roleCategories} 
            placeholder="e.g. Welding, Electrician, Plumber" 
          /> 
        </Field> 
 
        {/* Role (optional free-text specialisation) */} 
        <Field label="Role / Specialisation"> 
          <input 
            value={jobForm.Role} 
            onChange={(e) => setJobForm((p) => ({ ...p, Role: e.target.value }))} 
            className={styles.control} 
            placeholder="e.g. Pipe Welder" 
          /> 
        </Field> 
 
        {/* Industry Type */} 
        <Field label="Industry Type" required hint="Pick from the list, or type your own"> 
          <Combobox 
            value={jobForm.IndustryType} 
            onChange={(v) => setJobForm((p) => ({ ...p, IndustryType: v }))} 
            options={industryOptions} 
            placeholder="e.g. Oil & Gas" 
          /> 
        </Field> 
 
        {/* Experience Min */} 
        <Field label="Experience Min (yrs)"> 
          <input 
            type="number" 
            min={0} 
            className={styles.control} 
            value={jobForm.ExperienceMinYears} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, ExperienceMinYears: e.target.value })) 
            } 
          /> 
        </Field> 
 
        {/* Experience Max */} 
        <Field label="Experience Max (yrs)"> 
          <input 
            type="number" 
            min={0} 
            className={styles.control} 
            value={jobForm.ExperienceMaxYears} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, ExperienceMaxYears: e.target.value })) 
            } 
          /> 
        </Field> 
 
        {/* Job Type */} 
        <Field label="Job Type" required> 
          <Combobox 
            value={jobForm.JobType} 
            onChange={(v) => setJobForm((p) => ({ ...p, JobType: v }))} 
            options={jobPostTypes} 
            placeholder="e.g. Regular Hiring" 
          /> 
        </Field> 
 
        {/* Employment Type */} 
        <Field label="Employment Type" required> 
          <Combobox 
            value={jobForm.EmploymentType} 
            onChange={(v) => setJobForm((p) => ({ ...p, EmploymentType: v }))} 
            options={employmentTypeOptions} 
            placeholder="e.g. Full Time" 
          /> 
        </Field> 
 
        {/* Employment Mode */} 
        <Field label="Employment Mode" required> 
          <Combobox 
            value={jobForm.EmploymentMode} 
            onChange={(v) => setJobForm((p) => ({ ...p, EmploymentMode: v }))} 
            options={employmentModeOptions} 
            placeholder="e.g. Onsite" 
          /> 
        </Field> 
 
        {/* Department */} 
        <Field label="Department"> 
          <Combobox 
            value={jobForm.Department} 
            onChange={(v) => setJobForm((p) => ({ ...p, Department: v }))} 
            options={departmentOptions} 
            placeholder="e.g. Operations" 
          /> 
        </Field> 
 
        {/* Duty Hours Per Day */} 
        <div 
          style={{ 
            gridColumn: "1 / -1", // take full width of the parent grid 
            display: "flex", 
            gap: "24px", 
            alignItems: "flex-start", 
            width: "100%", 
          }} 
        > 
          <div style={{ flex: 2 }}> 
            <Field label="Duty Hours Per Day" hint="Max 24"> 
              <input 
                type="number" 
                min={1} 
                max={24} 
                className={styles.control} 
                value={jobForm.DutyHoursPerDay} 
                onChange={(e) => 
                  setJobForm((p) => ({ 
                    ...p, 
                    DutyHoursPerDay: e.target.value, 
                  })) 
                } 
              /> 
            </Field> 
          </div> 
 
          <div style={{ flex: 1 }}> 
            <Field label="Paid Overtime"> 
              <label 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  marginTop: "12px", 
                }} 
              > 
                <input 
                  type="checkbox" 
                  checked={jobForm.PaidOvertime} 
                  onChange={(e) => 
                    setJobForm((p) => ({ 
                      ...p, 
                      PaidOvertime: e.target.checked, 
                    })) 
                  } 
                /> 
                Overtime will be paid 
              </label> 
            </Field> 
          </div> 
 
          <div style={{ flex: 1 }}> 
            {/* <Field label="Oil Field"> 
              <label 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  marginTop: "12px", 
                }} 
              > 
                <input 
                  type="checkbox" 
                  checked={jobForm.IsOilField} 
                  onChange={(e) => 
                    setJobForm((p) => ({ 
                      ...p, 
                      IsOilField: e.target.checked, 
                    })) 
                  } 
                /> 
                Oil field job 
              </label> 
            </Field> */} 
          </div> 
        </div> 
      </div> 
 
      {/* Key Responsibilities */} 
      <Field 
        label="Key Responsibilities" 
        hint="Enter each responsibility on a new line" 
      > 
        <button 
          type="button" 
          className="btn btn-sm btn-default mb-10" 
          onClick={handleGenerateJD} 
        > 
          {loadingAI ? "Generating…" : "✨ Generate with AI"} 
        </button> 
        <textarea 
          className={styles.textarea} 
          rows={4} 
          placeholder={"• Operate welding equipment\n• Follow safety protocols"} 
          value={jobForm.KeyResponsibilities.join("\n")} 
          onChange={(e) => 
            setJobForm((p) => ({ 
              ...p, 
              KeyResponsibilities: e.target.value.split("\n"), 
            })) 
          } 
        /> 
      </Field> 
 
      {/* Job Description */} 
      <Field label="Job Description" required> 
 
 
        <textarea 
          className={styles.textarea} 
          rows={6} 
          value={jobForm.JobDescription} 
          onChange={(e) => 
            setJobForm((p) => ({ ...p, JobDescription: e.target.value })) 
          } 
          onKeyDown={handleJDTab} 
        /> 
 
        {ghostSuggestion && ( 
          <div className={styles.inlineSuggestion}> 
            <span className={styles.tabHint}>Press TAB ↹</span> 
            <span className={styles.suggestionText}>{ghostSuggestion}</span> 
          </div> 
        )} 
 
        {jdSuggestions.length > 0 && ( 
          <div className={styles.aiSuggestions}> 
            {jdSuggestions.map((suggestion, index) => ( 
              <div 
                key={index} 
                className={styles.aiSuggestion} 
                onClick={() => 
                  setJobForm((p) => ({ 
                    ...p, 
                    JobDescription: p.JobDescription + " " + suggestion, 
                  })) 
                } 
              > 
                {suggestion} 
              </div> 
            ))} 
          </div> 
        )} 
      </Field> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 2 – Compensation ───────────────────────────────────────────────── */ 
function Step2({ go, jobForm, setJobForm, onSubmit }) { 
  return ( 
    <StepCard 
      stepNum={2} 
      title="Compensation" 
      subtitle="Salary information" 
      onBack={() => go(1)} 
      onContinue={onSubmit} 
    > 
      <div className={styles.grid2}> 
 
        {/* Currency First */} 
        <Field label="Currency" required> 
          <Combobox 
            value={jobForm.SalaryCurrency} 
            onChange={(v) => setJobForm((p) => ({ ...p, SalaryCurrency: v }))} 
            options={currencies} 
            placeholder="e.g. INR" 
          /> 
        </Field> 
 
        {/* Display Option Second */} 
        <Field label="Salary Display Option" required> 
          <Combobox 
            value={jobForm.SalaryDisplayOption} 
            onChange={(v) => setJobForm((p) => ({ ...p, SalaryDisplayOption: v }))} 
            options={salaryDisplayOptions} 
            placeholder="e.g. Show Range" 
          /> 
        </Field> 
 
        {/* Min Salary */} 
        <Field label="Min Salary" required> 
          <input 
            type="number" 
            min={0} 
            className={styles.control} 
            value={jobForm.SalaryMin} 
            onChange={(e) => 
              setJobForm((p) => ({ 
                ...p, 
                SalaryMin: e.target.value, 
              })) 
            } 
          /> 
        </Field> 
 
        {/* Max Salary */} 
        <Field label="Max Salary" required> 
          <input 
            type="number" 
            min={0} 
            className={styles.control} 
            value={jobForm.SalaryMax} 
            onChange={(e) => 
              setJobForm((p) => ({ 
                ...p, 
                SalaryMax: e.target.value, 
              })) 
            } 
          /> 
        </Field> 
 
      </div> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 3 – Skills & JD ────────────────────────────────────────────────── */ 
function Step3({ go, jobForm, setJobForm, onSubmit, additionalJdSuggestions, handleGenerateAdditionalJD, loadingAI, handleSuggestSkills, skillsLoading }) { 
  const [newSkillInput, setNewSkillInput] = useState(""); 
 
  const addManualSkill = () => { 
    const value = newSkillInput.trim(); 
    if (!value) return; 
 
    const alreadyExists = jobForm.KeySkills.some( 
      (s) => s.toLowerCase() === value.toLowerCase(), 
    ); 
    if (alreadyExists) { 
      setNewSkillInput(""); 
      return; 
    } 
 
    setJobForm((p) => ({ ...p, KeySkills: [...p.KeySkills, value] })); 
    setNewSkillInput(""); 
  }; 
 
  return ( 
    <StepCard 
      stepNum={3} 
      title="Skills & JD" 
      subtitle="Skills, benefits and extended description" 
      onBack={() => go(2)} 
      onContinue={onSubmit} 
    > 
      {/* Key Skills — AI-generated, plus manual add */} 
      <Field 
        label="Key Skills" 
        required 
        hint="Generate with AI, or type your own and press Enter / click Add. Remove any that don't fit." 
      > 
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}> 
          <button 
            type="button" 
            className="btn btn-sm btn-default" 
            onClick={handleSuggestSkills} 
            disabled={skillsLoading} 
          > 
            {skillsLoading 
              ? "Generating…" 
              : jobForm.KeySkills.length > 0 
                ? "✨ Regenerate with AI" 
                : "✨ Generate Skills with AI"} 
          </button> 
        </div> 
 
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}> 
          <input 
            className={styles.control} 
            style={{ flex: 1 }} 
            placeholder="Type a skill and press Enter…" 
            value={newSkillInput} 
            onChange={(e) => setNewSkillInput(e.target.value)} 
            onKeyDown={(e) => { 
              if (e.key === "Enter") { 
                e.preventDefault(); 
                addManualSkill(); 
              } 
            }} 
          /> 
          <button 
            type="button" 
            className="btn btn-sm btn-border" 
            onClick={addManualSkill} 
          > 
            + Add 
          </button> 
        </div> 
 
        {jobForm.KeySkills.length === 0 && !skillsLoading && ( 
          <p style={{ fontSize: 13, color: "#66789c", margin: "4px 0 0" }}> 
            No skills yet — generate with AI above, or type your own and hit 
            Enter. 
          </p> 
        )} 
 
        {jobForm.KeySkills.length > 0 && ( 
          <div className={styles.chipRow}> 
            {jobForm.KeySkills.map((s) => ( 
              <span 
                key={s} 
                className="btn btn-border btn-sm mr-10 mb-10" 
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }} 
              > 
                {s} 
                <button 
                  type="button" 
                  aria-label={`Remove ${s}`} 
                  onClick={() => 
                    setJobForm((p) => ({ 
                      ...p, 
                      KeySkills: p.KeySkills.filter((k) => k !== s), 
                    })) 
                  } 
                  style={{ 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    color: "#9ca3af", 
                    fontWeight: 700, 
                    lineHeight: 1, 
                    padding: 0, 
                  }} 
                > 
                  × 
                </button> 
              </span> 
            ))} 
          </div> 
        )} 
      </Field> 
 
      {/* Key Responsibilities (step-3 copy — separate from step-1) */} 
      {/* <Field 
        label="Key Responsibilities" 
        hint="One per line" 
      > 
        <textarea 
          className={styles.textarea} 
          rows={4} 
          placeholder={"• Perform quality checks\n• Coordinate with team leads"} 
          value={jobForm.Step3KeyResponsibilities.join("\n")} 
          onChange={(e) => 
            setJobForm((p) => ({ 
              ...p, 
              Step3KeyResponsibilities: e.target.value 
                .split("\n") 
                .map((s) => s.trim()) 
                .filter(Boolean), 
            })) 
          } 
        /> 
      </Field> */} 
 
      {/* Additional Job Description */} 
      {/* <Field label="Additional Job Description"> 
        <button 
          type="button" 
          className="btn btn-sm btn-default mb-10" 
          onClick={handleGenerateAdditionalJD} 
          disabled={loadingAI} 
        > 
          {loadingAI ? "Generating…" : "✨ Generate with AI"} 
        </button> 
        <textarea 
          className={styles.textarea} 
          rows={5} 
          value={jobForm.AdditionalJobDescription} 
          onChange={(e) => 
            setJobForm((p) => ({ 
              ...p, 
              AdditionalJobDescription: e.target.value, 
            })) 
          } 
        /> 
        {additionalJdSuggestions.length > 0 && ( 
          <div className={styles.aiSuggestions}> 
            {additionalJdSuggestions.map((suggestion, index) => ( 
              <div 
                key={index} 
                className={styles.aiSuggestion} 
                onClick={() => 
                  setJobForm((p) => ({ 
                    ...p, 
                    AdditionalJobDescription: 
                      p.AdditionalJobDescription + " " + suggestion, 
                  })) 
                } 
              > 
                {suggestion} 
              </div> 
            ))} 
          </div> 
        )} 
      </Field> */} 
 
      {/* Licence / Docs Required — select from suggestions, or type your own */} 
      <Field label="Licence / Documents Required" hint="Select all that apply, or type your own and press Enter / click Add"> 
        <ChipSelectWithAdd 
          options={suggestedLicenceDocs} 
          selected={splitComma(jobForm.LicenceDocsRequired || "")} 
          placeholder="e.g. ITI Certificate, CSWIP 3.1" 
          onToggle={(item) => 
            setJobForm((p) => ({ 
              ...p, 
              LicenceDocsRequired: toggleCommaValue(p.LicenceDocsRequired, item), 
            })) 
          } 
        /> 
      </Field> 
 
      {/* Language Required — select from suggestions, or type your own */} 
      <Field label="Language Required" hint="Select all that apply, or type your own and press Enter / click Add"> 
        <ChipSelectWithAdd 
          options={suggestedLanguages} 
          selected={splitComma(jobForm.LanguageRequired || "")} 
          placeholder="e.g. English, Hindi" 
          onToggle={(item) => 
            setJobForm((p) => ({ 
              ...p, 
              LanguageRequired: toggleCommaValue(p.LanguageRequired, item), 
            })) 
          } 
        /> 
      </Field> 
 
      {/* Benefits — select from suggestions, or type your own */} 
      <Field label="Benefits" hint="Select all that apply, or type your own and press Enter / click Add"> 
        <ChipSelectWithAdd 
          options={suggestedBenefits} 
          selected={jobForm.Benefits} 
          placeholder="e.g. Health Insurance, Provident Fund" 
          onToggle={(b) => 
            setJobForm((p) => { 
              const benefits = p.Benefits.includes(b) 
                ? p.Benefits.filter((x) => x !== b) 
                : [...p.Benefits, b]; 
 
              return { 
                ...p, 
                Benefits: benefits, 
                BenefitsText: benefits.join(", "), 
              }; 
            }) 
          } 
        /> 
      </Field> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 4 – Eligibility ────────────────────────────────────────────────── */ 
function Step4({ go, jobForm, setJobForm, onSubmit }) { 
  return ( 
    <StepCard 
      stepNum={4} 
      title="Eligibility" 
      subtitle="Candidate eligibility criteria" 
      onBack={() => go(3)} 
      onContinue={onSubmit} 
    > 
      <div className={styles.grid2}> 
        <Field label="Number of Vacancies" required> 
          <input 
            type="number" 
            min={1} 
            className={styles.control} 
            value={jobForm.Vacancies} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, Vacancies: e.target.value })) 
            } 
          /> 
        </Field> 
 
        <Field label="Education Required" required> 
          <Combobox 
            value={jobForm.EducationRequired} 
            onChange={(v) => setJobForm((p) => ({ ...p, EducationRequired: v }))} 
            options={educationOptions} 
            placeholder="e.g. Graduate" 
          /> 
        </Field> 
 
        <Field label="Minimum Age"> 
          <input 
            type="number" 
            min={18} 
            max={99} 
            className={styles.control} 
            value={jobForm.AgeMin} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, AgeMin: e.target.value })) 
            } 
          /> 
        </Field> 
 
        <Field label="Maximum Age"> 
          <input 
            type="number" 
            min={18} 
            max={99} 
            className={styles.control} 
            value={jobForm.AgeMax} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, AgeMax: e.target.value })) 
            } 
          /> 
        </Field> 
 
        <Field label="Gender Preferred"> 
          <Combobox 
            value={jobForm.GenderPreferred} 
            onChange={(v) => setJobForm((p) => ({ ...p, GenderPreferred: v }))} 
            options={genderOptions} 
            placeholder="e.g. Not Specified" 
          /> 
        </Field> 
 
        <Field label="Disability Eligible"> 
          <div style={{ paddingTop: 12 }}> 
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}> 
              <input 
                type="checkbox" 
                checked={jobForm.DisabilityEligible} 
                onChange={(e) => 
                  setJobForm((p) => ({ 
                    ...p, 
                    DisabilityEligible: e.target.checked, 
                  })) 
                } 
              /> 
              Open to persons with disabilities 
            </label> 
          </div> 
        </Field> 
 
        <Field label="Passport Required"> 
          <div style={{ paddingTop: 12 }}> 
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}> 
              <input 
                type="checkbox" 
                checked={jobForm.PassportRequired} 
                onChange={(e) => 
                  setJobForm((p) => ({ 
                    ...p, 
                    PassportRequired: e.target.checked, 
                    PassportValidityMonths: e.target.checked 
                      ? p.PassportValidityMonths 
                      : "", 
                  })) 
                } 
              /> 
              Passport is required 
            </label> 
          </div> 
        </Field> 
 
        {jobForm.PassportRequired && ( 
          <Field 
            label="Passport Validity Required (Months)" 
            hint="Minimum remaining validity" 
          > 
            <input 
              type="number" 
              min={1} 
              max={120} 
              className={styles.control} 
              value={jobForm.PassportValidityMonths} 
              onChange={(e) => 
                setJobForm((p) => ({ 
                  ...p, 
                  PassportValidityMonths: e.target.value, 
                })) 
              } 
            /> 
          </Field> 
        )} 
      </div> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 5 – Location ───────────────────────────────────────────────────── */ 
function Step5({ go, jobForm, setJobForm, onSubmit, errors, }) { 
  const isOnshore = jobForm.LocationType === "Onshore"; 
 
  return ( 
    <StepCard 
      stepNum={5} 
      title="Location" 
      subtitle="Job location details" 
      onBack={() => go(4)} 
      onContinue={onSubmit} 
    > 
      <div className={styles.grid2}> 
        {/* Location Type */} 
        <Field label="Location Type" required> 
          <Combobox 
            value={jobForm.LocationType} 
            onChange={(v) => setJobForm((p) => ({ ...p, LocationType: v }))} 
            options={locationTypeOptions} 
            placeholder="e.g. Onshore" 
          /> 
        </Field> 
 
        {/* General Country */} 
        <Field label="Country" required> 
          <Combobox 
            value={jobForm.Country} 
            onChange={(v) => setJobForm((p) => ({ ...p, Country: v }))} 
            options={countryOptions} 
            placeholder="e.g. India" 
          /> 
        </Field> 
 
        {/* Work Address Line (both types) */} 
        <Field label="Work Address / Site" style={{ gridColumn: "1/-1" }}> 
          <input 
            className={styles.control} 
            placeholder="e.g. Plot 12, Industrial Area, Phase 2" 
            value={jobForm.WorkAddressLine} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, WorkAddressLine: e.target.value })) 
            } 
          /> 
        </Field> 
 
        {/* ── ONSHORE fields ── */} 
        {isOnshore && ( 
          <> 
            <Field label="City" required> 
              <input 
                className={styles.control} 
                value={jobForm.OnshoreCity} 
                onChange={(e) => 
                  setJobForm((p) => ({ ...p, OnshoreCity: e.target.value })) 
                } 
              /> 
            </Field> 
 
            <Field label="State / Province" required> 
              <Combobox 
                value={jobForm.OnshoreState} 
                onChange={(v) => setJobForm((p) => ({ ...p, OnshoreState: v }))} 
                options={indianStates} 
                placeholder="e.g. Maharashtra" 
              /> 
            </Field> 
 
            <Field label="Onshore Country"> 
              <Combobox 
                value={jobForm.OnshoreCountry} 
                onChange={(v) => setJobForm((p) => ({ ...p, OnshoreCountry: v }))} 
                options={countryOptions} 
                placeholder="e.g. India" 
              /> 
            </Field> 
 
            <Field label="Pin / Zip Code"> 
              <input 
                className={styles.control} 
                value={jobForm.OnshorePincode} 
                onChange={(e) => 
                  setJobForm((p) => ({ ...p, OnshorePincode: e.target.value })) 
                } 
              /> 
            </Field> 
          </> 
        )} 
 
        {/* ── OFFSHORE fields ── */} 
        {!isOnshore && ( 
          <> 
            <Field label="Vessel / Platform Name" required> 
              <input 
                className={styles.control} 
                value={jobForm.OffshoreVesselName} 
                onChange={(e) => 
                  setJobForm((p) => ({ 
                    ...p, 
                    OffshoreVesselName: e.target.value, 
                  })) 
                } 
 
                required 
              /> 
            </Field> 
 
            <Field label="Offshore Region" required> 
              <input 
                className={styles.control} 
                placeholder="e.g. Arabian Gulf, North Sea, Gulf of Mexico" 
                value={jobForm.OffshoreRegion} 
                onChange={(e) => 
                  setJobForm((p) => ({ 
                    ...p, 
                    OffshoreRegion: e.target.value, 
                  })) 
                } 
              /> 
            </Field> 
 
            <Field label="Offshore Country"> 
              <Combobox 
                value={jobForm.OffshoreCountry} 
                onChange={(v) => setJobForm((p) => ({ ...p, OffshoreCountry: v }))} 
                options={countryOptions} 
                placeholder="e.g. UAE" 
              /> 
            </Field> 
          </> 
        )} 
      </div> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 6 – Screening Questions ───────────────────────────────────────── */ 
function Step6({ go, jobForm, setJobForm, onSubmit }) { 
  const addQuestion = () => { 
    setJobForm((p) => ({ 
      ...p, 
      questions: [ 
        ...p.questions, 
        { 
          questionText: "", 
        }, 
      ], 
    })); 
  }; 
 
  const removeQuestion = (index) => { 
    setJobForm((p) => ({ 
      ...p, 
      questions: p.questions.filter((_, i) => i !== index), 
    })); 
  }; 
 
  const updateQuestion = (index, field, value) => { 
    setJobForm((p) => ({ 
      ...p, 
      questions: p.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q 
      ), 
    })); 
  }; 
 
  return ( 
    <StepCard 
      stepNum={6} 
      title="Questions" 
      subtitle="Screening questions for applicants (optional)" 
      onBack={() => go(5)} 
      onContinue={onSubmit} 
    > 
      <p style={{ fontSize: 13, color: "#66789c", marginBottom: 16 }}> 
        Screening questions are entirely optional. Add one or more if you'd 
        like candidates to answer specific questions when they apply, or skip 
        this step and continue. 
      </p> 
 
      {jobForm.questions.length === 0 && ( 
        <div 
          style={{ 
            padding: "20px", 
            marginBottom: 16, 
            textAlign: "center", 
            border: "1px dashed #ddd", 
            borderRadius: 8, 
            color: "#66789c", 
            fontSize: 13, 
          }} 
        > 
          No screening questions added yet. You can skip this step, or add a 
          question below. 
        </div> 
      )} 
 
      {jobForm.questions.map((question, index) => ( 
        <div 
          key={index} 
          style={{ 
            marginBottom: 20, 
            padding: 15, 
            border: "1px solid #ddd", 
            borderRadius: 8, 
          }} 
        > 
          <Field label={`Question ${index + 1}`}> 
            <input 
              className={styles.control} 
              value={question.questionText} 
              onChange={(e) => 
                updateQuestion(index, "questionText", e.target.value) 
              } 
              placeholder="e.g. Do you have a valid CSWIP 3.1 certificate?" 
            /> 
          </Field> 
          <button 
            type="button" 
            className="btn btn-danger btn-sm" 
            onClick={() => removeQuestion(index)} 
          > 
            Remove 
          </button> 
        </div> 
      ))} 
 
      <button type="button" className="btn btn-border" onClick={addQuestion}> 
        + Add Question 
      </button> 
    </StepCard> 
  ); 
} 
 
/* ─── STEP 7 – Publishing ─────────────────────────────────────────────────── */ 
function Step7({ go, jobForm, setJobForm, onSubmit, preflightIssues = [] }) { 
  return ( 
    <StepCard 
      stepNum={7} 
      title="Publishing" 
      subtitle="Set visibility and publish your job" 
      onBack={() => go(6)} 
      onContinue={onSubmit} 
      isLast 
    > 
      {/* Pre-publish checklist */} 
      <div 
        style={{ 
          marginBottom: 24, 
          padding: "16px 18px", 
          borderRadius: 12, 
          border: `1px solid ${preflightIssues.length ? "#FBD5D5" : "#BBF7D0"}`, 
          background: preflightIssues.length ? "#FFF5F5" : "#F0FDF4", 
        }} 
      > 
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            fontWeight: 700, 
            fontSize: 14, 
            color: preflightIssues.length ? "#B91C1C" : "#166534", 
            marginBottom: preflightIssues.length ? 10 : 0, 
          }} 
        > 
          <span>{preflightIssues.length ? "⚠" : "✓"}</span> 
          {preflightIssues.length 
            ? `${preflightIssues.length} item${preflightIssues.length > 1 ? "s" : ""} need${preflightIssues.length > 1 ? "" : "s"} your attention before publishing` 
            : "Everything looks good — ready to publish"} 
        </div> 
 
        {preflightIssues.length > 0 && ( 
          <ul style={{ margin: 0, paddingLeft: 20 }}> 
            {preflightIssues.map((issue, i) => ( 
              <li 
                key={i} 
                style={{ 
                  fontSize: 13, 
                  color: "#7f1d1d", 
                  marginBottom: 6, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  gap: 10, 
                }} 
              > 
                <span> 
                  <strong>{issue.title}:</strong> {issue.message} 
                </span> 
                <button 
                  type="button" 
                  onClick={() => go(issue.stepNum)} 
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#1D4ED8", 
                    fontWeight: 700, 
                    fontSize: 12, 
                    cursor: "pointer", 
                    whiteSpace: "nowrap", 
                    textDecoration: "underline", 
                  }} 
                > 
                  Fix now 
                </button> 
              </li> 
            ))} 
          </ul> 
        )} 
      </div> 
 
      <div className={styles.grid2}> 
        {/* Application Deadline */} 
        <Field label="Application Deadline" required> 
          <input 
            type="date" 
            className={styles.control} 
            value={jobForm.ApplicationDeadline} 
            onChange={(e) => 
              setJobForm((p) => ({ 
                ...p, 
                ApplicationDeadline: e.target.value, 
              })) 
            } 
          /> 
        </Field> 
 
        {/* Company Visibility */} 
        <Field label="Company Visibility"> 
          <Combobox 
            value={jobForm.CompanyVisibility} 
            onChange={(v) => setJobForm((p) => ({ ...p, CompanyVisibility: v }))} 
            options={companyVisibilityOptions} 
            placeholder="e.g. Show Company Name" 
          /> 
        </Field> 
 
        {/* Job Type (for publishing context — maps to API JobType) */} 
        {/* <Field label="Job Post Type"> 
          <select 
            className={`${styles.control} ${styles.selectControl}`} 
            value={jobForm.JobType} 
            onChange={(e) => 
              setJobForm((p) => ({ ...p, JobType: e.target.value })) 
            } 
          > 
            {jobPostTypes.map((v) => ( 
              <option key={v.value} value={v.value}> 
                {v.label} 
              </option> 
            ))} 
          </select> 
        </Field> */} 
 
        {/* Publish Now */} 
        <Field label="Publish Now"> 
          <div style={{ paddingTop: 12 }}> 
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}> 
              <input 
                type="checkbox" 
                checked={jobForm.PublishNow} 
                onChange={(e) => 
                  setJobForm((p) => ({ ...p, PublishNow: e.target.checked })) 
                } 
              /> 
              Publish immediately after saving 
            </label> 
          </div> 
        </Field> 
      </div> 
    </StepCard> 
  ); 
} 
 
const STEP_VIEWS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7]; 
 
/* ─── Page ────────────────────────────────────────────────────────────────── */ 
export default function DashboardPostJobPage() { 
  const router = useRouter(); 
  const showToast = useToast(); 
  const [editJobId, setEditJobId] = useState(null); 
  const [activeStep, setActiveStep] = useState(1); 
  const [jdSuggestions, setJdSuggestions] = useState([]); 
  const [additionalJdSuggestions, setAdditionalJdSuggestions] = useState([]); 
  const [ghostSuggestion, setGhostSuggestion] = useState(""); 
  const [loadingAI, setLoadingAI] = useState(false); 
  const [skillsLoading, setSkillsLoading] = useState(false); 
  const [jobId, setJobId] = useState(null); 
  const [lastCompletedStep, setLastCompletedStep] = useState(0); 
  const [loading, setLoading] = useState(false); 
  const [errors, setErrors] = useState({}); 
  const [showPreview, setShowPreview] = useState(false); 
 
  /* ── initial state – every API field present ── */ 
  const [jobForm, setJobForm] = useState({ 
    // Step 1 
    JobTitle: "", 
    TradeCategory: roleCategories[0], 
    Role: "", 
    IndustryType: "", 
    ExperienceMinYears: "", 
    ExperienceMaxYears: "", 
    JobType: "", 
    EmploymentType: "Full_Time", 
    EmploymentMode: "Onsite", 
    Department: "", 
    DutyHoursPerDay: "", 
    IsOilField: false, 
    PaidOvertime: false, 
    KeyResponsibilities: [],   // step-1 copy (also sent in step-1 payload) 
    JobDescription: "", 
 
    // Step 2 
    SalaryMin: "", 
    SalaryMax: "", 
    // SalaryCurrency: "INR", 
    // SalaryDisplayOption: "Show_Range", 
 
    // Step 3 
    KeySkills: [], 
    KeySkillsText: "", 
 
    Benefits: [], 
    BenefitsText: "", 
    Step3KeyResponsibilities: [],  // step-3 separate field 
    AdditionalJobDescription: "", 
    LicenceDocsRequired: "", 
    LanguageRequired: "", 
    // Benefits: [], 
    Tags: [], 
 
    // Step 4 
    Vacancies: "1", 
    EducationRequired: "Any", 
    AgeMin: "", 
    AgeMax: "", 
    GenderPreferred: "Any", 
    DisabilityEligible: false, 
    PassportRequired: false, 
    PassportValidityMonths: "", 
 
    // Step 5 
    LocationType: "Onshore", 
    Country: "India", 
    WorkAddressLine: "", 
    OnshoreCity: "", 
    OnshoreState: "", 
    OnshoreCountry: "", 
    OnshorePincode: "", 
    OffshoreVesselName: "", 
    OffshoreRegion: "", 
    OffshoreCountry: "", 
 
    // Step 6 
    questions: [], 
 
    // Step 7 
    ApplicationDeadline: "", 
    CompanyVisibility: "ShowName", 
    PublishingTags: [], 
    PublishNow: true, 
  }); 
 
  /* ── read ?jobId from URL on mount ── */ 
  useEffect(() => { 
    if (typeof window === "undefined") return; 
    const params = new URLSearchParams(window.location.search); 
    setEditJobId(params.get("jobId")); 
  }, []); 
 
  /* ── load draft or edit job on mount ── */ 
  useEffect(() => { 
    if (editJobId) { 
      loadJobForEdit(editJobId); 
    } else { 
      loadDraft(); 
    } 
  }, [editJobId]); 
 
  /* ── inline AI suggestions ── */ 
  useEffect(() => { 
    const timer = setTimeout(() => fetchInlineSuggestions(jobForm.JobDescription, "job"), 1200); 
    return () => clearTimeout(timer); 
  }, [jobForm.JobDescription]); 
 
  useEffect(() => { 
    const timer = setTimeout(() => fetchInlineSuggestions(jobForm.AdditionalJobDescription, "additional"), 1200); 
    return () => clearTimeout(timer); 
  }, [jobForm.AdditionalJobDescription]); 
 
  /* ── helpers ── */ 
  const preflightIssues = useMemo(() => validateAllSteps(jobForm), [jobForm]); 
 
  const go = (n) => { 
    setActiveStep(n); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  }; 
 
  const updateDraft = (response) => { 
    setLastCompletedStep(response.stepStatus?.lastCompletedStep ?? 0); 
 
    if (response.stepStatus?.lastCompletedStep >= 7) { 
      localStorage.removeItem("jobDraft"); 
      return; 
    } 
 
    localStorage.setItem( 
      "jobDraft", 
      JSON.stringify({ 
        jobId: response.jobId, 
        currentStep: response.stepStatus.lastCompletedStep + 1, 
        lastCompletedStep: response.stepStatus.lastCompletedStep, 
      }) 
    ); 
  }; 
 
  const loadJobForEdit = async (id) => { 
    try { 
      const response = await getJobResume(id); 
 
      console.log("FULL RESPONSE:", response); 
      console.log("STEP 3 DATA:", response.step3Data); 
      console.log("BENEFITS:", response.step3Data?.benefits); 
 
      setJobId(id); 
      setJobForm((prev) => ({ ...prev, ...mapResumeToForm(response, roleCategories[0]) })); 
      setLastCompletedStep(response.stepStatus?.lastCompletedStep ?? 0); 
 
      const nextStep = 
        response.stepStatus?.lastCompletedStep >= 7 
          ? 7 
          : (response.stepStatus?.lastCompletedStep ?? 0) + 1; 
 
      setActiveStep(nextStep); 
    } catch (error) { 
      console.error("loadJobForEdit:", error); 
    } 
  }; 
 
  const loadDraft = async () => { 
    try { 
      const draft = localStorage.getItem("jobDraft"); 
      if (!draft) return; 
 
      const parsed = JSON.parse(draft); 
      if (!parsed?.jobId) return; 
 
      setJobId(parsed.jobId); 
 
      const response = await getJobResume(parsed.jobId); 
 
      console.log("FULL RESPONSE:", response); 
      console.log("STEP 3 DATA:", response.step3Data); 
      console.log("BENEFITS:", response.step3Data?.benefits); 
 
      setJobForm((prev) => ({ ...prev, ...mapResumeToForm(response, roleCategories[0]) })); 
      setLastCompletedStep(response.stepStatus?.lastCompletedStep ?? 0); 
 
      const nextStep = 
        response.stepStatus.lastCompletedStep >= 7 
          ? 7 
          : response.stepStatus.lastCompletedStep + 1; 
 
      setActiveStep(nextStep); 
    } catch (error) { 
      console.error("loadDraft:", error); 
    } 
  }; 
 
  /* ── AI JD generation ── */ 
  const handleGenerateJD = async () => { 
    try { 
      setLoadingAI(true); 
      const response = await generateJobDescription({ 
        jobTitle: jobForm.JobTitle, 
        role: jobForm.Role, 
        tradeCategory: jobForm.TradeCategory, 
        experienceMinYears: jobForm.ExperienceMinYears, 
        experienceMaxYears: jobForm.ExperienceMaxYears, 
        jobType: jobForm.JobType, 
        employmentType: jobForm.EmploymentType, 
      }); 
      setJobForm((p) => ({ 
        ...p, 
        JobDescription: response.generatedDescription || "", 
        KeyResponsibilities: response.responsibilities?.length 
          ? response.responsibilities 
          : p.KeyResponsibilities, 
        KeySkills: response.suggestedSkills ?? p.KeySkills, 
        // Step-3 additional JD = Requirements + What We Offer. 
        AdditionalJobDescription: 
          response.additionalDescription || p.AdditionalJobDescription, 
        Step3KeyResponsibilities: response.requirements?.length 
          ? response.requirements 
          : p.Step3KeyResponsibilities, 
      })); 
    } catch (error) { 
      console.error("generateJD:", error); 
    } finally { 
      setLoadingAI(false); 
    } 
  }; 
 
  const handleGenerateAdditionalJD = async () => { 
    try { 
      setLoadingAI(true); 
      const response = await generateJobDescription({ 
        jobTitle: jobForm.JobTitle, 
        role: jobForm.Role, 
        tradeCategory: jobForm.TradeCategory, 
        experienceMinYears: jobForm.ExperienceMinYears, 
        experienceMaxYears: jobForm.ExperienceMaxYears, 
        jobType: jobForm.JobType, 
        employmentType: jobForm.EmploymentType, 
      }); 
      setJobForm((p) => ({ 
        ...p, 
        AdditionalJobDescription: 
          response.additionalDescription || p.AdditionalJobDescription, 
        Step3KeyResponsibilities: response.requirements?.length 
          ? response.requirements 
          : p.Step3KeyResponsibilities, 
        KeySkills: p.KeySkills?.length ? p.KeySkills : response.suggestedSkills ?? [], 
      })); 
    } catch (error) { 
      console.error("generateAdditionalJD:", error); 
    } finally { 
      setLoadingAI(false); 
    } 
  }; 
 
  /* ── AI skill suggestions (Step 3 — skills are AI-generated only, no manual typing) ── */ 
  const handleSuggestSkills = async () => { 
    if (!jobForm.JobTitle.trim()) { 
      showToast("Add a Job Title in Step 1 first so AI knows what skills to suggest.", "warning"); 
      return; 
    } 
    try { 
      setSkillsLoading(true); 
      const response = await suggestSkills({ 
        jobTitle: jobForm.JobTitle, 
        tradeCategory: jobForm.TradeCategory, 
        jobDescription: jobForm.JobDescription, 
      }); 
      setJobForm((p) => ({ 
        ...p, 
        KeySkills: response?.skills ?? p.KeySkills, 
      })); 
    } catch (error) { 
      console.error("suggestSkills:", error); 
      showToast("Failed to generate skills. Please try again.", "error"); 
    } finally { 
      setSkillsLoading(false); 
    } 
  }; 
 
  /* Auto-generate skills the first time the employer reaches Step 3, 
     as long as they haven't been filled already (e.g. from Step 1's 
     "Generate with AI" JD button, or from resuming a draft). */ 
  useEffect(() => { 
    if ( 
      activeStep === 3 && 
      jobForm.KeySkills.length === 0 && 
      jobForm.JobTitle.trim() && 
      !skillsLoading 
    ) { 
      handleSuggestSkills(); 
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [activeStep]); 
 
  const fetchInlineSuggestions = async (currentText, target = "job") => { 
    if (!currentText || currentText.length < 20) return; 
    const shouldSuggest = 
      currentText.endsWith(" ") || 
      currentText.endsWith(".") || 
      currentText.endsWith(","); 
    if (!shouldSuggest) return; 
    try { 
      const response = await getInlineSuggestion({ 
        jobTitle: jobForm.JobTitle, 
        role: jobForm.Role, 
        tradeCategory: jobForm.TradeCategory, 
        experienceMinYears: jobForm.ExperienceMinYears, 
        jobType: jobForm.JobType, 
        currentText, 
      }); 
      if (target === "job") { 
        const suggestions = response.suggestions ?? []; 
        setJdSuggestions(suggestions); 
        setGhostSuggestion(suggestions[0] ?? ""); 
      } else { 
        setAdditionalJdSuggestions(response.suggestions ?? []); 
      } 
    } catch (error) { 
      console.error("inlineSuggestion:", error); 
    } 
  }; 
 
  const handleJDTab = (e) => { 
    if (e.key === "Tab" && ghostSuggestion) { 
      e.preventDefault(); 
      setJobForm((p) => ({ 
        ...p, 
        JobDescription: p.JobDescription.trimEnd() + " " + ghostSuggestion, 
      })); 
      setGhostSuggestion(""); 
    } 
  }; 
 
  /* ══════════════════════════════════════════════════════════════════════════ 
     STEP SUBMIT HANDLERS 
  ══════════════════════════════════════════════════════════════════════════ */ 
 
  const handleStep1 = async () => { 
    if (!jobForm.JobTitle.trim()) return showToast("Job Title is required", "error"); 
    if (!jobForm.TradeCategory) return showToast("Trade Category is required", "error"); 
    if (!jobForm.IndustryType) return showToast("Industry Type is required", "error"); 
    if (!jobForm.JobType) return showToast("Job Type is required", "error"); 
    if (!jobForm.JobDescription.trim()) return showToast("Job Description is required", "error"); 
    if (!jobForm.EmploymentType) return showToast("Employment Type is required", "error"); 
    if (!jobForm.EmploymentMode) return showToast("Employment Mode is required", "error"); 
 
    setLoading(true); 
    try { 
      const response = await saveJobDetails({ 
        JobId: jobId ?? "", 
        JobTitle: jobForm.JobTitle, 
        TradeCategory: jobForm.TradeCategory, 
        Role: jobForm.Role, 
        IndustryType: jobForm.IndustryType, 
        ExperienceMinYears: jobForm.ExperienceMinYears, 
        ExperienceMaxYears: jobForm.ExperienceMaxYears, 
        JobType: jobForm.JobType, 
        EmploymentType: jobForm.EmploymentType, 
        EmploymentMode: jobForm.EmploymentMode, 
        Department: jobForm.Department, 
        DutyHoursPerDay: jobForm.DutyHoursPerDay, 
        IsOilField: jobForm.IsOilField, 
        PaidOvertime: jobForm.PaidOvertime, 
        KeyResponsibilities: jobForm.KeyResponsibilities, 
        JobDescription: jobForm.JobDescription, 
      }); 
      setJobId(response.jobId); 
      updateDraft(response); 
      go(2); 
    } catch (error) { 
      console.error("Step 1:", error?.response?.data ?? error); 
      showToast("Failed to save job details. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const handleStep2 = async () => { 
    if (!jobForm.SalaryMin) return showToast("Minimum Salary is required", "error"); 
    if (!jobForm.SalaryMax) return showToast("Maximum Salary is required", "error"); 
 
    setLoading(true); 
    try { 
      const response = await saveCompensation(jobId, { 
        SalaryMin: jobForm.SalaryMin, 
        SalaryMax: jobForm.SalaryMax, 
        SalaryCurrency: jobForm.SalaryCurrency, 
        SalaryDisplayOption: jobForm.SalaryDisplayOption, 
      }); 
      updateDraft(response); 
      go(3); 
    } catch (error) { 
      console.error("Step 2:", error?.response?.data ?? error); 
      showToast("Failed to save compensation. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const handleStep3 = async () => { 
    setLoading(true); 
    try { 
      console.log("Saving Step 3:", { 
        Benefits: jobForm.Benefits, 
        Tags: jobForm.Tags, 
        KeySkills: jobForm.KeySkills, 
      }); 
      const response = await saveSkills(jobId, { 
        KeySkills: jobForm.KeySkills, 
        KeyResponsibilities: jobForm.Step3KeyResponsibilities, 
        AdditionalJobDescription: jobForm.AdditionalJobDescription, 
        LicenceDocsRequired: jobForm.LicenceDocsRequired, 
        LanguageRequired: jobForm.LanguageRequired, 
        Benefits: jobForm.Benefits, 
        Tags: jobForm.Tags, 
      }); 
      updateDraft(response); 
      go(4); 
    } catch (error) { 
      console.error("Step 3:", error?.response?.data ?? error); 
      showToast("Failed to save skills. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const handleStep4 = async () => { 
    if (!jobForm.Vacancies) return showToast("Number of Vacancies is required", "error"); 
 
    setLoading(true); 
    try { 
      const response = await saveEligibility(jobId, { 
        Vacancies: jobForm.Vacancies, 
        EducationRequired: jobForm.EducationRequired, 
        AgeMin: jobForm.AgeMin, 
        AgeMax: jobForm.AgeMax, 
        GenderPreferred: jobForm.GenderPreferred, 
        DisabilityEligible: jobForm.DisabilityEligible, 
        PassportRequired: jobForm.PassportRequired, 
        PassportValidityMonths: jobForm.PassportValidityMonths, 
      }); 
      updateDraft(response); 
      go(5); 
    } catch (error) { 
      console.error("Step 4:", error?.response?.data ?? error); 
      showToast("Failed to save eligibility. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
 
  const handleStep5 = async () => { 
    if (!jobForm.LocationType) return showToast("Location Type is required", "error"); 
    if ( 
      jobForm.LocationType === "Offshore" && 
      !jobForm.OffshoreVesselName.trim() 
    ) { 
      setErrors((prev) => ({ 
        ...prev, 
        OffshoreVesselName: "Vessel / Platform Name is required", 
      })); 
 
      return; 
    } 
 
    setErrors((prev) => ({ 
      ...prev, 
      OffshoreVesselName: "", 
    })); 
 
    setLoading(true); 
    try { 
      const response = await saveLocation(jobId, { 
        LocationType: jobForm.LocationType, 
        Country: jobForm.Country, 
        WorkAddressLine: jobForm.WorkAddressLine, 
        OnshoreCity: jobForm.OnshoreCity, 
        OnshoreState: jobForm.OnshoreState, 
        OnshoreCountry: jobForm.OnshoreCountry, 
        OnshorePincode: jobForm.OnshorePincode, 
        OffshoreVesselName: jobForm.OffshoreVesselName, 
        OffshoreRegion: jobForm.OffshoreRegion, 
        OffshoreCountry: jobForm.OffshoreCountry, 
      }); 
      updateDraft(response); 
      go(6); 
    } catch (error) { 
      console.error("Step 5:", error?.response?.data ?? error); 
      showToast("Failed to save location. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const handleStep6 = async () => { 
    setLoading(true); 
 
    try { 
      const response = await saveQuestions(jobId, { 
        questions: jobForm.questions 
          .filter((q) => q.questionText.trim() !== "") 
          .map((q) => ({ 
            questionText: q.questionText, 
          })), 
      }); 
 
      updateDraft(response); 
      go(7); 
    } catch (error) { 
      console.error("Step 6:", error?.response?.data ?? error); 
      showToast("Failed to save questions. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const handleStep7 = async () => { 
    const issues = validateAllSteps(jobForm); 
    if (issues.length > 0) { 
      showToast( 
        `Please complete ${issues.length} pending item${issues.length > 1 ? "s" : ""} before publishing — see the checklist below`, 
        "warning" 
      ); 
      // jump to whichever earlier step has the first unresolved issue so it's not hidden off-screen 
      if (issues[0].stepNum !== 7) go(issues[0].stepNum); 
      return; 
    } 
 
    setLoading(true); 
    try { 
      await publishJob({ 
        JobId: jobId, 
        ApplicationDeadline: jobForm.ApplicationDeadline, 
        CompanyVisibility: jobForm.CompanyVisibility, 
        JobType: jobForm.JobType, 
        PublishingTags: jobForm.PublishingTags, 
        PublishNow: jobForm.PublishNow, 
      }); 
      localStorage.removeItem("jobDraft"); 
      showToast("Job published successfully!", "success"); 
      router.push("/employeer/job-list?success=job-published"); 
    } catch (error) { 
      console.error("Step 7:", error?.response?.data ?? error); 
      showToast("Failed to publish job. Please try again.", "error"); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const stepHandlers = [ 
    handleStep1, 
    handleStep2, 
    handleStep3, 
    handleStep4, 
    handleStep5, 
    handleStep6, 
    handleStep7, 
  ]; 
 
  const ActiveStep = STEP_VIEWS[activeStep - 1] ?? Step7; 
 
  /* ── render ── */ 
  return ( 
    <main className="main"> 
      <section className={`section-box mt-50 mb-50 ${styles.pageSection}`}> 
        <div className={`container ${styles.layout}`}> 
          <div className={styles.content}> 
            {/* Header */} 
            <div className="box-filters-job"> 
              <div className="row align-items-center"> 
                <div className="col-xl-8 col-lg-8"> 
                  <h3 className="mb-5">Post a Job</h3> 
                  <span className="font-sm color-text-paragraph-2"> 
                    Create normal, hot vacancy, and classified posts in the same 
                    employer workflow. 
                  </span> 
                </div> 
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15"> 
                  <div className={styles.headerActions}> 
                    <button 
                      className={`btn btn-default btn-sm ${styles.btnSoft}`} 
                      disabled={!jobId || loading} 
                      onClick={async () => { 
                        if (!jobId) return; 
                        try { 
                          await saveDraft(jobId); 
                          showToast("Draft saved!", "success"); 
                        } catch (error) { 
                          console.error(error); 
                          showToast("Could not save draft.", "error"); 
                        } 
                      }} 
                    > 
                      Save Draft 
                    </button> 
                    <button 
                      type="button" 
                      className="btn btn-default btn-sm" 
                      onClick={() => setShowPreview(true)} 
                    > 
                      Preview 
                    </button> 
                  </div> 
                </div> 
              </div> 
            </div> 
 
            {/* Progress bar */} 
            <StepProgressBar 
              activeStep={activeStep} 
              onStepClick={go} 
              lastCompletedStep={lastCompletedStep} 
            /> 
 
            {/* Active step */} 
            <div className={styles.body}> 
              <div className={styles.fullFormPanel}> 
                {loading && ( 
                  <div style={{ textAlign: "center", padding: "10px 0", fontWeight: 600, color: "#555" }}> 
                    Saving… 
                  </div> 
                )} 
 
                <ActiveStep 
                  go={go} 
                  jobForm={jobForm} 
                  setJobForm={setJobForm} 
                  errors={errors} 
                  onSubmit={stepHandlers[activeStep - 1] ?? (() => { })} 
                  handleGenerateJD={handleGenerateJD} 
                  handleGenerateAdditionalJD={handleGenerateAdditionalJD} 
                  loadingAI={loadingAI} 
                  jdSuggestions={jdSuggestions} 
                  additionalJdSuggestions={additionalJdSuggestions} 
                  ghostSuggestion={ghostSuggestion} 
                  handleJDTab={handleJDTab} 
                  handleSuggestSkills={handleSuggestSkills} 
                  skillsLoading={skillsLoading} 
                  preflightIssues={preflightIssues} 
                /> 
 
                <div className={styles.bottomLink}> 
                  <Link href="/dashboard">Back to Dashboard</Link> 
                </div> 
              </div> 
            </div> 
          </div> 
        </div> 
      </section> 
 
      <JobPreviewModal 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        job={jobForm} 
      /> 
    </main> 
  ); 
}