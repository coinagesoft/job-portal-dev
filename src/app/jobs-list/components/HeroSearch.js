"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getJobFilterOptions } from "@/services/candidate/jobFilterService";

const HeroSearch = ({ jobs = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [tradeCategory, setTradeCategory] = React.useState("");

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

  // Keep the form in sync with the URL (e.g. back/forward nav, direct links).
  // Note: this reads "tradeCategory", a separate param from the homepage
  // category tiles' "industry" param — they're different fields on a job
  // (tradeCategory vs industryType) and must not share one URL key.
  React.useEffect(() => {
    setKeyword(searchParams.get("q") || "");
    setLocation(searchParams.get("location") || "");
    setTradeCategory(searchParams.get("tradeCategory") || "");
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

    if (tradeCategory) {
      params.set("tradeCategory", tradeCategory);
    }

    const query = params.toString();

    router.push(query ? `/jobs-list?${query}` : "/jobs-list");
  };

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
            <h3 className="animate__animated animate__fadeInUp">
              <span className="color-brand-2">{jobs.length} Jobs</span> Available Now
            </h3>

            <div
              className="font-sm color-text-paragraph-2 mt-10 wow animate__animated animate__fadeInUp"
              data-wow-delay=".1s"
            >
              Explore verified openings across maritime, industrial, and skilled trade sectors,
              <br className="d-none d-xl-block" />
              with salary, location, and experience filters aligned to your profile.
            </div>

            <div
              className="form-find text-start mt-40 wow animate__animated animate__fadeInUp"
              data-wow-delay=".2s"
            >
              <form className="dashboard-search-form" onSubmit={handleSearch}>
                {/* TRADE CATEGORY — sourced from /api/candidate/jobs/filter-options */}
                <div className="box-industry"style={{ minWidth: "220px", flex: "0 0 220px" }} >
                  <select
                    className="form-input mr-12 dashboard-select-arrow"
                    value={tradeCategory}
                    onChange={(event) => setTradeCategory(event.target.value)}
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading ? "Loading…" : "Trade Category"}
                    </option>
                    {tradeCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LOCATION — sourced from /api/candidate/jobs/filter-options */}
                <select
                  className="form-input mr-10 dashboard-select-arrow"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={optionsLoading}
                >
                  <option value="">
                    {optionsLoading ? "Loading…" : "Location"}
                  </option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* KEYWORD */}
                <input
                  className="form-input input-keysearch mr-10 dashboard-search-text"
                  type="text"
                  placeholder="Role, skill, or company"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />

                {/* BUTTONS */}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;