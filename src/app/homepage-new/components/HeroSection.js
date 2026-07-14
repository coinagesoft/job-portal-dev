"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getJobFilterOptions } from "@/services/candidate/jobFilterService";

const CustomDropdown = ({ options, value, onChange, placeholder, loading }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="position-relative w-100">
      <div
        className="form-input dashboard-select-arrow"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: value ? "#111111" : "#7c8493",
          backgroundPosition: "right 14px center",
          paddingRight: "38px",
          minHeight: "50px",
          lineHeight: "30px",
          userSelect: "none",
          backgroundColor: "#ffffff",
          textAlign: "left"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {loading ? "Loading..." : value || placeholder}
      </div>

      {isOpen && !loading && (
        <div
          className="custom-dropdown-menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0px 8px 24px rgba(17, 17, 17, 0.15)",
            zIndex: 9999,
            maxHeight: "250px",
            overflowY: "auto",
            marginTop: "6px"
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              color: "#7c8493",
              backgroundColor: !value ? "#f8f9fa" : "transparent",
              transition: "background-color 0.2s",
              textAlign: "left"
            }}
            onClick={() => handleSelect("")}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                color: "#111111",
                backgroundColor: value === opt ? "#f0f4f9" : "transparent",
                transition: "background-color 0.2s",
                textAlign: "left"
              }}
              onClick={() => handleSelect(opt)}
              onMouseEnter={(e) => {
                if (value !== opt) e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                if (value !== opt) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function HeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [industries, setIndustries] = React.useState("");

  // Real Trade Category + City lists, sourced from the same endpoint the sidebar uses.
  const [tradeCategoryOptions, setTradeCategoryOptions] = React.useState([]);
  const [cityOptions, setCityOptions] = React.useState([]);
  const [optionsLoading, setOptionsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await getJobFilterOptions();
        if (response.data.success) {
          setTradeCategoryOptions(response.data.tradeCategories || []);
          setCityOptions(response.data.states || []);
        }
      } catch (error) {
        console.error("Error loading Hero Search filter options:", error);
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  // Keep the form in sync with the URL (e.g. back/forward nav, direct links)
  React.useEffect(() => {
    if (searchParams) {
      setKeyword(searchParams.get("q") || "");
      setLocation(searchParams.get("location") || "");
      setIndustries(searchParams.get("industry") || "");
    }
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }

    if (location) {
      params.set("location", location);
    }

    if (industries) {
      params.set("industry", industries);
    }

    const query = params.toString();

    router.push(query ? `/jobs-list?${query}` : "/jobs-list");
  };

  const handleReset = (event) => {
    event.preventDefault();
    setKeyword("");
    setLocation("");
    setIndustries("");
    router.push("/jobs-list");
  };

  return (
    <div>
      <section className="section-box">
        <div className="banner-hero hero-2">
          <div className="banner-inner" style={{ maxWidth: "1140px" }}>
            <div className="block-banner">
              <div style={{ maxWidth: "725px", margin: "0 auto" }}>
                <h1 className="text-42 color-white wow animate__animated animate__fadeInUp">
                  India’s #1 <span className="color-orange">Global</span>
                  <br className="d-none d-lg-block" />
                  Job Portal for Skilled Workers
                </h1>

                <div
                  className="font-lg font-regular color-white mt-20 wow animate__animated animate__fadeInUp"
                  data-wow-delay=".1s"
                >
                  Find verified opportunities across India, UAE, Saudi Arabia,
                  Qatar, and Singapore for technicians, engineers, drivers,
                  construction professionals, marine staff, and skilled workers.
                </div>
              </div>

              <div
                className="form-find mt-40 wow animate__animated animate__fadeIn"
                data-wow-delay=".2s"
                style={{ maxWidth: "850px", margin: "40px auto 0 auto" }}
              >
                <form className="dashboard-search-form" onSubmit={handleSearch}>
                  <div style={{ minWidth: "200px", flex: "0 0 200px", position: "relative", marginRight: "12px" }}>
                    <CustomDropdown
                      placeholder="Trade Category"
                      options={tradeCategoryOptions}
                      value={industries}
                      onChange={setIndustries}
                      loading={optionsLoading}
                    />
                  </div>

                  <div style={{ minWidth: "200px", flex: "0 0 200px", position: "relative", marginRight: "10px" }}>
                    <CustomDropdown
                      placeholder="Location"
                      options={cityOptions}
                      value={location}
                      onChange={setLocation}
                      loading={optionsLoading}
                    />
                  </div>

                  <input
                    className="form-input input-keysearch mr-10 dashboard-search-text"
                    type="text"
                    placeholder="Role, skill, or company"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />

                  <button className="btn btn-default btn-find font-sm" type="submit">
                    Search
                  </button>

                  <a
                    href="#"
                    className="font-sm"
                    style={{
                      marginLeft: 12,
                      alignSelf: "center",
                      color: "var(--text-muted, #7c8493)",
                      cursor: "pointer",
                    }}
                    onClick={handleReset}
                  >
                    Reset
                  </a>
                </form>
              </div>

              <div
                className="list-tags-banner mt-20 wow animate__animated animate__fadeInUp"
                data-wow-delay=".3s"
              >
                <strong>Popular Searches:</strong>
                <Link href="/jobs-list?q=Welder" className="color-white mr-5" style={{ textDecoration: "underline" }}>Welder</Link>,{" "}
                <Link href="/jobs-list?q=HVAC" className="color-white mr-5" style={{ textDecoration: "underline" }}>HVAC</Link>,{" "}
                <Link href="/jobs-list?q=Driver" className="color-white mr-5" style={{ textDecoration: "underline" }}>Driver</Link>,{" "}
                <Link href="/jobs-list?q=Electrician" className="color-white mr-5" style={{ textDecoration: "underline" }}>Electrician</Link>,{" "}
                <Link href="/jobs-list?q=Pipe%20Fitter" className="color-white mr-5" style={{ textDecoration: "underline" }}>Pipe Fitter</Link>,{" "}
                <Link href="/jobs-list?q=Construction" className="color-white mr-5" style={{ textDecoration: "underline" }}>Construction</Link>,{" "}
                <Link href="/jobs-list?q=Marine" className="color-white mr-5" style={{ textDecoration: "underline" }}>Marine</Link>
              </div>
            </div>

            <div className="mt-60">
              {/* <div className="row">
                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">265</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">
                      Daily Jobs Posted
                    </p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">17</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Recruiters</p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">15</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Freelancers</p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">28</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Blog Tips</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}