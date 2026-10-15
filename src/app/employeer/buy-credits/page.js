"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  getWallet,
  getCreditPlans,
  createCreditPlanOrder,
  verifyCreditPlanPayment,
  createPayPalPlanOrder,
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
  // Detected server-side from the visitor's public IP: { countryCode, countryName, region, currency, paymentGateway }
  const [visitor, setVisitor] = useState(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef(null);

  const isPayPal = visitor?.paymentGateway === "PayPal";
  const isRazorpay = visitor?.paymentGateway === "Razorpay";
  const currency = visitor?.currency || "INR";

  // GST (18%) applies to Razorpay / India only.
  const gst = selected && !isPayPal ? selected.price * 0.18 : 0;

  const total = selected ? selected.price + gst : 0;

  const init = async () => {
    setPlansLoading(true);
    setPlansError(null);

    try {
      const v = await getVisitorPaymentRegion();
      if (!v) throw new Error("Could not detect your country.");
      setVisitor(v);

      // PayPal regions are exact backend codes ("us", "gb"...) so ask the server to filter.
      // Razorpay keeps the previous behaviour (all plans, India filtered client-side).
      const data = await getCreditPlans(v.paymentGateway === "PayPal" ? v.region : undefined);
      const list = Array.isArray(data) ? data : data?.plans || [];
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

  useEffect(() => {
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
        order = await createPayPalPlanOrder(pack.planId);

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
  }, [isPayPal, paypalReady, paid, plansLoading, selected?.planId, currency]);

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
      const order = await createCreditPlanOrder(selected.planId);

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
                  <h3 className="mb-5">Buy Credits</h3>
                  <span className="font-sm color-text-paragraph-2">
                    Choose a pack that fits your hiring volume
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
                        Plan Expires
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
                <h4 className="mb-15">No credit plans available</h4>
                <p className="font-md color-text-paragraph-2 mb-20">
                  {visitor?.countryName
                    ? `There are no active credit plans available for your country/region (${visitor.countryName}).`
                    : "We could not determine your region. Please refresh the page."}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mt-20 mb-10">
                  <h2 className="mb-15">Select A Credit Pack</h2>
                  <p className="font-lg color-text-paragraph-2">
                    Longer packs offer a lower per-credit rate. Top-ups inherit your
                    active package expiry date.
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
                              <p className="text-desc-package font-sm color-text-paragraph mb-30">
                                {formatMoney(pack.price, currency)}
                                {isPayPal ? "" : " + GST"}
                              </p>
                            </div>
                            <ul className="list-package-feature flex-grow-1 mb-30">
                              {/* <li>{pack.rateLabel}</li> */}
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