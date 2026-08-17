import React from "react";

export default function StatsSectionNew({ statisticsData }) {
  const stats = React.useMemo(() => {
    if (statisticsData && statisticsData.length > 0) {
      return [...statisticsData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    // Hardcoded fallback
    return [
      {
        label: "Candidates Placed",
        value: "25",
        suffix: " K+",
        iconSlug: "Skilled candidates successfully placed in domestic and overseas project opportunities",
      },
      {
        label: "Countries Overseas",
        value: "22",
        suffix: " +",
        iconSlug: "Active hiring network supporting international manpower deployment programs",
      },
      {
        label: "Skilled People",
        value: "10",
        suffix: " K+",
        iconSlug: "Verified professionals in maintenance, fabrication, logistics, marine and construction",
      },
      {
        label: "Happy Clients",
        value: "65",
        suffix: " +",
        iconSlug: "Trusted employers and recruitment partners with repeat hiring demand across project cycles",
      },
    ];
  }, [statisticsData]);

  return (
    <section className="section-box overflow-visible mt-50 mb-50">
      <div className="container">
        <div className="row">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
              <div className="text-center">
                <h1 className="color-brand-2">
                  <span className="count" data-target={stat.value}>
                    {stat.value}
                  </span>
                  <span>{stat.suffix}</span>
                </h1>
                <h5>{stat.label}</h5>
                <p className="font-sm color-text-paragraph mt-10">
                  {stat.iconSlug}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
