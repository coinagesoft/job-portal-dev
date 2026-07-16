"use client";
import { useEffect, useState } from "react";

import {
  getSubUsers,
  inviteSubUser,
  updateSubUser,
  deactivateSubUser,
  reactivateSubUser,
  resendInvite,
  deleteSubUser,
  getRolePermissions,
} from "@/services/recruiter/recruiterSubUserService";

import { useToast } from "@/components/Toast";

const JOB_TAG_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#EAF4FF",
  border: "1px solid #B9DCFF",
  color: "#1D4ED8",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
  lineHeight: 1,
  transition: "all 0.25s ease",
  cursor: "pointer",
};

const handleTagHoverEnter = (event) => {
  event.currentTarget.style.background = "#1D4ED8";
  event.currentTarget.style.color = "#ffffff";
  event.currentTarget.style.transform = "translateY(-1px)";
};

const handleTagHoverLeave = (event) => {
  event.currentTarget.style.background = "#EAF4FF";
  event.currentTarget.style.color = "#1D4ED8";
  event.currentTarget.style.transform = "translateY(0px)";
};

const getStatusStyle = (status) => {
  if (status === "Owner") {
    return {
      background: "#eef4ff",
      color: "#2563eb",
    };
  }

  if (status === "Active") {
    return {
      background: "#ecfdf3",
      color: "#0BAB7C",
    };
  }

  return {
    background: "#fff7ea",
    color: "#ff9900",
  };
};

