import { Suspense } from "react";
import Preloader from "@/app/Homepage/components/Preloader";
import ExploreMarketplace from "@/app/Homepage/components/ExploreMarketplace";
import BrowseByCategory from "./components/BrowseByCategory";
import HowItWorks from "./components/HowItWorks";
import JobsByLocation from "./components/JobsByLocation";
import JobsByRole from "./components/JobsByRole";
import LatestJobsNew from "./components/LatestJobsNew";
import StatsSectionNew from "./components/StatsSectionNew";
import HeroSection from "./components/HeroSection";
import JobsOfTheDay from "./components/JobsOfTheDay";

// export const metadata = {
//   title: "Jobbox - New Homepage Sample",
//   description: "Template-based homepage sample route",
// };

export default function HomepageNewPage() {
  return (
    <>
      <Preloader />
      <main className="main">
        <Suspense fallback={<div className="container py-4 text-center text-white">Loading search...</div>}>
          <HeroSection />
        </Suspense>
        <BrowseByCategory />
        <StatsSectionNew />
        <HowItWorks />
        <LatestJobsNew />
        <JobsByLocation />
        <JobsOfTheDay />
        <JobsByRole />
        {/* <ExploreMarketplace /> */}
      </main>
    </>
  );
}

