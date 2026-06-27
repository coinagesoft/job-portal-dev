import { Suspense } from "react";
import EmployerApplicantsClient from "./EmployerApplicantsClient";

export const metadata = {
  title: "Employer Applicants - Job Portal",
  description: "Track and manage candidate applications.",
};

const EmployerApplicantsPage = () => (
  <Suspense fallback={null}>
    <EmployerApplicantsClient />
  </Suspense>
);

export default EmployerApplicantsPage;