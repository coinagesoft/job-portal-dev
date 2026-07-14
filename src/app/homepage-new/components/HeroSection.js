"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getJobFilterOptions } from "@/services/candidate/jobFilterService";

// Custom dropdown that always renders BELOW the field (never flips upward,
// unlike native <select> which the browser can position based on viewport space).
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
          backgroundColor: "transparent",
          textAlign: "left",
          minHeight: "50px",
          boxSizing: "border-box",
          userSelect: "none",
          width: "100%",
          paddingRight: "30px"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            display: "block"
          }}
        >
          {loading ? "Loading..." : value || placeholder}
        </span>
      </div>

      {isOpen && !loading && (
        <div
          className="custom-dropdown-menu"
          style={{
            position: "absolute",
            // Force the panel to always open downward — never above the field.
            top: "100%",
            bottom: "auto",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "1px solid #7c8493",
            borderRadius: "0px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
            maxHeight: "280px",
            overflowY: "auto",
            marginTop: "4px"
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "left",
              backgroundColor: !value ? "#1967d2" : "#ffffff",
              color: !value ? "#ffffff" : "#111111",
              transition: "background-color 0.1s, color 0.1s",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            onClick={() => handleSelect("")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1967d2";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              if (value) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#111111";
              } else {
                e.currentTarget.style.backgroundColor = "#1967d2";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
          >
            {placeholder}
          </div>
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <div
                key={opt}
                style={{
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "left",
                  backgroundColor: isSelected ? "#1967d2" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#111111",
                  transition: "background-color 0.1s, color 0.1s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={() => handleSelect(opt)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1967d2";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (value === opt) {
                    e.currentTarget.style.backgroundColor = "#1967d2";
                    e.currentTarget.style.color = "#ffffff";
                  } else {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#111111";
                  }
                }}
              >
                {opt}
              </div>
            );
          })}
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
          <div className="banner-inner" style={{ maxWidth: "900px" }}>
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
                className="form-find text-start mt-40 wow animate__animated animate__fadeInUp"
                data-wow-delay=".2s"
              >
                <form className="dashboard-search-form" onSubmit={handleSearch}>
                  {/* TRADE CATEGORY */}
                  <div className="box-industry" style={{ minWidth: "260px", flex: "0 0 220px", marginRight: "12px", position: "relative" }}>
                    <CustomDropdown
                      placeholder="Trade Category"
                      options={tradeCategoryOptions}
                      value={industries}
                      onChange={setIndustries}
                      loading={optionsLoading}
                    />
                  </div>

                  {/* LOCATION */}
                  <div style={{ minWidth: "200px", flex: "0 0 200px", marginRight: "10px", position: "relative" }}>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}