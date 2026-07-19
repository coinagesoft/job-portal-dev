"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getJobFilterOptions } from "@/services/candidate/jobFilterService";

const HeroSearch = ({ jobs = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─────────────────────────────────────────────────────────────
  // SEARCH STATES
  // ─────────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [tradeCategory, setTradeCategory] = useState("");

  // ─────────────────────────────────────────────────────────────
  // DROPDOWN OPTIONS
  // ─────────────────────────────────────────────────────────────
  const [tradeCategoryOptions, setTradeCategoryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // LOAD FILTER OPTIONS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);

        const response = await getJobFilterOptions();

        console.log("HERO FILTER OPTIONS:", response.data);

        if (response.data?.success) {
          setTradeCategoryOptions(
            response.data.tradeCategories || []
          );

          setCityOptions(
            response.data.states || []
          );
        }
      } catch (error) {
        console.error(
          "Error loading Hero Search filter options:",
          error
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SYNC SEARCH FORM WITH URL QUERY
  //
  // Example:
  // /jobs-list?q=Welder&location=Maharashtra&tradeCategory=Welder
  //
  // Also supports existing homepage URL:
  // /jobs-list?q=Welder&location=Maharashtra&industry=Welder
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const queryKeyword =
      (searchParams.get("q") || "").trim();

    const queryLocation =
      (searchParams.get("location") || "").trim();

    // First check tradeCategory.
    // If not available, fall back to industry.
    const queryTradeCategory =
      (
        searchParams.get("tradeCategory") ||
        searchParams.get("industry") ||
        ""
      ).trim();

    setKeyword(queryKeyword);
    setLocation(queryLocation);
    setTradeCategory(queryTradeCategory);
  }, [searchParams]);

  // ─────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────
  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }

    if (location) {
      params.set("location", location);
    }

    if (tradeCategory) {
      params.set("tradeCategory", tradeCategory);
    }

    const query = params.toString();

    router.push(
      query
        ? `/jobs-list?${query}`
        : "/jobs-list"
    );
  };

  // ─────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────
  const handleReset = (event) => {
    event.preventDefault();

    setKeyword("");
    setLocation("");
    setTradeCategory("");

    router.push("/jobs-list");
  };

  return (
    <section className="section-box-2">
      <div className="container">
        <div className="banner-hero banner-single banner-single-bg jobs-list-hero-graphic-orange">
          <div className="block-banner text-center">

            {/* JOB COUNT */}
            <h3 className="animate__animated animate__fadeInUp">
              <span className="color-brand-2">
                {jobs.length} Jobs
              </span>{" "}
              Available Now
            </h3>

            {/* DESCRIPTION */}
            <div
              className="font-sm color-text-paragraph-2 mt-10 wow animate__animated animate__fadeInUp"
              data-wow-delay=".1s"
            >
              Explore verified openings across maritime, industrial,
              and skilled trade sectors,
              <br className="d-none d-xl-block" />
              with salary, location, and experience filters aligned
              to your profile.
            </div>

            {/* SEARCH FORM */}
            <div
              className="form-find text-start mt-40 wow animate__animated animate__fadeInUp"
              data-wow-delay=".2s"
            >
              <form
                className="dashboard-search-form"
                onSubmit={handleSearch}
              >

                {/* ───────────────────────────────────────────── */}
                {/* TRADE CATEGORY */}
                {/* ───────────────────────────────────────────── */}
                <div
                  className="box-industry"
                  style={{
                    minWidth: "220px",
                    flex: "0 0 220px",
                  }}
                >
                  <select
                    className="form-input mr-12 dashboard-select-arrow"
                    value={tradeCategory}
                    onChange={(event) =>
                      setTradeCategory(event.target.value)
                    }
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading
                        ? "Loading…"
                        : "Trade Category"}
                    </option>

                    {tradeCategoryOptions.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ───────────────────────────────────────────── */}
                {/* LOCATION */}
                {/* ───────────────────────────────────────────── */}
                <select
                  className="form-input dashboard-select-arrow"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  disabled={optionsLoading}
                >
                  <option value="" className="text-align-center">
                    {optionsLoading
                      ? "Loading…"
                      : "Location"}
                  </option>

                  {cityOptions.map((city) => (
                    <option
                      key={city}
                      value={city}
                      className="text-align-center"
                    >
                      {city}
                    </option>
                  ))}
                </select>

                {/* ───────────────────────────────────────────── */}
                {/* KEYWORD */}
                {/* ───────────────────────────────────────────── */}
                <input
                  className="form-input input-keysearch mr-10 dashboard-search-text"
                  type="text"
                  placeholder="Role, skill, or company"
                  value={keyword}
                  onChange={(event) =>
                    setKeyword(event.target.value)
                  }
                />

                {/* ───────────────────────────────────────────── */}
                {/* SEARCH BUTTON */}
                {/* ───────────────────────────────────────────── */}
                <button
                  className="btn btn-default btn-find font-sm"
                  type="submit"
                >
                  Search
                </button>

                {/* ───────────────────────────────────────────── */}
                {/* RESET */}
                {/* ───────────────────────────────────────────── */}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;