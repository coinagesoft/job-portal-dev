"use client";

import { useToast } from '@/components/Toast';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "@/store/authSlice";
import { ROLE_DEFAULT_ROUTE, STATIC_ROLE_BY_MOBILE } from "@/constants/panelConfig";

export default function LoginPage() {
  const showToast = useToast();
  const [input, setInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading: authLoading, user } = useSelector((state) => state.auth);

  // Auto-detect type
  const isEmail = input.includes('@');
  const isMobile = /^\d{10}$/.test(input.replace(/\D/g, ''));
  const normalizedMobile = input.replace(/\D/g, '').slice(-10);
  const isKnownDemoNumber = Boolean(STATIC_ROLE_BY_MOBILE[normalizedMobile]);

  useEffect(() => {
    if (!user?.role) return;
    router.replace(ROLE_DEFAULT_ROUTE[user.role] || "/Homepage");
  }, [router, user]);

  const isInputValid = isEmail ? input.includes('@') && input.includes('.') : isMobile;

  const sendOtp = () => {
    if (!isInputValid) {
      setError("Enter valid email or 10-digit mobile number.");
      return;
    }

    if (isMobile && !isKnownDemoNumber) {
      setError("Only assigned demo numbers allowed: 1010101010 (Candidate), 2020202020 (Employer).");
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setError("");
    showToast(`OTP sent to ${isEmail ? 'email' : 'mobile'}: ${newOtp}`, 'info');
  };

  const handleSignIn = async () => {
    if (otp !== generatedOtp) {
      setError("Invalid OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await dispatch(
        loginUser({
          [isEmail ? 'email' : 'mobile']: isEmail ? input : normalizedMobile,
          enteredOtp: otp,
          generatedOtp: generatedOtp,
        })
      ).unwrap();

      showToast('Login successful! Redirecting...', 'success');
      router.push(payload.redirectTo || "/Homepage");
    } catch (err) {
      setError(err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <section className="pt-100 login-register">
        <div className="container">
          <div className="row login-register-cover">
            <div className="col-lg-4 col-md-6 col-sm-12 mx-auto">
              <div className="text-center">
                <p className="font-sm text-brand-2">Sign In</p>
                <h2 className="mt-10 mb-5 text-brand-1">Access Your Portal</h2>
                <p className="font-sm color-text-paragraph-2 mb-30">
                  Enter email or mobile -&gt; OTP -&gt; Sign In<br/>
                  Demo: 1010101010 (Candidate), 2020202020 (Employer)
                </p>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}

                <div className="form-group mb-4">
                  <label className="font-sm color-text-mutted mb-10">
                    Email or Mobile Number <span className="color-red">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError("");
                    }}
                    placeholder="Email or 10-digit mobile"
                  />
                  <small className="form-text font-xs color-text-paragraph-2 d-block mt-5">
                    {input && !isInputValid ? (
                      isEmail ? "Enter valid email" : "Enter 10-digit mobile"
                    ) : isMobile && !isKnownDemoNumber ? (
                      "Use demo numbers: 1010101010 / 2020202020"
                    ) : (
                      "We'll send OTP to verify"
                    )}
                  </small>
                </div>

                <div className="form-group mb-4">
                  <button
                    className="btn btn-border btn-sm w-100"
                    type="button"
                    onClick={sendOtp}
                    disabled={!isInputValid || loading || otpSent}
                  >
                    Send OTP
                  </button>
                </div>

                {otpSent && (
                  <div className="form-group mb-4">
                    <label className="font-sm color-text-mutted mb-10">Enter OTP</label>
                    <input
                      className="form-control"
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                    />
                  </div>
                )}

                {(otpSent && otp.length === 6) && (
                  <div className="form-group">
                    <button
                      className="btn btn-brand-1 hover-up w-100"
                      type="button"
                      onClick={handleSignIn}
                      disabled={loading || authLoading}
                    >
                      {loading || authLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                )}

                <div className="text-center">
                  <Link href="/register" className="font-sm color-text-paragraph-2">
                    Don't have account? Register
                  </Link>
                </div>
              </form>
            </div>

            <div className="img-1 d-none d-lg-block">
              <Image
                className="shape-1"
                src="/assets/imgs/page/login-register/img-1.svg"
                alt="JobBox"
                width={200}
                height={200}
              />
            </div>
            <div className="img-2">
              <Image
                src="/assets/imgs/page/login-register/img-2.svg"
                alt="JobBox"
                width={300}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

