"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCreditWalletDashboard,
  getTransactionHistory,
  getUnlockedCandidates,
  getAllocationHistory,
} from "@/services/recruiter/recruiterCreditWalletService";

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Backend sends the raw C# enum name (e.g. "CvDownload", "ProfileUnlock",
// "CreditAllocation") for credit-usage rows, and the literal string
// "PlanPurchase" for plan-purchase rows. Map every value to its own label —
// don't collapse anything into a shared fallback.
const TRANSACTION_TYPE_META = {
  PlanPurchase: { label: "Plan Purchase", background: "#dcfce7", color: "#166534" },
  ProfileUnlock: { label: "Profile Unlock", background: "#fef9c3", color: "#854d0e" },
  CvDownload: { label: "CV Download", background: "#dbeafe", color: "#1e40af" },
  CreditAllocation: { label: "Credit Allocation", background: "#ede9fe", color: "#5b21b6" },
};

const getTransactionTypeMeta = (transactionType) =>
  TRANSACTION_TYPE_META[transactionType] || {
    label: transactionType || "-",
    background: "#f3f4f6",
    color: "#374151",
  };

const EmployerCreditWalletPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [unlockedCandidates, setUnlockedCandidates] = useState([]);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("transactions");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dash, txns, candidates, allocations] = await Promise.all([
          getCreditWalletDashboard(),
          getTransactionHistory(),
          getUnlockedCandidates(),
          getAllocationHistory(),
        ]);
        setDashboard(dash);
        setTransactions(txns || []);
        setUnlockedCandidates(candidates || []);
        setAllocationHistory(allocations || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load wallet data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const expiryDays = dashboard ? daysUntilExpiry(dashboard.planExpiryDate) : null;

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">

            {/* Header */}
            <div className="box-filters-job employer-cv-surface-card">
              <div className="row align-items-center">
                <div className="col-xl-7 col-lg-7">
                  <h3 className="mb-5">Credit Wallet</h3>
                  <span className="font-sm color-text-paragraph-2">
                    Monitor credits used for profile unlocks
                  </span>
                </div>
                <div className="col-xl-5 col-lg-5 text-lg-end mt-sm-15">
                  <Link className="btn btn-default btn-sm mr-10 mb-5" href="/employeer/buy-credits">
                    Buy more credits
                  </Link>
                  <Link className="btn btn-border btn-sm mb-5" href="/employeer/invoices">
                    View invoices
                  </Link>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger mt-20" role="alert">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center mt-40 mb-40">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="font-sm color-text-paragraph-2 mt-10">Loading wallet data...</p>
              </div>
            )}

            {!loading && dashboard && (
              <>
                {/* Balance card */}
                <div className="card-grid-2 hover-up cv-search-candidate-card mt-10">
                  <div className="card-block-info pt-20">
                    <div className="row align-items-center">
                      <div className="col-lg-8 col-md-12 col-sm-12">
                        <h4>
                          {dashboard.remainingCredits > 0
                            ? `${dashboard.remainingCredits} credits remaining`
                            : "No credits remaining"}
                        </h4>
                        <p className="font-sm color-text-paragraph mt-10">
                          {dashboard.planName} — Expires{" "}
                          {formatDate(dashboard.planExpiryDate)}
                        </p>
                      </div>
                      <div className="col-lg-4 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15">
                        {expiryDays !== null && expiryDays <= 30 && expiryDays > 0 && (
                          <>
                            <span className="font-xs color-text-paragraph-2 d-block mb-5">
                              Package expiry reminder enabled
                            </span>
                            <span className="btn btn-grey-small">
                              Expiry alert in {expiryDays}d
                            </span>
                          </>
                        )}
                        {expiryDays !== null && expiryDays <= 0 && (
                          <span className="btn btn-grey-small" style={{ background: "#fee2e2", color: "#991b1b" }}>
                            Plan Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="row mt-20">
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div className="card-grid-2 hover-up cv-search-candidate-card">
                      <div className="card-block-info pt-20 pb-20 text-center">
                        <p className="font-xs color-text-paragraph-2 mb-10">
                          Credits used (this month)
                        </p>
                        <h4 className="color-brand-1 mb-0">
                          {dashboard.creditsUsedThisMonth}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div className="card-grid-2 hover-up cv-search-candidate-card">
                      <div className="card-block-info pt-20 pb-20 text-center">
                        <p className="font-xs color-text-paragraph-2 mb-10">
                          Profiles unlocked
                        </p>
                        <h4 className="color-brand-1 mb-0">
                          {dashboard.profilesUnlocked}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div className="card-grid-2 hover-up cv-search-candidate-card">
                      <div className="card-block-info pt-20 pb-20 text-center">
                        <p className="font-xs color-text-paragraph-2 mb-10">
                          Shared wallet
                        </p>
                        <h4 className="color-brand-1 mb-0">
                          {dashboard.sharedWalletEnabled
                            ? `${dashboard.totalSubUsers} sub-user${dashboard.totalSubUsers !== 1 ? "s" : ""}`
                            : "No"}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="card-grid-2 hover-up cv-search-candidate-card mt-10">
                  <div className="card-block-info pt-20">

                    {/* Tab nav */}
                    <ul className="nav nav-tabs mb-20" style={{ borderBottom: "1px solid #e5e7eb" }}>
                      {[
                        { key: "transactions", label: "All Transactions" },
                        { key: "unlocked", label: "Unlocked Profiles" },
                        { key: "allocations", label: "Credit Allocations" },
                      ].map((tab) => (
                        <li className="nav-item" key={tab.key}>
                          <button
                            className={`nav-link${activeTab === tab.key ? " active" : ""}`}
                            style={{
                              background: "none",
                              border: "none",
                              borderBottom: activeTab === tab.key ? "2px solid #ff9900" : "2px solid transparent",
                              color: activeTab === tab.key ? "#ff9900" : "#6b7280",
                              fontWeight: activeTab === tab.key ? 600 : 400,
                              padding: "8px 16px",
                              cursor: "pointer",
                              marginBottom: "-1px",
                            }}
                            onClick={() => setActiveTab(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* All Transactions */}
                    {activeTab === "transactions" && (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Category</th>
                              <th>Details</th>
                              <th className="text-end">Credits / Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center color-text-paragraph-2">
                                  No transactions found.
                                </td>
                              </tr>
                            ) : (
                              transactions.map((txn) => {
                                const typeMeta = getTransactionTypeMeta(txn.transactionType);
                                return (
                                <tr key={txn.transactionId}>
                                  <td>{formatDate(txn.createdAt)}</td>
                                  <td>
                                    <span
                                      className="btn btn-grey-small"
                                      style={{
                                        background: typeMeta.background,
                                        color: typeMeta.color,
                                        fontSize: "11px",
                                      }}
                                    >
                                      {typeMeta.label}
                                    </span>
                                  </td>
                                  <td className="font-sm">{txn.category}</td>
                                  <td className="font-sm">
                                    {txn.candidateName
                                      ? txn.candidateName
                                      : txn.planName
                                      ? txn.planName
                                      : "-"}
                                  </td>
                                  <td className="text-end font-sm">
                                    {txn.transactionType === "PlanPurchase" ? (
                                      <span className="color-brand-1">
                                        ₹{txn.amountPaid?.toLocaleString("en-IN")}
                                        <span className="color-text-paragraph-2 ml-5">
                                          (+{txn.creditsUsed} cr)
                                        </span>
                                      </span>
                                    ) : (
                                      <span style={{ color: "#dc2626" }}>
                                        -{txn.creditsUsed} credits
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Unlocked Profiles */}
                    {activeTab === "unlocked" && (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Candidate</th>
                              <th>Trade</th>
                              <th>Experience</th>
                              <th>Unlocked On</th>
                              <th>Expiry</th>
                              <th className="text-end">Credits Used</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unlockedCandidates.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center color-text-paragraph-2">
                                  No unlocked profiles found.
                                </td>
                              </tr>
                            ) : (
                              unlockedCandidates.map((c) => (
                                <tr key={c.unlockId}>
                                  <td className="font-sm">
                                    <Link
                                      href={`/employeer/candidate-profile/${c.candidateId}`}
                                      className="color-brand-1"
                                    >
                                      {c.candidateName}
                                    </Link>
                                  </td>
                                  <td className="font-sm">{c.trade || "-"}</td>
                                  <td className="font-sm">
                                    {c.experienceYears > 0 ? `${c.experienceYears} yr` : "-"}
                                  </td>
                                  <td className="font-sm">{formatDate(c.unlockTimestamp)}</td>
                                  <td className="font-sm">{formatDate(c.unlockExpiryDate)}</td>
                                  <td className="text-end font-sm" style={{ color: "#dc2626" }}>
                                    -{c.creditsDeducted} cr
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Credit Allocations */}
                    {activeTab === "allocations" && (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Sub-User ID</th>
                              <th>Credits Allocated</th>
                              <th>Balance Before</th>
                              <th className="text-end">Balance After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocationHistory.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center color-text-paragraph-2">
                                  No allocation history found.
                                </td>
                              </tr>
                            ) : (
                              allocationHistory.map((a) => (
                                <tr key={a.historyId}>
                                  <td className="font-sm">{formatDate(a.createdAt)}</td>
                                  <td className="font-xs color-text-paragraph-2">
                                    {a.subUserId}
                                  </td>
                                  <td className="font-sm color-brand-1">
                                    +{a.creditsAllocated} cr
                                  </td>
                                  <td className="font-sm">{a.balanceBefore}</td>
                                  <td className="text-end font-sm">{a.balanceAfter}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerCreditWalletPage;