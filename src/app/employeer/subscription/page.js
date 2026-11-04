"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getCreditWalletDashboard,
  getRecruiterMembershipPlans,
} from "@/services/recruiter/recruiterCreditWalletService";
import { getVisitorPaymentRegion } from "@/services/candidate/visitorCountryService";
import SubUserViewOnlyGuard from "@/components/SubUserViewOnlyGuard.js";
import MembershipCheckout from "@/components/MembershipCheckout";

const normalizeRegion = (value) => {
  const r = (value || "").toLowerCase().trim();
  if (r === "india") return "in";
  if (r === "usa" || r === "united states" || r === "united states of america") return "us";
  return r;
};

const formatMoney = (amount, currency = "INR") => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EmployerSubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Plan the user picked: checkout opens inline below the cards (no navigation).
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paidPlan, setPaidPlan] = useState(null);
  const checkoutRef = useRef(null);

  const handleChoosePlan = (m) => {
    setSelectedPlan({
      planId: m.planId,
      planName: m.planName,
      credits: m.initialCredits || 0,
      validityMonths: m.validityMonths || 0,
      price: m.price,
    });
    // Bring the order summary into view
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handlePaymentSuccess = async (plan, amountText) => {
    setPaidPlan({ ...plan, amountText });
    setSelectedPlan(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Refresh the active plan / credits summary
    try {
      setDashboard(await getCreditWalletDashboard());
    } catch (e) {
      console.error(e);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const v = await getVisitorPaymentRegion();
      if (!v) throw new Error("Could not detect your country.");
      setVisitor(v);

      const region = v.paymentGateway === "PayPal" ? v.region : undefined;
      const [data, dash] = await Promise.all([
        getRecruiterMembershipPlans(region),
        getCreditWalletDashboard().catch(() => null),
      ]);
      const list = Array.isArray(data) ? data : data?.plans || [];
      setPlans(
        list.filter(
          (m) =>
            m.isActive === true &&
            normalizeRegion(m.region) === normalizeRegion(v.region),
        ),
      );
      setDashboard(dash);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load subscription plans. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const currency = visitor?.currency || "INR";
  const isPayPal = visitor?.paymentGateway === "PayPal";
  const expired = !!dashboard?.membershipExpired;

  if (loading) {
    return (
      <main className="main">
        <section className="section-box mt-50 mb-50">
          <div className="container text-center">
            <h4>Loading plans...</h4>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <section className="section-box mt-50 mb-50">
          <div className="container text-center">
            <h4 className="mb-15">Couldn’t load subscription plans</h4>
            <p className="font-md color-text-paragraph-2 mb-20">{error}</p>
            <button type="button" className="btn btn-default" onClick={load}>
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <SubUserViewOnlyGuard>
      <main className="main">
        <section className="section-box mt-50 mb-20">
          <div className="container">
            <div className="content-page">
              {/* Page header */}
              <div className="box-filters-job employer-cv-surface-card mb-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 col-lg-8">
                    <h3 className="mb-5">Subscription</h3>
                    <span className="font-sm color-text-paragraph-2">
                      {expired
                        ? "Your membership has expired. Renew it to get new credits and keep unlocking profiles."
                        : "Membership plans for your hiring team"}
                    </span>
                  </div>
                  <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                    <Link
                      className="btn btn-border btn-sm"
                      href="/employeer/credit-wallet"
                    >
                      View wallet
                    </Link>
                  </div>
                </div>
              </div>

              {paidPlan && (
                <div
                  className="mb-10 p-15"
                  style={{
                    background: "#e7f9ed",
                    borderRadius: "10px",
                    border: "1px solid #86efac",
                  }}
                >
                  <p className="font-sm mb-0" style={{ color: "#166534" }}>
                    🎉 <strong>Payment successful!</strong> {paidPlan.planName} (
                    {paidPlan.credits} credits) for {paidPlan.amountText} has been
                    applied. Your invoice and receipt have been sent to your
                    registered email.
                  </p>
                </div>
              )}

              {/* Current plan summary */}
              {dashboard?.planName && (
                <div className="card-grid-2 hover-up cv-search-candidate-card mb-10">
                  <div className="card-block-info pt-15 pb-15">
                    <div className="row align-items-center">
                      <div className="col-md-4 col-sm-12">
                        <p className="font-xs color-text-paragraph-2 mb-5">Active Plan</p>
                        <p className="font-sm mb-0">
                          <strong>{dashboard.planName}</strong>
                        </p>
                      </div>
                      <div className="col-md-4 col-sm-12">
                        <p className="font-xs color-text-paragraph-2 mb-5">Credits Available</p>
                        <p className="font-sm mb-0">
                          <strong className="color-brand-1">
                            {Math.max(dashboard.remainingCredits ?? 0, 0)}
                          </strong>{" "}
                          total
                        </p>
                      </div>
                      <div className="col-md-4 col-sm-12">
                        <p className="font-xs color-text-paragraph-2 mb-5">
                          {expired ? "Plan Expired" : "Plan Expires"}
                        </p>
                        <p className="font-sm mb-0">{formatDate(dashboard.planExpiryDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {plans.length === 0 ? (
                <div className="card-grid-2 hover-up cv-search-candidate-card text-center mt-30 p-40">
                  <h4 className="mb-15">No membership plans available</h4>
                  <p className="font-md color-text-paragraph-2 mb-20">
                    {visitor?.countryName
                      ? `There are no active membership plans available for your country/region (${visitor.countryName}).`
                      : "We could not determine your region. Please refresh the page."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mt-20 mb-10">
                    <h2 className="mb-15">Choose Your Membership Plan</h2>
                    <p className="font-lg color-text-paragraph-2">
                      {expired
                        ? "Renew within 30 days of expiry and your unused credits are added to your new plan's credits."
                        : "Your new term starts when your current membership ends. Unused credits carry over and the new plan's credits are added on top."}
                    </p>
                  </div>

                  <div className="max-width-price">
                    <div className="block-pricing mt-30">
                      <div className="row justify-content-center align-items-stretch">
                        {plans.map((m) => {
                          const months = m.validityMonths || 0;
                          const isCurrent =
                            !expired &&
                            dashboard?.planName &&
                            dashboard.planName === m.planName;
                          return (
                            <div
                              className="col-xl-4 col-lg-4 col-md-6 col-sm-10 d-flex"
                              key={m.planId}
                            >
                              <div
                                className={`box-pricing-item employer-cv-surface-card${isCurrent || selectedPlan?.planId === m.planId ? " active" : ""} d-flex flex-column h-100`}
                              >
                                <h3>{m.planName}</h3>
                                <div className="box-info-price">
                                  <span className="text-price color-brand-2">
                                    {m.initialCredits || 0}
                                  </span>
                                  <span className="text-month">credits</span>
                                </div>
                                <div className="border-bottom mb-30">
                                  {months > 0 && Number(m.price) > 0 ? (
                                    <>
                                      <p
                                        className="mb-5"
                                        style={{ fontSize: 26, fontWeight: 800, color: "#122359", lineHeight: 1.2 }}
                                      >
                                        {formatMoney(Number(m.price) / months, currency)}
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1F9D6B" }}>
                                          {" "}/ month
                                        </span>
                                      </p>
                                      <p className="text-desc-package font-sm color-text-paragraph mb-30">
                                        Pay {formatMoney(m.price, currency)}
                                        {isPayPal ? "" : " + GST"} once for {months}{" "}
                                        {months === 1 ? "month" : "months"}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-desc-package font-sm color-text-paragraph mb-30">
                                      {formatMoney(m.price, currency)}
                                      {isPayPal ? "" : " + GST"}
                                    </p>
                                  )}
                                </div>

                                <ul className="list-package-feature flex-grow-1 mb-30">
                                  {months > 0 && (
                                    <li>
                                      Valid for {months} {months === 1 ? "month" : "months"}
                                    </li>
                                  )}
                                  <li>{isPayPal ? "Invoice generated" : "GST - compliant invoice generated"}</li>
                                  <li>Shared wallet with sub-users</li>
                                  <li>Unlock profiles across bands</li>
                                  <li>Package expiry auto-tracked</li>
                                </ul>

                                <div className="mt-auto">
                                  {isCurrent ? (
                                    <span className="btn btn-grey-small" style={{ pointerEvents: "none" }}>
                                      ✓ Current plan
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className={`btn ${selectedPlan?.planId === m.planId ? "btn-default" : "btn-border"}`}
                                      onClick={() => handleChoosePlan(m)}
                                    >
                                      {selectedPlan?.planId === m.planId
                                        ? "✓ Selected"
                                        : expired
                                          ? "Renew Plan"
                                          : "Choose Plan"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Inline checkout for the chosen plan */}
                  {selectedPlan && (
                    <div ref={checkoutRef} style={{ scrollMarginTop: 90 }}>
                      <MembershipCheckout
                        plan={selectedPlan}
                        currency={currency}
                        isPayPal={isPayPal}
                        isRazorpay={visitor?.paymentGateway === "Razorpay"}
                        onSuccess={handlePaymentSuccess}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </SubUserViewOnlyGuard>
  );
};

export default EmployerSubscriptionPage;