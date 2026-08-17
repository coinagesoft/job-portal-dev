"use client";

import { Suspense, useState, useEffect } from "react";
import Preloader from "@/app/Homepage/components/Preloader";
import ExploreMarketplace from "@/app/Homepage/components/ExploreMarketplace";
import BrowseByCategory from "./components/BrowseByCategory";
import HowItWorks from "./components/HowItWorks";
import JobsByLocation from "./components/JobsByLocation";
import JobsByRole from "./components/JobsByRole";
import PopularCompanies from "./components/PopularCompanies";
import StatsSectionNew from "./components/StatsSectionNew";
import HeroSection from "./components/HeroSection";
import JobsOfTheDay from "./components/JobsOfTheDay";
import { getHomepageData } from "@/services/candidate/homepageService";

// export const metadata = {
//   title: "Jobbox - New Homepage Sample",
//   description: "Template-based homepage sample route",
// };

export default function HomepageNewPage() {
  const [homepageData, setHomepageData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHomepageData();
        if (response.data && response.data.success) {
          setHomepageData(response.data);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Preloader />
      <main className="main">
        <Suspense fallback={<div className="container py-4 text-center text-white">Loading search...</div>}>
          <HeroSection heroData={homepageData?.hero} />
        </Suspense>
        <BrowseByCategory industriesData={homepageData?.industries} />
        <StatsSectionNew statisticsData={homepageData?.statistics} />
        <HowItWorks />
      
        <JobsByLocation locationsData={homepageData?.locations} />
        <JobsOfTheDay />
        <JobsByRole rolesData={homepageData?.roles} />
        <PopularCompanies />
          {/* <LatestJobsNew /> */}
        {/* <ExploreMarketplace /> */}
      </main>
    </>
  );
}

