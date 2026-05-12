"use client";

import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: "/assets/imgs/page/homepage1/management.svg",
    title: "Create Your Profile",
    desc: "Upload your trade details and work history in simple steps.",
  },
  {
    step: "02",
    icon: "/assets/imgs/page/homepage1/finance.svg",
    title: "Choose Jobs Fast",
    desc: "Browse jobs by location, role, and salary and apply quickly.",
  },
  {
    step: "03",
    icon: "/assets/imgs/page/homepage1/human.svg",
    title: "Track Application",
    desc: "Get updates from recruiters and move ahead with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-box mt-70 mb-50">
      <div className="container">
        <div className="text-center mb-50">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
            How It Works
          </h2>
          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Complete your journey in 3 simple steps
          </p>
        </div>
        <div className="row mt-40">
          {steps.map((item) => (
            <div
              key={item.step}
              className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12 mb-30"
            >
              <div
                className="card-grid-1 hover-up wow animate__animated animate__fadeInUp"
                style={{
                  textAlign: "center",
                  padding: "36px 28px",
                  borderRadius: "12px",
                  border: "1px solid #ffc151",
                }}
              >
                <div
                  className="mb-15"
                  style={{
                    fontSize: "40px",
                    fontWeight: 800,
                    color: "#ffa300",
                    opacity: 0.8,
                  }}
                >
                  {item.step}
                </div>
                <div
                  className="mb-20"
                  style={{
                    width: "82px",
                    height: "82px",
                    margin: "0 auto",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #122359 0%, #1a327a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 30px rgba(18, 35, 89, 0.18)",
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{
                      width: 42,
                      height: 42,
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </div>
                <h5 className="mb-10">{item.title}</h5>
                <p className="font-sm color-text-paragraph">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-25">
          <Link href="/register" className="btn btn-default">
            Start Now
          </Link>
        </div>
      </div>
    </section>
  );
}
