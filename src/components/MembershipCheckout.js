"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import {
  createCreditPlanOrder,
  verifyCreditPlanPayment,
  createPayPalPlanOrder,
  capturePayPalPlanPayment,
  validatePlanCoupon,
} from "@/services/recruiter/recruiterCreditWalletService";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_MODE === "sandbox";

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

/**
 * Order summary + coupon + pay button for ONE membership plan.
 * Rendered inline on the Subscription page so the user never leaves it.
 *
 * plan: { planId, planName, credits, validityMonths, price }
 * onSuccess(plan, amountText) is called after the payment is verified.
 */
const MembershipCheckout = ({
  plan,
  currency = "INR",
  isPayPal,
  isRazorpay,
  onSuccess,
}) => {
  const [paying, setPaying] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef(null);

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

  // A coupon belongs to one plan — drop it when the plan changes.
  useEffect(() => {
    clearCoupon();
  }, [plan?.planId]);

  const activeCoupon = couponApplied ? couponCode.trim().toUpperCase() : "";
  const price = Number(plan?.price || 0);
  const discount = activeCoupon ? Math.min(couponDiscount, price) : 0;
  const netPrice = price - discount;
  const gst = !isPayPal ? netPrice * 0.18 : 0; // GST on Razorpay / India only
  const total = netPrice + gst;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }
    try {
      setCouponLoading(true);
      setCouponMessage("");
      const result = await validatePlanCoupon(plan.planId, code);
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

  // ---------- Razorpay ----------
  const handlePayment = async () => {
    if (!isRazorpay) return;
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment gateway is loading. Please try again.");
      return;
    }
    setPaying(true);
    try {
      const order = await createCreditPlanOrder(plan.planId, activeCoupon);
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
        description: `${plan.planName} - ${plan.credits} Credits`,
        handler: async (response) => {
          try {
            const verify = await verifyCreditPlanPayment({
              transactionId: order.transactionId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verify.success) {
              await onSuccess?.(plan, formatMoney(total, "INR"));
            } else {
              console.error("Payment verification failed:", verify);
              alert(verify.message || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Payment verification exception:", err);
            const serverMsg =
              err.response?.data?.message || err.response?.data || "";
            alert(`Payment verification failed: ${serverMsg || err.message}`);
          } finally {
            setPaying(false);
          }
        },
        prefill: { name: "Recruiter", email: "", contact: "" },
        notes: {
          planId: plan.planId,
          planName: plan.planName,
          credits: plan.credits,
        },
        theme: { color: "#ff9900" },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error(response.error);
        alert(response.error.description || "Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Unable to create payment order.");
      setPaying(false);
    }
  };

  // ---------- PayPal ----------
  useEffect(() => {
    if (!isPayPal || !paypalReady || !plan) return;
    const container = paypalContainerRef.current;
    if (!container || typeof window === "undefined" || !window.paypal?.Buttons) return;

    container.innerHTML = "";
    let order = null;
    const amountText = formatMoney(total, currency);

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "pay" },
      createOrder: async () => {
        setPaying(true);
        order = await createPayPalPlanOrder(plan.planId, activeCoupon);
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
            await onSuccess?.(plan, amountText);
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
  }, [isPayPal, paypalReady, plan?.planId, currency, activeCoupon, total]);

  if (!plan) return null;

  return (
    <div className="row justify-content-center mt-20" id="membership-checkout">
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

      <div className="col-lg-6 col-md-10 col-sm-12">
        <div className="card-grid-2 hover-up cv-search-candidate-card">
          <div className="card-block-info pt-20">
            <h5 className="mb-15">Order Summary</h5>

            {/* Coupon */}
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

            <div className="d-flex justify-content-between mb-10">
              <span className="font-sm color-text-paragraph">Plan</span>
              <strong>
                {plan.planName} — {plan.credits} credits
              </strong>
            </div>
            <div className="d-flex justify-content-between mb-10">
              <span className="font-sm color-text-paragraph">Price</span>
              <strong>{formatMoney(price, currency)}</strong>
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
                <span className="font-sm color-text-paragraph">GST (18%)</span>
                <strong>{formatMoney(gst, "INR")}</strong>
              </div>
            )}
            <div
              className="d-flex justify-content-between mb-20 pt-10"
              style={{ borderTop: "1px solid #eee" }}
            >
              <span className="font-md color-text-paragraph">Total Payable</span>
              <strong className="color-brand-1" style={{ fontSize: "18px" }}>
                {formatMoney(total, currency)}
              </strong>
            </div>

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
                <div ref={paypalContainerRef} className="mt-5" style={{ minHeight: 45 }} />
              ) : (
                <p className="font-sm text-danger mb-0">
                  PayPal is not configured (missing NEXT_PUBLIC_PAYPAL_CLIENT_ID).
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
              Secured by {isPayPal ? "PayPal" : "Razorpay"}. Invoice generated
              instantly after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCheckout;