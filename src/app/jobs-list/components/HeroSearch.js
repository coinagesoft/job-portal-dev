"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockJobs } from "./data";

const HeroSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [industries, setIndustries] = React.useState("");

  const availableIndustries = React.useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();

    const jobsForLocation = normalizedLocation
      ? mockJobs.filter(
          (job) =>
            String(job.location || "")
              .trim()
              .toLowerCase() === normalizedLocation
        )
      : mockJobs;

    return Array.from(
      new Set(
        jobsForLocation.flatMap(
          (job) => job.industries || []
        )
      )
    ).sort();
  }, [location]);

  React.useEffect(() => {
    if (
      industries &&
      !availableIndustries.includes(industries)
    ) {
      setIndustries("");
    }
  }, [availableIndustries, industries]);

  React.useEffect(() => {
    setKeyword(searchParams.get("q") || "");

    setLocation(
      searchParams.get("location") || ""
    );

    setIndustries(
      searchParams.get("industry") || ""
    );
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

    router.push(
      query ? `/jobs-list?${query}` : "/jobs-list"
    );
  };

  return (
    <section className="section-box-2">
      <div className="container">
        <div className="banner-hero banner-single banner-single-bg jobs-list-hero-graphic-orange">
          <div className="block-banner text-center">
            <h3 className="animate__animated animate__fadeInUp">
              <span className="color-brand-2">
                22 Jobs
              </span>{" "}
              Available Now
            </h3>

            <div
              className="font-sm color-text-paragraph-2 mt-10 wow animate__animated animate__fadeInUp"
              data-wow-delay=".1s"
            >
              Explore verified openings across
              maritime, industrial, and skilled
              trade sectors,
              <br className="d-none d-xl-block" />
              with salary, location, and experience
              filters aligned to your profile.
            </div>

            <div
              className="form-find text-start mt-40 wow animate__animated animate__fadeInUp"
              data-wow-delay=".2s"
            >
              <form
                className="dashboard-search-form"
                onSubmit={handleSearch}
              >
                {/* INDUSTRY */}
                <div className="box-industry">
                  <select
                    className="form-input mr-10 dashboard-select-arrow"
                    value={industries}
                    onChange={(event) =>
                      setIndustries(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                       Industry
                    </option>

                    {availableIndustries.map(
                      (industry) => (
                        <option
                          key={industry}
                          value={industry}
                        >
                          {industry}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* LOCATION */}
                <select
                  className="form-input mr-10 dashboard-select-arrow"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Location
                  </option>

                  <option value="Mumbai">
                    Mumbai
                  </option>

                  <option value="Pune">
                    Pune
                  </option>

                  <option value="Chennai">
                    Chennai
                  </option>

                  <option value="Hyderabad">
                    Hyderabad
                  </option>

                  <option value="Delhi / NCR">
                    Delhi / NCR
                  </option>

                  <option value="Bengaluru">
                    Bengaluru
                  </option>
                </select>

                {/* KEYWORD */}
                <input
                  className="form-input input-keysearch mr-10 dashboard-search-text"
                  type="text"
                  placeholder="Role, skill, or company"
                  value={keyword}
                  onChange={(event) =>
                    setKeyword(
                      event.target.value
                    )
                  }
                />

                {/* BUTTON */}
                <button
                  className="btn btn-default btn-find font-sm"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
