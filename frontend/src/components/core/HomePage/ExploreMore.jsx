import React, { useState } from "react";
import { HomePageExplore } from "../../../../data/homepage-explore";
import CourseCard from "./CourseCard";

const tabsName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skills paths",
  "Career paths",
];

const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(
    HomePageExplore[0].courses[0].heading
  );

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading);
  };

  return (
    <div className="relative w-full livecode-glass-card border border-white/5 overflow-hidden">
      
      {/* IDE Window Header */}
      <div className="bg-[#0B0F19] flex items-center px-4 py-3 border-b border-white/5">
        <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs font-mono text-richblack-400">Explore_Curriculum.json</div>
      </div>

      {/* IDE Tabs Section */}
      <div className="flex overflow-x-auto bg-[#0B0F19] border-b border-white/5 no-scrollbar">
        {tabsName.map((ele, index) => {
          return (
            <div
              className={`text-sm font-mono flex items-center gap-2 px-6 py-3 cursor-pointer transition-all duration-200 border-r border-white/5 whitespace-nowrap
              ${currentTab === ele 
                ? "bg-[#1e1e1e] text-livecode-300 border-t-2 border-t-livecode-400" 
                : "bg-[#0B0F19] text-richblack-400 hover:bg-[#1e1e1e]/50 border-t-2 border-t-transparent"}`}
              key={index}
              onClick={() => setMyCards(ele)}
            >
              {ele}
            </div>
          );
        })}
      </div>

      {/* Cards Section */}
      <div className="relative z-10 flex flex-wrap justify-center lg:justify-between gap-6 w-full text-black p-8 bg-[#1e1e1e]/50">
        {courses.map((ele, index) => {
          return (
            <CourseCard
              key={index}
              cardData={ele}
              currentCard={currentCard}
              setCurrentCard={setCurrentCard}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExploreMore;