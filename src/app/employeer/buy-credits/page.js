"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  getWallet,
  getCreditPlans,
  getCreditWalletDashboard,
  getRecruiterMembershipPlans,
  createCreditPlanOrder,
  verifyCreditPlanPayment,
  createPayPalPlanOrder,
  validatePlanCoupon,
  capturePayPalPlanPayment,
} from "@/services/recruiter/recruiterCreditWalletService";
import { getVisitorPaymentRegion } from "@/services/candidate/visitorCountryService";
import SubUserViewOnlyGuard from "@/components/SubUserViewOnlyGuard.js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_MODE === "sandbox";

// Admin-entered regions may be "India"/"USA"/... — map them to the backend's region codes.
const normalizeRegion = (value) => {
  const r = (value || "").toLowerCase().trim();
  if (r === "india") return "in";
  if (r === "usa" || r === "united states" || r === "united states of america") return "us";
  return r;
};

const filterPlansByRegion = (plansList, region) =>
  (plansList || []).filter(
    (plan) => plan.isActive === true && normalizeRegion(plan.region) === normalizeRegion(region),
  );

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

const EmployerBuyCreditsPage = () => {
  // const [selected, setSelected] = useState(CREDIT_PACKS[1]);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paidPack, setPaidPack] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);
  // True once the recruiter's membership has ended. Credit packs can't be
  // bought then — the page offers membership plans to renew instead.
  const [membershipExpired, setMembershipExpired] = useState(false);
  // Optional early renewal: the membership is still running but inside the
  // renewal window the server allows. The recruiter can switch between credit
  // packs and membership plans.
  const [canRenewEarly, setCanRenewEarly] = useState(false);
  const [membershipEndsAt, setMembershipEndsAt] = useState(null);
  // True when the plan list on screen is membership plans (expired, or early
  // renewal chosen) instead of credit packs.
  const [showMemberships, setShowMemberships] = useState(false);
  const renewEarlyRef = useRef(false);
  // Detected server-side from the visitor's public IP: { countryCode, countryName, region, currency, paymentGateway }
  const [visitor, setVisitor] = useState(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef(null);

  const isPayPal = visitor?.paymentGateway === "PayPal";
  const isRazorpay = visitor?.paymentGateway === "Razorpay";
  const currency = visitor?.currency || "INR";

  // Coupon (membership plans only). The discount comes off the price and
  // GST is charged on what is left. The server re-validates all of this.
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const clearCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponMessage("");
    setCouponDiscount(0);
  };

  const activeCoupon =
    showMemberships && couponApplied ? couponCode.trim().toUpperCase() : "";
  const discount = activeCoupon
    ? Math.min(couponDiscount, selected?.price || 0)
    : 0;
  const netPrice = selected ? selected.price - discount : 0;

  // GST (18%) applies to Razorpay / India only.
  const gst = selected && !isPayPal ? netPrice * 0.18 : 0;

  const total = selected ? netPrice + gst : 0;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }
    if (!selected?.planId) {
      setCouponMessage("Please select a plan first.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage("");
      const result = await validatePlanCoupon(selected.planId, code);

      if (!result?.isValid) {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponMessage(result?.message || "Invalid or expired coupon.");
        return;
      }

      setCouponCode(code);
      setCouponApplied(true);
      setCouponDiscount(Number(result.discountAmount || 0));
      setCouponMessage(result.message || "Coupon applied successfully.");
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponApplied(false);
      setCouponDiscount(0);
      setCouponMessage(
        err?.response?.data?.message ||
          "Unable to validate coupon. Please try again.",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // A coupon belongs to one plan — drop it when the plan or list changes.
  useEffect(() => {
    clearCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.planId, showMemberships]);

  const init = async () => {
    setPlansLoading(true);
    setPlansError(null);

    try {
      const v = await getVisitorPaymentRegion();
      if (!v) throw new Error("Could not detect your country.");
      setVisitor(v);

      // Has the membership ended? Then only membership plans can be bought.
      // If we can't tell, stop and show the retry screen: quietly falling back
      // to credit packs would let an expired recruiter pick a pack that the
      // server then refuses.
      let dash;
      try {
        dash = await getCreditWalletDashboard();
      } catch (e) {
        console.error(e);
        setPlansError(
          "We couldn't check your membership status. Please try again.",
        );
        return;
      }

      const expired = !!dash?.membershipExpired;
      const early = !!dash?.canRenewEarly;
      const membershipsOnScreen = expired || renewEarlyRef.current;

      setMembershipExpired(expired);
      setCanRenewEarly(early);
      setMembershipEndsAt(dash?.membershipExpiresAt || null);
      setShowMemberships(membershipsOnScreen);

      // PayPal regions are exact backend codes ("us", "gb"...) so ask the server to filter.
      // Razorpay keeps the previous behaviour (all plans, India filtered client-side).
      const region = v.paymentGateway === "PayPal" ? v.region : undefined;
      let list;
      if (membershipsOnScreen) {
        const data = await getRecruiterMembershipPlans(region);
        const memberships = Array.isArray(data) ? data : data?.plans || [];
        // Same shape as a credit pack so the checkout below works unchanged.
        list = memberships.map((m) => ({
          planId: m.planId,
          planName: m.planName,
          credits: m.initialCredits || 0,
          validityMonths: m.validityMonths || 0,
          price: m.price,
          region: m.region,
          isActive: m.isActive,
        }));
      } else {
        const data = await getCreditPlans(region);
        list = Array.isArray(data) ? data : data?.plans || [];
      }
      const filteredList = filterPlansByRegion(list, v.region);

      setPlans(filteredList);
      setSelected(filteredList[0] || null);
    } catch (err) {
      console.error(err);
      setPlansError(
        err?.response?.data?.message ||
          "Failed to load credit plans. Please try again.",
      );
    } finally {
      setPlansLoading(false);
    }
  };

  const toggleRenewEarly = () => {
    renewEarlyRef.current = !renewEarlyRef.current;
    init();
  };

  useEffect(() => {
    // Opened from the wallet's "Subscription" tab: show membership plans.
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("view") === "membership"
    ) {
      renewEarlyRef.current = true;
    }

    getWallet()
      .then(setWallet)
      .catch((err) => {
        console.error(err);
        setWallet(null);
      });

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishSuccess = async (pack, amountText) => {
    setPaidPack({ ...pack, amountText });
    setPaid(true);

    try {
      setWallet(await getWallet());
    } catch (e) {
      console.error(e);
    }
  };

  // PayPal popup: render the official PayPal button; clicking it opens the PayPal popup
  // (same idea as rzp.open()). Hooks must stay above the early returns below.
  useEffect(() => {
    if (!isPayPal || !paypalReady || !selected || paid || plansLoading) return;

    const container = paypalContainerRef.current;
    if (!container || typeof window === "undefined" || !window.paypal?.Buttons) return;

    container.innerHTML = "";
    let order = null;
    const pack = selected;
    const amountText = formatMoney(total, currency);

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "pay" },

      createOrder: async () => {
        setPaying(true);
        order = await createPayPalPlanOrder(pack.planId, activeCoupon);

        if (!order?.success || !order?.payPalOrderId) {
          throw new Error(order?.message || "Unable to create payment order.");
        }

        return order.payPalOrderId;
      },

      onApprove: async (data) => {
        try {
          const result = await capturePayPalPlanPayment({
            transactionId: order.transactionId,
            payPalOrderId: data.orderID,
            paymentGateway: "PayPal",
          });

          if (result.success) {
            await finishSuccess(pack, amountText);
          } else {
            alert(result.message || "Payment verification failed.");
          }
        } catch (err) {
          console.error("PayPal capture exception:", err);
          alert(
            err.response?.data?.message ||
              "Payment verification failed. If money was deducted, please contact support.",
          );
        } finally {
          setPaying(false);
        }
      },

      onCancel: () => setPaying(false),

      onError: (err) => {
        console.error("PayPal error:", err);
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "PayPal payment failed. Please try again.",
        );
        setPaying(false);
      },
    });

    buttons.render(container).catch((e) => console.error("PayPal render failed:", e));

    return () => {
      try {
        buttons.close();
      } catch {
        /* already closed */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPayPal, paypalReady, paid, plansLoading, selected?.planId, currency, activeCoupon, total]);

  if (plansLoading) {
    return (
      <main className="main">
        <section className="section-box mt-50">
          <div className="container text-center">
            <h4>Loading plans...</h4>
          </div>
        </section>
      </main>
    );
  }

  if (plansError) {
    return (
      <main className="main">
        <section className="section-box mt-50">
          <div className="container text-center">
            <h4 className="mb-15">Couldn’t load credit plans</h4>
            <p className="font-md color-text-paragraph-2 mb-20">
              {plansError}
            </p>
            <button className="btn btn-default" onClick={init}>
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }


  const handlePayment = async () => {
    if (!isRazorpay) return;

    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment gateway is loading. Please try again.");
      return;
    }

    if (!selected) {
      alert("Please select a plan.");
      return;
    }

    setPaying(true);

    try {
      // Create Razorpay order from backend
      const order = await createCreditPlanOrder(selected.planId, activeCoupon);

      if (!order.success) {
        alert(order.message || "Unable to create payment order.");
        setPaying(false);
        return;
      }

      const options = {
        key: order.razorpayKeyId,
        amount: order.amountPaise,
        currency: order.currency,
        order_id: order.razorpayOrderId,

        name: "Job Portal",
        description: `${selected.planName} - ${selected.credits} Credits`,

      handler: async function (response) {
  try {
    const verify = await verifyCreditPlanPayment({
      transactionId: order.transactionId,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    });

    if (verify.success) {
      await finishSuccess(selected, formatMoney(total, "INR"));
    } else {
      console.error("Payment verification failed:", verify);
      alert(verify.message || "Payment verification failed.");
    }
  } catch (err) {
    console.error("Payment verification exception:", err);

    const serverMsg =
      err.response?.data?.message ||
      err.response?.data ||
      "";

    alert(`Payment verification failed: ${serverMsg || err.message}`);
  } finally {
    setPaying(false);
  }
},

        prefill: {
          name: "Recruiter",
          email: "",
          contact: "",
        },

        notes: {
          planId: selected.planId,
          planName: selected.planName,
          credits: selected.credits,
        },

        theme: {
          color: "#ff9900",
        },

        modal: {
          ondismiss() {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error(response.error);

        alert(
          response.error.description ||
          "Payment failed. Please try again."
        );

        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to create payment order.");
      setPaying(false);
    }
  };

  const gatewayScripts = (
    <>
      {isRazorpay && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      )}
      {isPayPal && PAYPAL_CLIENT_ID && (
        <Script
          id="paypal-sdk"
          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${encodeURIComponent(currency)}&intent=capture`}
          strategy="afterInteractive"
          onReady={() => setPaypalReady(true)}
        />
      )}
    </>
  );

  if (paid && paidPack) {
    return (
      <main className="main">
        {gatewayScripts}
        <section className="section-box mt-50 mb-50">
          <div className="container">
            <div className="content-page">
              <div className="row justify-content-center">
                <div className="col-lg-6 col-md-10">
                  <div className="card-grid-2 hover-up cv-search-candidate-card text-center">
                    <div className="card-block-info pt-30 pb-30">
                      <div style={{ fontSize: "52px", marginBottom: "16px" }}>
                        🎉
                      </div>
                      <h4 className="color-brand-1 mb-10">
                        Payment Successful!
                      </h4>
                      <p className="font-md color-text-paragraph-2 mb-20">
                        <strong>{paidPack.credits} credits</strong> (
                        {paidPack.planName}) have been added to your wallet.
                      </p>
                      <div
                        className="mb-25 p-15"
                        style={{
                          background: "#e7f9ed",
                          borderRadius: "10px",
                          border: "1px solid #86efac",
                        }}
                      >
                        <p
                          className="font-sm mb-0"
                          style={{ color: "#166534" }}
                        >
                          Your GST-compliant invoice and payment receipt have
                          been sent to your registered email. Check your inbox.
                        </p>
                      </div>
                      <div className="d-flex justify-content-between mb-10">
                        <span className="font-sm color-text-paragraph">
                          Pack
                        </span>
                        <strong>{paidPack.planName}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-10">
                        <span className="font-sm color-text-paragraph">
                          Credits Added
                        </span>
                        <strong>{paidPack.credits} credits</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-20">
                        <span className="font-sm color-text-paragraph">
                          Amount Paid
                        </span>
                        <strong className="color-brand-1">
                          {paidPack.amountText}
                        </strong>
                      </div>
                      <div
                        className="d-flex justify-content-center"
                        style={{ gap: "10px" }}
                      >
                        <Link
                          className="btn btn-default hover-up"
                          href="/employeer/credit-wallet"
                        >
                          View Wallet
                        </Link>

                        <button
                          className="btn btn-border hover-up"
                          type="button"
                          onClick={() => {
                            setPaid(false);
                            setPaidPack(null);
                            init();
                          }}
                        >
                          Buy More Credits
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <SubUserViewOnlyGuard>
    <main className="main">
      {gatewayScripts}
      <section className="section-box mt-50 mb-20">
        <div className="container">
          <div className="content-page">
            {/* Page header */}
            <div className="box-filters-job employer-cv-surface-card mb-10">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">
                    {showMemberships ? "Renew Membership" : "Buy Credits"}
                  </h3>
                  <span className="font-sm color-text-paragraph-2">
                    {membershipExpired
                      ? "Your membership has expired. Renew it to get new credits and keep unlocking profiles."
                      : showMemberships
                        ? "Renew early to keep your access without a gap."
                        : "Choose a pack that fits your hiring volume"}
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <span className="font-sm color-brand-1 mr-10">
                    Current balance:{" "}
                    {wallet !== null
                      ? `${wallet.creditBalance < 0 ? 0 : wallet.creditBalance} credits`
                      : "—"}
                  </span>
                  <Link
                    className="btn btn-border btn-sm"
                    href="/employeer/credit-wallet"
                  >
                    Wallet
                  </Link>
                </div>
              </div>
            </div>

            {/* Early renewal offer (only inside the renewal window) */}
            {(canRenewEarly || showMemberships) && !membershipExpired && (
              <div className="card-grid-2 hover-up cv-search-candidate-card mb-10">
                <div className="card-block-info pt-15 pb-15">
                  <div className="row align-items-center">
                    <div className="col-md-9 col-sm-12">
                      <p className="font-sm mb-0">
                        Your membership ends on{" "}
                        <strong>
                          {membershipEndsAt
                            ? new Date(membershipEndsAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : ""}
                        </strong>
                        . You can renew now: the new term starts when the
                        current one ends and your unused credits carry over.
                      </p>
                    </div>
                    <div className="col-md-3 col-sm-12 text-md-end mt-sm-10">
                      <button
                        type="button"
                        className="btn btn-border btn-sm"
                        onClick={toggleRenewEarly}
                      >
                        {showMemberships
                          ? "Back to credit packs"
                          : "Renew membership"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live wallet summary */}
            {wallet && (
              <div className="card-grid-2 hover-up cv-search-candidate-card mb-10">
                <div className="card-block-info pt-15 pb-15">
                  <div className="row align-items-center">
                    <div className="col-md-4 col-sm-12">
                      <p className="font-xs color-text-paragraph-2 mb-5">
                        Active Plan
                      </p>
                      <p className="font-sm mb-0">
                        <strong>{wallet.packageName}</strong>
                      </p>
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <p className="font-xs color-text-paragraph-2 mb-5">
                        Credits Available
                      </p>
                      <p className="font-sm mb-0">
                        <strong className="color-brand-1">
                          {wallet.creditBalance < 0
                            ? 0
                            : wallet.creditBalance}
                        </strong>{" "}
                        total
                        {wallet.membershipExpired &&
                          wallet.expiredCredits > 0 && (
                            <span className="color-text-paragraph-2">
                              {" "}
                              ({wallet.expiredCredits} on hold — renew by{" "}
                              {wallet.creditGraceEndsAt
                                ? new Date(wallet.creditGraceEndsAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                : "the renewal deadline"}{" "}
                              to keep them)
                            </span>
                          )}
                        {wallet.allocatedCredits > 0 && (
                          <span className="color-text-paragraph-2">
                            {" "}
                            ({wallet.allocatedCredits} allocated to sub-users)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <p className="font-xs color-text-paragraph-2 mb-5">
                        {wallet.membershipExpired ? "Plan Expired" : "Plan Expires"}
                      </p>
                      <p className="font-sm mb-0">
                        {new Date(wallet.packExpiresAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {plans.length === 0 ? (
              <div className="card-grid-2 hover-up cv-search-candidate-card text-center mt-30 p-40">
                <h4 className="mb-15">
                  {showMemberships ? "No membership plans available" : "No credit plans available"}
                </h4>
                <p className="font-md color-text-paragraph-2 mb-20">
                  {visitor?.countryName
                    ? `There are no active credit plans available for your country/region (${visitor.countryName}).`
                    : "We could not determine your region. Please refresh the page."}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mt-20 mb-10">
                  <h2 className="mb-15">
                    {showMemberships ? "Select A Membership Plan" : "Select A Credit Pack"}
                  </h2>
                  <p className="font-lg color-text-paragraph-2">
                    {membershipExpired
                      ? "Renew within 30 days of expiry and your unused credits are added to your new plan's credits. After 30 days they are lost. Your new plan's credits are valid for the plan's full duration."
                      : showMemberships
                        ? "Your new term starts when your current membership ends. Unused credits carry over and the new plan's credits are added on top."
                        : "Longer packs offer a lower per-credit rate. Top-ups are valid until your membership expires."}
                  </p>
                </div>

                {/* Pricing cards */}
                <div className="max-width-price">
                  <div className="block-pricing mt-30">
                    <div className="row justify-content-center align-items-stretch">
                      {plans.map((pack) => (
                        <div
                          className="col-xl-4 col-lg-4 col-md-6 col-sm-10 d-flex"
                          key={pack.planId}
                        >
                          <div
                            className={`box-pricing-item employer-cv-surface-card${selected?.planId === pack.planId ? " active" : ""} d-flex flex-column h-100`}
                            onClick={() => setSelected(pack)}
                            style={{ cursor: "pointer" }}
                          >
                            {pack.popular && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "-12px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  background: "#ff9900",
                                  color: "#fff",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 14px",
                                  borderRadius: "20px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Most Popular
                              </div>
                            )}
                            <h3>{pack.planName}</h3>
                            <div className="box-info-price">
                              <span className="text-price color-brand-2">
                                {pack.credits}
                              </span>
                              <span className="text-month">credits</span>
                            </div>
                            <div className="border-bottom mb-30">
                              {showMemberships &&
                              pack.validityMonths > 0 &&
                              Number(pack.price) > 0 ? (
                                <>
                                  {/* Monthly rate first, full payment underneath */}
                                  <p
                                    className="mb-5"
                                    style={{ fontSize: 26, fontWeight: 800, color: "#122359", lineHeight: 1.2 }}
                                  >
                                    {formatMoney(Number(pack.price) / pack.validityMonths, currency)}
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1F9D6B" }}>
                                      {" "}/ month
                                    </span>
                                  </p>
                                  <p className="text-desc-package font-sm color-text-paragraph mb-30">
                                    Pay {formatMoney(pack.price, currency)}
                                    {isPayPal ? "" : " + GST"} once for {pack.validityMonths}{" "}
                                    {pack.validityMonths === 1 ? "month" : "months"}
                                  </p>
                                </>
                              ) : (
                                <p className="text-desc-package font-sm color-text-paragraph mb-30">
                                  {formatMoney(pack.price, currency)}
                                  {isPayPal ? "" : " + GST"}
                                </p>
                              )}
                            </div>

                            <ul className="list-package-feature flex-grow-1 mb-30">
                              {/* <li>{pack.rateLabel}</li> */}
                              {showMemberships && pack.validityMonths > 0 && (
                                <li>
                                  Valid for {pack.validityMonths}{" "}
                                  {pack.validityMonths === 1 ? "month" : "months"}
                                </li>
                              )}
                              <li>{isPayPal ? "Invoice generated" : "GST - compliant invoice generated"}</li>
                              <li>Shared wallet with sub-users</li>
                              <li>Unlock profiles across bands</li>
                              <li>Package expiry auto-tracked</li>
                            </ul>
                            <div className="mt-auto">
                              <button
                                className={`btn ${selected?.planId === pack.planId ? "btn-default" : "btn-border"}`}
                                type="button"
                                onClick={() => setSelected(pack)}
                              >
                                {selected?.planId === pack.planId
                                  ? "✓ Selected"
                                  : showMemberships
                                    ? "Choose Plan"
                                    : "Choose Pack"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order summary + pay */}
                <div className="row justify-content-center mt-20">
                  <div className="col-lg-6 col-md-10 col-sm-12">
                    <div className="card-grid-2 hover-up cv-search-candidate-card">
                      <div className="card-block-info pt-20">
                        <h5 className="mb-15">Order Summary</h5>
                        {showMemberships && (
                          <div className="mb-20">
                            <label className="font-sm color-text-paragraph mb-5 d-block">
                              Coupon Code
                            </label>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                disabled={couponApplied || couponLoading || paying}
                                style={{ flex: 1, textTransform: "uppercase" }}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase());
                                  setCouponApplied(false);
                                  setCouponMessage("");
                                  setCouponDiscount(0);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (!couponApplied) handleApplyCoupon();
                                  }
                                }}
                              />
                              {couponApplied ? (
                                <button
                                  type="button"
                                  className="btn btn-border btn-sm"
                                  disabled={paying}
                                  onClick={clearCoupon}
                                  style={{ minWidth: 90 }}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-default btn-sm"
                                  disabled={!couponCode.trim() || couponLoading || paying}
                                  onClick={handleApplyCoupon}
                                  style={{ minWidth: 90 }}
                                >
                                  {couponLoading ? "Checking..." : "Apply"}
                                </button>
                              )}
                            </div>
                            {couponMessage && (
                              <p
                                className="font-xs mb-0 mt-5"
                                style={{ color: couponApplied ? "#3B6D11" : "#A32D2D" }}
                              >
                                {couponMessage}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="d-flex justify-content-between mb-10">
                          <span className="font-sm color-text-paragraph">Pack</span>
                          <strong>
                            {selected?.planName ?? ""} — {selected?.credits ?? 0}{" "}
                            credits
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-10">
                          <span className="font-sm color-text-paragraph">
                            Price
                          </span>
                          <strong>{formatMoney(selected?.price || 0, currency)}</strong>
                        </div>
                        {discount > 0 && (
                          <div className="d-flex justify-content-between mb-10">
                            <span className="font-sm" style={{ color: "#3B6D11" }}>
                              Coupon ({activeCoupon})
                            </span>
                            <strong style={{ color: "#3B6D11" }}>
                              − {formatMoney(discount, currency)}
                            </strong>
                          </div>
                        )}
                        {!isPayPal && (
                          <div className="d-flex justify-content-between mb-10">
                            <span className="font-sm color-text-paragraph">
                              GST (18%)
                            </span>
                            <strong>{formatMoney(gst, "INR")}</strong>
                          </div>
                        )}
                        <div
                          className="d-flex justify-content-between mb-20 pt-10"
                          style={{ borderTop: "1px solid #eee" }}
                        >
                          <span className="font-md color-text-paragraph">
                            Total Payable
                          </span>
                          <strong
                            className="color-brand-1"
                            style={{ fontSize: "18px" }}
                          >
                            {formatMoney(total, currency)}
                          </strong>
                        </div>

                        {/* Test mode notice */}
                        {isRazorpay && (
                          <div
                            className="mb-15 p-10"
                            style={{
                              background: "#fff8e1",
                              border: "1px solid #ffe082",
                              borderRadius: "8px",
                            }}
                          >
                            <p className="font-xs mb-0" style={{ color: "#856404" }}>
                              🧪 <strong>Test Mode:</strong> Use Razorpay test card{" "}
                              <code>4111 1111 1111 1111</code>, any future expiry, CVV{" "}
                              <code>123</code>. No real money is charged.
                            </p>
                          </div>
                        )}
                        {isPayPal && PAYPAL_SANDBOX && (
                          <div
                            className="mb-15 p-10"
                            style={{
                              background: "#fff8e1",
                              border: "1px solid #ffe082",
                              borderRadius: "8px",
                            }}
                          >
                            <p className="font-xs mb-0" style={{ color: "#856404" }}>
                              🧪 <strong>Sandbox Mode:</strong> Pay with a PayPal sandbox
                              buyer account. No real money is charged.
                            </p>
                          </div>
                        )}

                        {isPayPal ? (
                          PAYPAL_CLIENT_ID ? (
                            <div
                              ref={paypalContainerRef}
                              className="mt-5"
                              style={{ minHeight: 45 }}
                            />
                          ) : (
                            <p className="font-sm text-danger mb-0">
                              PayPal is not configured (missing
                              NEXT_PUBLIC_PAYPAL_CLIENT_ID).
                            </p>
                          )
                        ) : (
                          <button
                            className="btn btn-default w-100 mt-5"
                            type="button"
                            onClick={handlePayment}
                            disabled={paying}
                          >
                            {paying
                              ? "Opening Payment..."
                              : `Pay ${formatMoney(total, "INR")} via Razorpay`}
                          </button>
                        )}
                        <p className="font-xs color-text-paragraph-2 text-center mt-10 mb-0">
                          Secured by {isPayPal ? "PayPal" : "Razorpay"}. Invoice
                          generated instantly after payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
    </SubUserViewOnlyGuard>
  );
};

export default EmployerBuyCreditsPage;