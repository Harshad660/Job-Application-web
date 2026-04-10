import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "../../redux/jobSlice.js";

const filterData = [
  {
    filterType: "Location",
    array: ["Delhi NCR", "Noida", "Pune", "Mumbai"],
  },
  {
    filterType: "Industry",
    array: ["Frontend Developer", "Backend Developer", "Full Stack Developer"],
  },
  {
    filterType: "Salary",
    array: ["0–40k", "40k–1 Lakh", "1–5 Lakh"],
  },
];

const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();

  const clearFilterHandler = () => {
    setSelectedValue("");
    dispatch(setSearchedQuery(""));
  };

  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue));
  }, [selectedValue, dispatch]);

  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-lg text-gray-800">
          Filter Jobs
        </h1>

        {selectedValue && (
          <Button
            variant="ghost"
            className="text-sm text-purple-600 hover:text-purple-700"
            onClick={clearFilterHandler}
          >
            Clear
          </Button>
        )}
      </div>

      <hr className="mb-4 border-gray-200" />

      <RadioGroup
        value={selectedValue}
        onValueChange={setSelectedValue}
        className="space-y-6"
      >
        {filterData.map((data, index) => (
          <div key={index}>
            {/* Section Title */}
            <h2 className="font-medium text-gray-700 mb-3">
              {data.filterType}
            </h2>

            {/* Options */}
            <div className="space-y-2">
              {data.array.map((item, idx) => {
                const itemId = `filter-${index}-${idx}`;
                const isSelected = selectedValue === item;

                return (
                  <label
                    key={itemId}
                    htmlFor={itemId}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border
                      ${
                        isSelected
                          ? "bg-purple-50 border-purple-400 text-purple-700"
                          : "border-transparent hover:bg-gray-100"
                      }`}
                  >
                    <RadioGroupItem value={item} id={itemId} />
                    <span className="text-sm">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
