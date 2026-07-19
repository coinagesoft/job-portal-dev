"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import {
  CANDIDATE_FAQ_ITEMS,
  EMPLOYER_FAQ_ITEMS,
  SUPPORT_TICKET_CATEGORIES,
} from "@/constants/supportTicketsData";
import * as candidateApi from "@/services/settingCandidate/supportTicketService";
import * as recruiterApi from "@/services/recruiter/supportTicketService";
import { getCandidateId } from "@/utils/authHelper";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusClass = (status) => {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "active";
  return "open";
};

const CATEGORY_TO_API = {
  "Profile & Resume": "ProfileAndResume",
  "Job Application": "JobApplication",
  "Payment & Billing": "PaymentAndBilling",
  "Account Access": "AccountAccess",
  "Technical Issue": "TechnicalIssue",
  Other: "Other",
};

const CATEGORY_LABELS = {
  ProfileAndResume: "Profile & Resume",
  JobApplication: "Job Application",
  PaymentAndBilling: "Payment & Billing",
  AccountAccess: "Account Access",
  TechnicalIssue: "Technical Issue",
  Other: "Other",
};

const formatCategory = (category) => CATEGORY_LABELS[category] || category;

const normalizeReply = (reply) => {
  const sender =
    String(reply.senderType || "").toLowerCase() === "admin"
      ? "admin"
      : "candidate";

  return {
    id: reply.replyId,
    sender,
    senderLabel: sender === "admin" ? "Support Team" : "You",
    createdOn: reply.createdAt,
    text: reply.message || "",
  };
};

const normalizeTicket = (ticket, audience) => {
  const initialMessage = ticket.description
    ? [
      {
        id: `${ticket.ticketId}-description`,
        sender: audience,
        senderLabel: "You",
        createdOn: ticket.createdAt,
        text: ticket.description,
      },
    ]
    : [];

  return {
    id: ticket.ticketId,
    audience,
    subject: ticket.subject || "",
    category: ticket.category || "",
    description: ticket.description || "",
    status: ticket.status || "Open",
    createdOn: ticket.createdAt,
    updatedOn: ticket.resolvedAt || ticket.createdAt,
    messages: [
      ...initialMessage,
      ...(Array.isArray(ticket.replies)
        ? ticket.replies.map(normalizeReply)
        : []),
    ],
  };
};

const getLatestAdminReply = (messages = []) => {
  const adminMessages = messages.filter((item) => item.sender === "admin");
  return adminMessages.length ? adminMessages[adminMessages.length - 1] : null;
};

