"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import {
  CANDIDATE_FAQ_ITEMS,
  EMPLOYER_FAQ_ITEMS,
  SUPPORT_TICKET_CATEGORIES
} from "@/constants/supportTicketsData";
import {
  addNewSupportTicket,
  addTicketMessage,
  loadSupportTickets,
  resolveTicket,
  saveSupportTickets
} from "@/lib/supportTicketStore";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const statusClass = (status) => {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "active";
  return "open";
};

const getLatestAdminReply = (messages = []) => {
  const adminMessages = messages.filter((item) => item.sender === "admin");
  return adminMessages.length ? adminMessages[adminMessages.length - 1] : null;
};

const SupportTicketCenter = ({
  audience = "candidate",
  title = "Help & Support",
  description = "Raise a support ticket and track admin replies in one place."
}) => {
  const showToast = useToast();
  const [allTickets, setAllTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState("");
  const [newReplyTextByTicket, setNewReplyTextByTicket] = useState({});
  const [form, setForm] = useState({ subject: "", category: "", description: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setAllTickets(loadSupportTickets());
  }, []);

  useEffect(() => {
    if (!allTickets.length) return;
    saveSupportTickets(allTickets);
  }, [allTickets]);

  const tickets = useMemo(
    () => allTickets.filter((ticket) => ticket.audience === audience),
    [allTickets, audience]
  );

  const faqItems = audience === "employer" ? EMPLOYER_FAQ_ITEMS : CANDIDATE_FAQ_ITEMS;

  const validate = () => {
    const nextErrors = {};
    if (!form.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!form.category) nextErrors.category = "Please select a category.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const updated = addNewSupportTicket(
      {
        audience,
        subject: form.subject,
        category: form.category,
        description: form.description
      },
      allTickets
    );

    setAllTickets(updated);
    setForm({ subject: "", category: "", description: "" });
    setErrors({});
    showToast("Support ticket submitted successfully!", "success");
    setExpandedTicketId(updated[0]?.id || "");
  };

  const addReply = (ticketId) => {
    const replyText = newReplyTextByTicket[ticketId] || "";
    if (!replyText.trim()) return;

    setAllTickets((prev) => addTicketMessage({ ticketId, sender: audience, text: replyText }, prev));
    setNewReplyTextByTicket((prev) => ({ ...prev, [ticketId]: "" }));
  };

  const handleResolve = (ticketId) => {
    setAllTickets((prev) => resolveTicket(ticketId, prev));
  };

  return (
    <>
      <div className="row">
        <div className="col-xl-7 col-lg-7 col-md-12">
          <div className="candidate-settings-card mb-20">
            <h5 className="mb-5">Raise a Support Ticket</h5>
            <p className="font-xs color-text-paragraph-2 mb-20">
              Share your issue clearly. Admin replies will appear in your ticket timeline.
            </p>

            <div className="input-style-1 mb-15">
              <label className="font-sm color-text-mutted mb-10">Subject *</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Unable to upload certificate PDF"
                value={form.subject}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, subject: event.target.value }));
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                }}
                style={{ height: "44px", fontSize: "13px" }}
              />
              {errors.subject ? <p className="font-xs mt-5 mb-0" style={{ color: "#c0392b" }}>{errors.subject}</p> : null}
            </div>

            <div className="input-style-1 mb-15">
              <label className="font-sm color-text-mutted mb-10">Category *</label>
              <select
                className="form-control form-select"
                value={form.category}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, category: event.target.value }));
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
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
              {errors.category ? <p className="font-xs mt-5 mb-0" style={{ color: "#c0392b" }}>{errors.category}</p> : null}
            </div>

            <div className="input-style-1 mb-20">
              <label className="font-sm color-text-mutted mb-10">Description *</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Describe your issue with steps and expected result."
                value={form.description}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, description: event.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
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
                className="btn btn-default btn-small"
                onClick={() => {
                  setForm({ subject: "", category: "", description: "" });
                  setErrors({});
                }}
              >
                Clear
              </button>
              <button type="button" className="btn btn-brand-1 btn-small" onClick={handleSubmit}>
                Submit Ticket
              </button>
            </div>
          </div>

          <div className="candidate-settings-card">
            <h5 className="mb-15">Frequently Asked Questions</h5>
            <div className="candidate-faq-list">
              {faqItems.map((item, index) => (
                <details key={item.id} className="candidate-faq-item" open={index === 0}>
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
            <p className="font-xs color-text-paragraph-2 mb-15">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
            </p>

            <div className="candidate-ticket-list">
              {tickets.map((ticket) => {
                const latestAdminReply = getLatestAdminReply(ticket.messages);
                const isExpanded = expandedTicketId === ticket.id;

                return (
                  <div key={ticket.id} className="candidate-ticket-item" style={{ marginBottom: "12px" }}>
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <strong>{ticket.subject}</strong>
                          <p>
                            {ticket.id}
                            {ticket.category ? ` · ${ticket.category}` : ""}
                          </p>
                        </div>
                        <div className="candidate-ticket-meta">
                          <span className={`candidate-ticket-status ${statusClass(ticket.status)}`}>{ticket.status}</span>
                          <small>Updated: {formatDateTime(ticket.updatedOn)}</small>
                        </div>
                      </div>

                      {latestAdminReply ? (
                        <div
                          style={{
                            marginTop: "8px",
                            border: "1px solid #dce2ee",
                            borderRadius: "8px",
                            padding: "8px 10px",
                            background: "#f8fbff"
                          }}
                        >
                          <p className="font-xs mb-5" style={{ color: "#185fa5", fontWeight: 600 }}>
                            Latest admin reply
                          </p>
                          <p className="font-xs mb-0" style={{ color: "#3a4559" }}>
                            {latestAdminReply.text}
                          </p>
                        </div>
                      ) : null}

                      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button
                          type="button"
                          className="btn btn-grey-small"
                          onClick={() => setExpandedTicketId(isExpanded ? "" : ticket.id)}
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
                          style={{
                            marginTop: "10px",
                            border: "1px solid #dce2ee",
                            borderRadius: "10px",
                            padding: "10px"
                          }}
                        >
                          <div style={{ maxHeight: "220px", overflow: "auto", paddingRight: "4px" }}>
                            {ticket.messages.map((message) => (
                              <div
                                key={message.id}
                                style={{
                                  marginBottom: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "8px",
                                  background: message.sender === "admin" ? "#edf4fd" : "#f7f8fc",
                                  border: message.sender === "admin" ? "1px solid #d4e1f7" : "1px solid #e7eaf2"
                                }}
                              >
                                <p className="font-xs mb-5" style={{ fontWeight: 700, color: "#0b2f57" }}>
                                  {message.senderLabel}
                                </p>
                                <p className="font-xs mb-5" style={{ color: "#3a4559" }}>
                                  {message.text}
                                </p>
                                <small>{formatDateTime(message.createdOn)}</small>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Write a reply..."
                              value={newReplyTextByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setNewReplyTextByTicket((prev) => ({ ...prev, [ticket.id]: event.target.value }))
                              }
                            />
                            <button type="button" className="btn btn-brand-1 btn-small" onClick={() => addReply(ticket.id)}>
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
            <div className="p-15" style={{ border: "1px solid #dce2ee", borderRadius: "10px" }}>
              <p className="font-xs color-text-paragraph-2 mb-5">{description}</p>
              <a className="font-xs color-brand-1" href="mailto:support@jobportal.com">
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