const EmployerSubUserPage = () => {
  const showToast = useToast();
  const [editingUser, setEditingUser] = useState(null);
  const [subUsers, setSubUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadSubUsers = async () => {
    try {
      setLoading(true);

      const response = await getSubUsers();

      setSubUsers(response.subUsers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const [inviteForm, setInviteForm] = useState({
    subUserName: "",
    subUserEmail: "",
    subUserMobile: "",
    countryCode: "+91",
    role: "Recruiter",
  });

  const [formErrors, setFormErrors] = useState({});

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateInviteForm = () => {
    const errors = {};

    if (!inviteForm.subUserName.trim()) {
      errors.subUserName = "Name is required";
    } else if (inviteForm.subUserName.trim().length < 2) {
      errors.subUserName = "Name looks too short";
    }

    if (!inviteForm.subUserEmail.trim()) {
      errors.subUserEmail = "Email is required";
    } else if (!EMAIL_REGEX.test(inviteForm.subUserEmail.trim())) {
      errors.subUserEmail = "Enter a valid email address";
    }

    const digitsOnly = inviteForm.subUserMobile.replace(/\D/g, "");
    if (!digitsOnly) {
      errors.subUserMobile = "Mobile number is required";
    } else if (digitsOnly.length < 7 || digitsOnly.length > 12) {
      errors.subUserMobile = "Mobile number must be 7–12 digits";
    }

    if (!inviteForm.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Maps the visible permission labels to the API/DTO keys.
  const PERMISSION_FIELDS = [
    { label: "Search candidates", key: "canSearchCandidates" },
    { label: "Can unlock profiles", key: "canUnlockProfiles" },
    { label: "Post jobs", key: "canPostJobs" },
    { label: "Manage applications", key: "canManageApplications" },
  ];

  const [permissions, setPermissions] = useState({
    canSearchCandidates: false,
    canUnlockProfiles: false,
    canPostJobs: false,
    canManageApplications: false,
  });

  // Pull the default permission set for a role from the backend.
  const applyRolePermissions = async (role) => {
    try {
      const data = await getRolePermissions(role);
      const p = data?.permissions || {};
      setPermissions({
        canSearchCandidates: !!p.canSearchCandidates,
        canUnlockProfiles: !!p.canUnlockProfiles,
        canPostJobs: !!p.canPostJobs,
        canManageApplications: !!p.canManageApplications,
      });
    } catch (error) {
      console.error("Failed to load role permissions", error);
    }
  };

  const resetInviteForm = () => {
    setEditingUser(null);
    setFormErrors({});
    setInviteForm({
      subUserName: "",
      subUserEmail: "",
      subUserMobile: "",
      countryCode: "+91",
      role: "Recruiter",
    });
    applyRolePermissions("Recruiter");
  };

  useEffect(() => {
    loadSubUsers();
    // Show what the pre-selected role ("Recruiter") actually grants right
    // away, instead of leaving every permission tag blank until the user
    // happens to touch the Role dropdown.
    applyRolePermissions(inviteForm.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#122359",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Sub-User Management
                </h3>

                <span className="font-sm color-text-paragraph-2">
                  Shared wallet permissions with role-based access controls.
                </span>
              </div>

              {/* <button
                className="btn btn-default btn-sm"
                style={{
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                }}
                type="button"
              >
                <i
                  className="fi fi-rr-user-add"
                  style={{ marginRight: "6px" }}
                />
                Invite sub-user
              </button> */}
            </div>

            {/* Info Card */}
            <div
              className="subuser-hover-card"
              style={{
                background: "#ffffff",
                borderRadius: "22px",
                border: "1px solid rgba(18,35,89,0.06)",
                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                padding: "24px",
                marginBottom: "24px",
                transition: "all .35s ease",
              }}
            >
              <p
                style={{
                  color: "#122359",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                Sub-users share the same credit wallet. Only the account owner
                can buy credits or invite users.
              </p>

              <p
                style={{
                  marginBottom: 0,
                  color: "#66789c",
                  fontSize: "13px",
                }}
              >
                Recruiter role cannot purchase credits. Deactivate immediately
                revokes login access.
              </p>
            </div>

            {/* User Cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginBottom: "30px",
              }}
            >
              {subUsers.map((user) => (
                <div
                  key={user.subUserId}
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid rgba(18,35,89,0.08)",
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: "24px",
                    transition: "all .35s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Left */}
                    <div
                      style={{
                        display: "flex",
                        gap: "18px",
                        flex: 1,
                        minWidth: "280px",
                      }}
                    >
                      <div
                        style={{
                          width: "58px",
                          height: "58px",
                          borderRadius: "18px",
                          background: "#fff7ea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ff9900",
                          fontWeight: 800,
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {user.subUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginBottom: "6px",
                          }}
                        >
                          <h5
                            style={{
                              margin: 0,
                              color: "#122359",
                              fontWeight: 700,
                            }}
                          >
                            {user.subUserName}
                          </h5>

                          <span
                            style={{
                              ...JOB_TAG_STYLE,
                              ...getStatusStyle(user.status),
                            }}
                          >
                            {user.status}
                          </span>
                        </div>

                        <div
                          style={{
                            color: "#66789c",
                            fontSize: "14px",
                            marginBottom: "8px",
                          }}
                        >
                          {user.role}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "18px",
                            flexWrap: "wrap",
                            fontSize: "13px",
                            color: "#66789c",
                          }}
                        >
                          <span>
                            <i
                              className="fi fi-rr-envelope"
                              style={{
                                marginRight: "6px",
                              }}
                            />
                            {user.subUserEmail}
                          </span>

                          <span>
                            <i
                              className="fi fi-rr-phone-call"
                              style={{
                                marginRight: "6px",
                              }}
                            />
                            {user.countryCode} {user.subUserMobile}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div
                      style={{
                        minWidth: "260px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "8px",
                          marginBottom: "16px",
                          fontSize: "12px",
                          color: "#66789c",
                        }}
                      >
                        <span>
                          <strong style={{ color: "#0f172a" }}>
                            {user.remainingCredits ?? 0}
                          </strong>{" "}
                          / {user.allocatedCredits ?? 0} credits allocated
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          justifyContent: "flex-end",
                          marginBottom: "16px",
                        }}
                      >
                        {[
                          {
                            label: "Unlock",
                            value: user.permissions?.canUnlockProfiles,
                          },
                          {
                            label: "Search",
                            value: user.permissions?.canSearchCandidates,
                          },
                          {
                            label: "Post Job",
                            value: user.permissions?.canPostJobs,
                          },
                          {
                            label: "Manage",
                            value: user.permissions?.canManageApplications,
                          },
                        ].map((item) => (
                          <span
                            key={item.label}
                            title="Read-only — use Edit to change permissions"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "7px 12px",
                              borderRadius: "999px",
                              background: item.value ? "#ecfdf3" : "#f4f5f7",
                              color: item.value ? "#0BAB7C" : "#66789c",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "default",
                              pointerEvents: "none",
                            }}
                          >
                            {item.label}: {item.value ? "Yes" : "No"}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-border btn-sm"
                          onClick={() => {
                            setEditingUser(user);
                            setFormErrors({});

                            setInviteForm({
                              subUserName: user.subUserName || "",
                              subUserEmail: user.subUserEmail || "",
                              subUserMobile: user.subUserMobile || "",
                              countryCode: user.countryCode || "+91",
                              role: user.role || "Recruiter",
                            });

                            setPermissions({
                              canSearchCandidates:
                                !!user.permissions?.canSearchCandidates,
                              canUnlockProfiles:
                                !!user.permissions?.canUnlockProfiles,
                              canPostJobs: !!user.permissions?.canPostJobs,
                              canManageApplications:
                                !!user.permissions?.canManageApplications,
                            });
                          }}
                        >
                          <i className="fi fi-rr-edit me-1" />
                          Edit
                        </button>

                        {user.status === "Active" ? (
                          <button
                            className="btn btn-grey-small"
                            onClick={async () => {
                              await deactivateSubUser(user.subUserId);
                              loadSubUsers();
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-default btn-sm"
                            onClick={async () => {
                              await reactivateSubUser(user.subUserId);
                              loadSubUsers();
                            }}
                          >
                            Reactivate
                          </button>
                        )}

                        {!user.inviteAccepted && (
                          <button
                            className="btn btn-border btn-sm"
                            onClick={async () => {
                              try {
                                await resendInvite(user.subUserId);
                                showToast("Invite resent", "success");
                              } catch (error) {
                                showToast(
                                  error.response?.data?.message ||
                                    "Failed to resend invite",
                                  "error",
                                );
                              }
                            }}
                          >
                            <i className="fi fi-rr-paper-plane me-1" />
                            Resend
                          </button>
                        )}

                        <button
                          className="btn btn-grey-small"
                          style={{ color: "#a32d2d" }}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Remove ${user.subUserName}? This cannot be undone.`,
                              )
                            )
                              return;
                            try {
                              await deleteSubUser(user.subUserId);
                              showToast("Sub-user removed", "success");
                              loadSubUsers();
                            } catch (error) {
                              showToast(
                                error.response?.data?.message ||
                                  "Failed to remove sub-user",
                                "error",
                              );
                            }
                          }}
                        >
                          <i className="fi fi-rr-trash me-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Cards */}
            <div className="row">
              {/* Invite */}
              <div className="col-lg-6 col-md-12 col-sm-12">
                <div
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid rgba(18,35,89,0.08)",
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: "28px",
                    transition: "all .35s ease",
                    height: "100%",
                  }}
                >
                  <h5
                    style={{
                      color: "#122359",
                      fontWeight: 800,
                      marginBottom: "20px",
                    }}
                  >
                    Invite Sub-User
                  </h5>

                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Full name"
                      value={inviteForm.subUserName || ""}
                      disabled={!!editingUser}
                      style={
                        editingUser
                          ? {
                              background: "#f4f5f7",
                              color: "#66789c",
                              cursor: "not-allowed",
                            }
                          : formErrors.subUserName
                            ? { borderColor: "#E24B4A" }
                            : undefined
                      }
                      onChange={(e) => {
                        setInviteForm({
                          ...inviteForm,
                          subUserName: e.target.value,
                        });
                        if (formErrors.subUserName) {
                          setFormErrors((prev) => ({ ...prev, subUserName: undefined }));
                        }
                      }}
                    />
                    {formErrors.subUserName && !editingUser && (
                      <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                        {formErrors.subUserName}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      placeholder="Corporate email"
                      value={inviteForm.subUserEmail || ""}
                      disabled={!!editingUser}
                      style={
                        editingUser
                          ? {
                              background: "#f4f5f7",
                              color: "#66789c",
                              cursor: "not-allowed",
                            }
                          : formErrors.subUserEmail
                            ? { borderColor: "#E24B4A" }
                            : undefined
                      }
                      onChange={(e) => {
                        setInviteForm({
                          ...inviteForm,
                          subUserEmail: e.target.value,
                        });
                        if (formErrors.subUserEmail) {
                          setFormErrors((prev) => ({ ...prev, subUserEmail: undefined }));
                        }
                      }}
                    />
                    {formErrors.subUserEmail && !editingUser && (
                      <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                        {formErrors.subUserEmail}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="+91 XXXXX XXXXX"
                      value={inviteForm.subUserMobile || ""}
                      disabled={!!editingUser}
                      style={
                        editingUser
                          ? {
                              background: "#f4f5f7",
                              color: "#66789c",
                              cursor: "not-allowed",
                            }
                          : formErrors.subUserMobile
                            ? { borderColor: "#E24B4A" }
                            : undefined
                      }
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setInviteForm({
                          ...inviteForm,
                          subUserMobile: digitsOnly,
                        });
                        if (formErrors.subUserMobile) {
                          setFormErrors((prev) => ({ ...prev, subUserMobile: undefined }));
                        }
                      }}
                    />
                    {formErrors.subUserMobile && !editingUser && (
                      <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                        {formErrors.subUserMobile}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>

                    <select
                      className="form-control form-select"
                      value={inviteForm.role || "Recruiter"}
                      onChange={(e) => {
                        const role = e.target.value;
                        setInviteForm({
                          ...inviteForm,
                          role,
                        });
                        applyRolePermissions(role);
                      }}
                    >
                      <option value="Recruiter">Recruiter</option>
                      <option value="HR_Manager">HR Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label d-block mb-12">
                      Permissions
                    </label>
                    <p style={{ fontSize: 12, color: "#66789c", marginTop: -6, marginBottom: 12 }}>
                      Set automatically by the selected role — pick a different role above to change these.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      {PERMISSION_FIELDS.map(({ label, key }) => (
                        <span
                          key={key}
                          title="Set by the selected role"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 14px",
                            borderRadius: "999px",
                            background: permissions[key] ? "#1D4ED8" : "#EAF4FF",
                            border: "1px solid #B9DCFF",
                            color: permissions[key] ? "#ffffff" : "#1D4ED8",
                            fontSize: "12px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                            cursor: "default",
                            userSelect: "none",
                            opacity: permissions[key] ? 1 : 0.6,
                          }}
                        >
                          <i
                            className="fi fi-rr-check"
                            style={{
                              fontSize: "10px",
                              marginRight: "6px",
                            }}
                          />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!editingUser && !validateInviteForm()) {
                        showToast("Please fix the highlighted fields", "error");
                        return;
                      }

                      try {
                        if (editingUser) {
                          await updateSubUser(editingUser.subUserId, {
                            role: inviteForm.role,
                            ...permissions,
                          });

                          showToast("User updated successfully", "success");
                        } else {
                          await inviteSubUser(inviteForm);

                          showToast("Invitation sent successfully", "success");
                        }

                        await loadSubUsers();

                        resetInviteForm();
                      } catch (error) {
                        console.error(error.response?.data);

                        showToast(
                          error.response?.data?.message || "Operation failed",
                          "error",
                        );
                      }
                    }}
                    className="btn btn-default btn-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "10px 18px",
                      fontWeight: 700,
                      boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                    }}
                    type="button"
                  >
                    {editingUser ? "Update User" : "Send Invite"}
                  </button>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#66789c",
                      marginTop: "12px",
                      marginBottom: 0,
                    }}
                  >
                    Invite links expire automatically in 72 hours.
                  </p>
                </div>
              </div>

              {/* Matrix */}
              <div className="col-lg-6 col-md-12 col-sm-12 mt-md-20 mt-sm-20">
                <div
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid rgba(18,35,89,0.08)",
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: "28px",
                    transition: "all .35s ease",
                    height: "100%",
                  }}
                >
                  <h5
                    style={{
                      color: "#122359",
                      fontWeight: 800,
                      marginBottom: "22px",
                    }}
                  >
                    Permission Matrix
                  </h5>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {[
                      {
                        role: "Account owner",
                        desc: "Search, post jobs, manage applications, unlock profiles and buy credits.",
                      },
                      {
                        role: "HR Manager",
                        desc: "Search, post jobs, manage applications and unlock profiles.",
                      },
                      {
                        role: "Recruiter",
                        desc: "Search, manage applications and unlock profiles.",
                      },
                      {
                        role: "Viewer",
                        desc: "Search only.",
                      },
                    ].map((item) => (
                      <div
                        key={item.role}
                        className="permission-matrix-item"
                        style={{
                          padding: "16px",
                          borderRadius: "16px",
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            color: "#122359",
                            fontWeight: 700,
                            marginBottom: "5px",
                          }}
                        >
                          {item.role}
                        </div>

                        <div
                          style={{
                            color: "#66789c",
                            fontSize: "13px",
                            lineHeight: 1.7,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="subuser-alert"
                    style={{
                      marginTop: "20px",
                      padding: "16px",
                      borderRadius: "16px",
                      background: "#fff7ea",
                      border: "1px solid rgba(255,163,0,0.18)",
                      color: "#ff9900",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    <i
                      className="fi fi-rr-info"
                      style={{ marginRight: "6px" }}
                    />
                    Deactivate removes access instantly and keeps audit logs
                    intact.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerSubUserPage;