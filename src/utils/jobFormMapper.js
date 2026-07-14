/**
 * Maps the `/api/recruiter/jobs/{jobId}/resume` API response (step1Data..step7Data)
 * into the flat `jobForm` shape used by the Post-a-Job wizard and by the
 * job-list Preview modal. Kept in one place so both pages always agree on
 * field names.
 */
export const mapResumeToForm = (response, defaultTradeCategory = "Welding") => ({
  // Step 1
  JobTitle: response.step1Data?.jobTitle ?? "",
  TradeCategory: response.step1Data?.tradeCategory ?? defaultTradeCategory,
  Role: response.step1Data?.role ?? "",
  IndustryType: response.step1Data?.industryType ?? "",
  ExperienceMinYears: response.step1Data?.experienceMinYears ?? "",
  ExperienceMaxYears: response.step1Data?.experienceMaxYears ?? "",
  JobType: response.step1Data?.jobType ?? "",
  EmploymentType: response.step1Data?.employmentType ?? "Full_Time",
  EmploymentMode: response.step1Data?.employmentMode ?? "Onsite",
  Department: response.step1Data?.department ?? "",
  DutyHoursPerDay: response.step1Data?.dutyHoursPerDay ?? "",
  IsOilField: response.step1Data?.isOilField ?? false,
  PaidOvertime: response.step1Data?.paidOvertime ?? false,
  KeyResponsibilities: response.step1Data?.keyResponsibilities ?? [],
  JobDescription: response.step1Data?.jobDescription ?? "",

  // Step 2
  SalaryMin: response.step2Data?.salaryMin?.toString() ?? "",
  SalaryMax: response.step2Data?.salaryMax?.toString() ?? "",
  SalaryCurrency: response.step2Data?.salaryCurrency ?? "INR",
  SalaryDisplayOption: response.step2Data?.salaryDisplayOption ?? "Show_Range",

  // Step 3
  KeySkills: response.step3Data?.keySkills ?? [],
  Step3KeyResponsibilities: response.step3Data?.keyResponsibilities ?? [],
  AdditionalJobDescription: response.step3Data?.additionalJobDescription ?? "",
  LicenceDocsRequired: response.step3Data?.licenceDocsRequired ?? "",
  LanguageRequired: response.step3Data?.languageRequired ?? "",
  Benefits: response.step3Data?.benefits ?? [],
  Tags: response.step3Data?.tags ?? [],

  // Step 4
  Vacancies: response.step4Data?.vacancies ?? 1,
  EducationRequired: response.step4Data?.educationRequired ?? "Any",
  AgeMin: response.step4Data?.ageMin ?? "",
  AgeMax: response.step4Data?.ageMax ?? "",
  GenderPreferred: response.step4Data?.genderPreferred ?? "Any",
  DisabilityEligible: response.step4Data?.disabilityEligible ?? false,
  PassportRequired: response.step4Data?.passportRequired ?? false,
  PassportValidityMonths: response.step4Data?.passportValidityMonths ?? "",

  // Step 5
  LocationType: response.step5Data?.locationType ?? "Onshore",
  Country: response.step5Data?.country ?? "India",
  WorkAddressLine: response.step5Data?.workAddressLine ?? "",
  OnshoreCity: response.step5Data?.onshoreCity ?? "",
  OnshoreState: response.step5Data?.onshoreState ?? "",
  OnshoreCountry: response.step5Data?.onshoreCountry ?? "",
  OnshorePincode: response.step5Data?.onshorePincode ?? "",
  OffshoreVesselName: response.step5Data?.offshoreVesselName ?? "",
  OffshoreRegion: response.step5Data?.offshoreRegion ?? "",
  OffshoreCountry: response.step5Data?.offshoreCountry ?? "",

  // Step 6
  questions: response.step6Data?.questions?.length
    ? response.step6Data.questions
    : [],

  // Step 7 – publishing data IS returned in resume as step7Data
  ApplicationDeadline: response.step7Data?.applicationDeadline ?? "",
  CompanyVisibility: response.step7Data?.companyVisibility ?? "ShowName",
  PublishingTags: response.step7Data?.publishingTags ?? [],
  PublishNow: response.step7Data?.publishNow ?? true,
});