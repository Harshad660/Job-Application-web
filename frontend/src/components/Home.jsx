import { useEffect } from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJob from "./LatestJob";
import JobRecommendations from "./ai/JobRecommendations";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  useGetAllJobs();

  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/admin/companies");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-500">
      
      <Navbar />

      <main className="space-y-20">
        <HeroSection />
        <CategoryCarousel />
        {user && user.role === 'student' && (
           <div className="max-w-7xl mx-auto px-4">
              <JobRecommendations />
           </div>
        )}
        <LatestJob />
      </main>

      <Footer />
    </div>
  );
};

export default Home;