const SupportTicketCenter = ({
  audience = "candidate",
  title = "Help & Support",
  description = "Raise a support ticket and track admin replies in one place.",
}) => {
  const ticketApi = useMemo(
    () => (audience === "employer" ? recruiterApi : candidateApi),
    [audience],
  );
  const candidateId = useMemo(() => {
    if (audience === "employer") return null;

    try {
      return getCandidateId();
    } catch {
      return null;
    }
  }, [audience]);
  const showToast = useToast();
  const [allTickets, setAllTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState("");
  const [newReplyTextByTicket, setNewReplyTextByTicket] = useState({});
  const [form, setForm] = useState({
    subject: "",
    category: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [ticketSummary, setTicketSummary] = useState({
    totalTickets: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const loadTickets = useCallback(async () => {
    if (audience !== "employer" && !candidateId) return;

    try {
      const response =
        audience === "employer"
          ? await ticketApi.getTickets()
          : await ticketApi.getTickets(candidateId);

      if (response?.data?.tickets) {
        setAllTickets(
          response.data.tickets.map((ticket) =>
            normalizeTicket(ticket, audience),
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, [audience, candidateId, ticketApi]);

  const loadTicketSummary = useCallback(async () => {
    if (audience !== "employer" && !candidateId) return;

    try {
      const response =
        audience === "employer"
          ? await ticketApi.getTicketSummary()
          : await ticketApi.getTicketSummary(candidateId);

      if (response?.data) {
        setTicketSummary({
          totalTickets: response.data.totalTickets || 0,
          open: response.data.open || 0,
          inProgress: response.data.inProgress || 0,
          resolved: response.data.resolved || 0,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [audience, candidateId, ticketApi]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadTickets();
      void loadTicketSummary();
    });
  }, [loadTickets, loadTicketSummary]);

  const loadTicketThread = async (ticketId) => {
    if (audience !== "employer" && !candidateId) return;

    try {
      const response =
        audience === "employer"
          ? await ticketApi.getThread(ticketId)
          : await ticketApi.getThread(ticketId, candidateId);

      if (response?.data?.ticketId || response?.data?.success) {
        const nextTicket = normalizeTicket(response.data, audience);

        setAllTickets((prev) =>
          prev.map((ticket) => (ticket.id === ticketId ? nextTicket : ticket)),
        );
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load ticket thread", "error");
    }
  };

  const tickets = useMemo(() => allTickets, [allTickets]);

  const faqItems =
    audience === "employer" ? EMPLOYER_FAQ_ITEMS : CANDIDATE_FAQ_ITEMS;

  const validate = () => {
    const nextErrors = {};
    if (!form.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!form.category) nextErrors.category = "Please select a category.";
    if (!form.description.trim())
      nextErrors.description = "Description is required.";
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (audience !== "employer" && !candidateId) {
        showToast("Please log in again to create a support ticket.", "error");
        return;
      }

      const payload = {
        subject: form.subject,
        category: CATEGORY_TO_API[form.category] || form.category,
        description: form.description,
      };

      console.log("Ticket Payload:", payload);

      const response =
        audience === "employer"
          ? await ticketApi.createTicket(payload)
          : await ticketApi.createTicket(candidateId, payload);

      if (response?.data?.ticketId || response?.data?.success) {
        await loadTickets();
        await loadTicketSummary();

        setForm({
          subject: "",
          category: "",
          description: "",
        });

        showToast("Support ticket submitted successfully!", "success");
      }
    } catch (error) {
      console.log("Backend Error:", error?.response?.data);

      console.error(error);

      showToast("Failed to create ticket", "error");
    }
  };

  const addReply = async (ticketId) => {
    const replyText = newReplyTextByTicket[ticketId] || "";
    if (!replyText.trim()) return;

    try {
      if (audience !== "employer" && !candidateId) {
        showToast("Please log in again to send a reply.", "error");
        return;
      }

      const response =
        audience === "employer"
          ? await ticketApi.replyTicket(ticketId, {
            message: replyText,
          })
          : await ticketApi.replyTicket(ticketId, candidateId, {
            message: replyText,
          });

      if (response?.data?.ticketId || response?.data?.success) {
        setNewReplyTextByTicket((prev) => ({ ...prev, [ticketId]: "" }));
        await loadTicketThread(ticketId);
        showToast("Reply sent", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to send reply", "error");
    }
  };

  const handleResolve = async (ticketId) => {
    try {
      await ticketApi.resolveTicket(ticketId);
      await loadTickets();
      await loadTicketSummary();
      showToast("Ticket marked resolved", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to resolve ticket", "error");
    }
  };

  const handleToggleThread = async (ticketId, isExpanded) => {
    if (isExpanded) {
      setExpandedTicketId("");
      return;
    }

    setExpandedTicketId(ticketId);
    await loadTicketThread(ticketId);
  };

  return (
    <>
      <div className="row support-ticket-center">
        <div className="col-xl-7 col-lg-7 col-md-12">
          <div className="candidate-settings-card mb-20">
            <h5 className="mb-5">Raise a Support Ticket</h5>
            <p className="font-xs color-text-paragraph-2 mb-20">
              Share your issue clearly. Admin replies will appear in your ticket
              timeline.
            </p>

            <div className="input-style-1 mb-15">
              <label className="font-sm color-text-mutted mb-10">
                Subject *
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Unable to upload certificate PDF"
                value={form.subject}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, subject: event.target.value }));
                  if (errors.subject)
                    setErrors((prev) => ({ ...prev, subject: undefined }));
                }}
                style={{ height: "44px", fontSize: "13px" }}
              />
              {errors.subject ? (
                <p className="font-xs mt-5 mb-0" style={{ color: "#c0392b" }}>
                  {errors.subject}
                </p>
              ) : null}
            </div>

            <div className="input-style-1 mb-15">
              <label className="font-sm color-text-mutted mb-10">
                Category *
              </label>
              <select
                className="form-control form-select"
                value={form.category}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }));
                  if (errors.category)
                    setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                style={{ height: "44px", fontSize: "13px" }}
              >
                <option value="">-- Select a category --</option>
                {SUPPORT_TICKET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="font-xs mt-5 mb-0" style={{ color: "#c0392b" }}>
                  {errors.category}
                </p>
              ) : null}
            </div>

            <div className="input-style-1 mb-20">
              <label className="font-sm color-text-mutted mb-10">
                Description *
              </label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Describe your issue with steps and expected result."
                value={form.description}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }));
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                style={{ fontSize: "13px", resize: "vertical" }}
              />
              {errors.description ? (
                <p className="font-xs mt-5 mb-0" style={{ color: "#c0392b" }}>
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div className="candidate-settings-actions">
              <button
                type="button"
                className="btn btn-border btn-small clear-btn"
                onClick={() => {
                  setForm({ subject: "", category: "", description: "" });
                  setErrors({});
                }}
                style={{fontSize:"16px"}}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-brand-1 btn-small"
                onClick={handleSubmit}
                 style={{fontSize:"16px"}}
              >
                Submit Ticket
              </button>
            </div>
          </div>

          <div className="candidate-settings-card">
            <h5 className="mb-15">Frequently Asked Questions</h5>
            <div className="candidate-faq-list">
              {faqItems.map((item, index) => (
                <details
                  key={item.id}
                  className="candidate-faq-item"
                  open={index === 0}
                >
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-5 col-lg-5 col-md-12">
          <div className="candidate-settings-card mb-20">
            <h5 className="mb-5">Support Tickets</h5>
            <p className="font-sm color-text-paragraph-2 mb-15 support-ticket-count">
              {ticketSummary.totalTickets} ticket
              {ticketSummary.totalTickets !== 1 ? "s" : ""} total
            </p>

            <div className="candidate-ticket-list" style={{
              maxHeight: "490px", // adjust as needed
              overflowY: "auto",
              paddingRight: "6px"
            }}>
              {tickets.map((ticket) => {
                const latestAdminReply = getLatestAdminReply(
                  ticket.messages || [],
                );
                const isExpanded = expandedTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className="candidate-ticket-item"
                    style={{ marginBottom: "12px" }}
                  >
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <strong>{ticket.subject}</strong>

                          <p className="font-sm color-text-paragraph-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="candidate-ticket-meta">
                          <span
                            className={`candidate-ticket-status ${statusClass(ticket.status)}`}
                          >
                            {ticket.status}
                          </span>
                          <small>
                            Updated: {formatDateTime(ticket.updatedOn)}
                          </small>
                        </div>
                      </div>

                      {latestAdminReply ? (
                        <div
                          className="support-ticket-latest-reply"
                          style={{
                            marginTop: "8px",
                            padding: "8px 10px",
                          }}
                        >
                          <p
                            className="font-sm mb-5 support-ticket-latest-label"
                            style={{ color: "#ff9900", fontWeight: 600 }}
                          >
                            Latest admin reply
                          </p>
                          <p
                            className="font-sm mb-0 support-ticket-latest-body"
                            style={{ color: "#3a4559" }}
                          >
                            {latestAdminReply.text}
                          </p>
                        </div>
                      ) : null}

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-grey-small"
                          onClick={() =>
                            handleToggleThread(ticket.id, isExpanded)
                          }
                        >
                          {isExpanded ? "Hide Thread" : "View Thread"}
                        </button>
                        {ticket.status !== "Resolved" ? (
                          <button
                            type="button"
                            className="btn btn-default btn-small"
                            onClick={() => handleResolve(ticket.id)}
                          >
                            Mark Resolved
                          </button>
                        ) : null}
                      </div>

                      {isExpanded ? (
                        <div
                          className="support-ticket-thread-shell"
                          style={{
                            marginTop: "10px",
                            padding: "10px",
                          }}
                        >
                          <div
                            style={{
                              maxHeight: "220px",
                              overflow: "auto",
                              paddingRight: "4px",
                            }}
                          >
                            {(ticket.messages || []).map((message) => (
                              <div
                                key={message.id}
                                className={`support-ticket-message ${message.sender === "admin" ? "is-admin" : "is-user"}`}
                                style={{
                                  marginBottom: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "8px",
                                }}
                              >
                                <p
                                  className="font-sm mb-5"
                                  style={{ fontWeight: 700, color: "#122359" }}
                                >
                                  {message.senderLabel}
                                </p>
                                <p
                                  className="font-sm mb-5"
                                  style={{ color: "#3a4559" }}
                                >
                                  {message.text}
                                </p>
                                <small>
                                  {formatDateTime(message.createdOn)}
                                </small>
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Write a reply..."
                              value={newReplyTextByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setNewReplyTextByTicket((prev) => ({
                                  ...prev,
                                  [ticket.id]: event.target.value,
                                }))
                              }
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-brand-1 btn-small"
                              disabled={!newReplyTextByTicket[ticket.id]?.trim()}
                              onClick={() => addReply(ticket.id)}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="candidate-settings-card">
            <h5 className="mb-15">{title}</h5>
            <div className="p-15 support-ticket-contact-card">
              <p className="font-sm color-text-paragraph-2 mb-5 support-ticket-contact-text">
                {description}
              </p>
              <a
                className="font-sm color-brand-1 support-ticket-contact-email"
                href="mailto:support@jobportal.com"
              >
                support@jobportal.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportTicketCenter;
