import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { Code, Database, Palette, BarChart, Layers } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "../../redux/jobSlice.js";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const categories = [
  { label: "Frontend Developer", icon: Code },
  { label: "Backend Developer", icon: Database },
  { label: "Data Science", icon: BarChart },
  { label: "Graphic Designer", icon: Palette },
  { label: "Full Stack Developer", icon: Layers },
];

const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const plugin = useRef(
    Autoplay({
      delay: 1700, // ⏱ change speed here (milliseconds)
      stopOnInteraction: false, // keeps autoplay after manual click
    })
  );

  const handleCategoryClick = (category) => {
    dispatch(setSearchedQuery(category));
    navigate("/browse");
  };

  return (
    <section className="my-16 md:my-24 px-4">
      <div className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900">
          Browse Jobs by Category
        </h1>
        <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base">
          Choose a role to explore opportunities
        </p>
      </div>

      {/* ✅ Added plugins prop */}
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-6xl mx-auto overflow-visible"
      >
        <CarouselContent className="-ml-4 items-stretch">
          {categories.map(({ label, icon: Icon }) => (
            <CarouselItem
              key={label}
              className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="relative overflow-hidden rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 min-h-[240px] sm:min-h-[260px] md:min-h-[300px] flex flex-col justify-between bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-300 rounded-full opacity-30 blur-2xl"></div>

                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                  <div className="bg-white shadow-sm p-4 md:p-5 rounded-full">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600" />
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800">
                    {label}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Explore jobs in {label}
                  </p>
                </div>

                <Button
                  onClick={() => handleCategoryClick(label)}
                  className="mt-6 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg w-full"
                >
                  View Jobs
                </Button>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
};

export default CategoryCarousel;
