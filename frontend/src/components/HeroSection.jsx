import { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "../../redux/jobSlice.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { TypeAnimation } from "react-type-animation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const suggestions = [
    "React Developer",
    "Java Developer",
    "Internships",
    "Data Analyst",
  ];

  const searchJobHandler = () => {
    if (!query.trim()) return;
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden bg-white">

      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-purple-50 via-white to-pink-50" />

      <motion.div
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute inset-0 -z-10 bg-purple-300 blur-3xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
      >
        {/* LEFT */}
        <div className="text-gray-900 flex flex-col gap-6">

          {/* Badge */}
          <motion.span
            variants={itemVariants}
            className="px-6 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold w-fit"
          >
            🚀 India’s #1 Placement Platform
          </motion.span>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Become a{" "}
            <span className="text-purple-600">
              <TypeAnimation
                sequence={[
                  "Software Engineer",
                  2000,
                  "Frontend Developer",
                  2000,
                  "Data Analyst",
                  2000,
                ]}
                speed={50}
                repeat={Infinity}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg"
          >
            Find verified jobs, internships & placement opportunities
            from top companies across India.
          </motion.p>

          {/* Live Hiring Badge */}
          <motion.div
            variants={itemVariants}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-full w-fit text-sm"
          >
            🔥 1200+ Jobs Hiring Now
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants}>
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} scale={1.02}>
              <div className="flex shadow-xl bg-white border border-gray-200 rounded-full pl-6 items-center gap-3">
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && searchJobHandler()
                  }
                  className="outline-none border-none w-full bg-transparent py-4 text-gray-800"
                />

                <Button
                  onClick={searchJobHandler}
                  disabled={!query.trim()}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-6"
                >
                  <Search className="h-5 w-5 text-white" />
                </Button>
              </div>
            </Tilt>
          </motion.div>

          {/* Suggestions */}
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((item, i) => (
              <span
                key={i}
                onClick={() => setQuery(item)}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Quick Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 flex-wrap"
          >
            <Button
              onClick={() => navigate("/internships")}
              className="bg-purple-100 text-purple-700 rounded-full px-6"
            >
              🎓 Internships
            </Button>

            <Button
              onClick={() => navigate("/fresher-jobs")}
              className="bg-pink-100 text-pink-700 rounded-full px-6"
            >
              💼 Fresher Jobs
            </Button>

            <Button
              onClick={() => navigate("/resume-builder")}
              className="bg-blue-100 text-blue-700 rounded-full px-6"
            >
              📄 Resume Builder
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex gap-8 mt-4 flex-wrap"
          >
            {[
              { label: "Students Placed", value: "50,000+" },
              { label: "Companies Hiring", value: "2,500+" },
              { label: "Avg Salary", value: "₹6.5 LPA" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <h3 className="text-2xl font-bold text-purple-600">
                  {item.value}
                </h3>
                <p className="text-gray-500 text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT IMAGE */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center relative"
        >
          <motion.img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="team"
            className="w-full max-w-md rounded-2xl shadow-2xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />

          {/* Floating Cards */}
          <div className="absolute -top-6 -left-6 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow">
            💼 500+ New Jobs Today
          </div>

          <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow">
            ⭐ Top Companies Hiring
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;