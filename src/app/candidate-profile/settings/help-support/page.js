"use client";

import SettingsPageShell from "../components/SettingsPageShell";
import SupportTicketCenter from "@/components/SupportTicketCenter";

const CandidateHelpSupportPage = () => {
  return (
    <SettingsPageShell
      title="Help & Support"
      description="Raise a support ticket, review admin replies, and manage open requests."
    >
      <div className="candidate-help-support-page">
        <SupportTicketCenter
          audience="candidate"
          title="Other Ways to Reach Us"
          description="For urgent assistance, email support or continue the thread on your open ticket."
        />
      </div>
    </SettingsPageShell>
  );
};

export default CandidateHelpSupportPage;

