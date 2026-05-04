import Image from "next/image";

// Sidebar navigation order must match the content sections in ProfileTabs.
const SECTION_MENU = [
  { id: "personal", icon: "icon-user", label: "Step 1: Personal Info" },
  { id: "documents", icon: "icon-folder", label: "Step 2: Upload Documents" },
  { id: "work", icon: "icon-briefcase", label: "Step 3: Work History" },
  { id: "education", icon: "icon-graduation-cap", label: "Step 4: Education" },
  { id: "skills", icon: "icon-lightning", label: "Step 5: Skills" },
  { id: "languages", icon: "icon-globe", label: "Step 6: Languages" },
  { id: "cv", icon: "icon-file", label: "Step 7: CV Preview" }
];

const ProfileSidebar = ({
  profileData,
  completionPercent,
  activeSection,
  onSectionChange,
  onToggleAvailability
}) => {
  const fullName =
    profileData.fullName || `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim();
  const displayTitle = `${profileData.trade || "Candidate"} | ${profileData.yearsOfExperience || 0} yrs | ${profileData.city || ""}`;
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  const completionHint = profileData.completionHint || 'Please add detailed information to your profile. This will help you develop your career more quickly.';

  return (
    <aside className="candidate-profile-v2-sidebar-card candidate-profile-v2-sidebar-sticky">
      <div className="candidate-profile-v2-sidebar-hero">
        <div className="candidate-profile-v2-avatar-wrap">
          {profileData.avatar ? (
            <Image
              src={profileData.avatar}
              alt={fullName}
              width={72}
              height={72}
              className="candidate-profile-v2-avatar-image"
            />
          ) : (
            <span className="candidate-profile-v2-avatar-fallback">{initials || "CP"}</span>
          )}
          <button type="button" className="candidate-profile-v2-avatar-edit" aria-label="Edit avatar">
            Edit
          </button>
        </div>
        <h6 className="candidate-profile-v2-sidebar-name">{fullName}</h6>
        <p className="candidate-profile-v2-sidebar-trade">{displayTitle}</p>
        <div className="candidate-profile-v2-badges">
          {profileData.sidebarBadges.map((badge) => (
            <span key={badge} className="candidate-profile-v2-badge is-brand">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="border-bottom mb-20 mt-20"></div>
      
      <div className="box-profile-completed text-center mb-30">
        <div id="circle-staticstic-demo" data-percent={completionPercent || 0}></div>
        <h6 className="mb-10">Profile Completed</h6>
        <p className="font-xs color-text-mutted">{completionHint}</p>
      </div>

      <div className="border-bottom mb-20"></div>

      <button
        type="button"
        className={`candidate-profile-v2-availability ${profileData.availableForWork ? "is-on" : "is-off"}`}
        onClick={onToggleAvailability}
      >
        <span className="candidate-profile-v2-toggle">
          <span className="candidate-profile-v2-toggle-knob" />
        </span>
        <span>
          <strong>{profileData.availableForWork ? "Available for work" : "Not available"}</strong>
          <small>
            {profileData.availableForWork ? "Visible to employers" : "Hidden from employers"}
          </small>
        </span>
      </button>

      <nav className="candidate-profile-v2-menu" aria-label="Profile sections">
        {SECTION_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`candidate-profile-v2-menu-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => onSectionChange(item.id)}
          >
            <i className={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
