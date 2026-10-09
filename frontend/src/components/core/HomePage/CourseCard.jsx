import React from "react";
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  const isCurrent = currentCard === cardData?.heading;
  
  return (
    <div
      className={`w-full lg:w-[31%] h-[300px] flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform 
      ${isCurrent 
        ? "bg-gradient-to-br from-livecodeDark-800 to-livecodeDark-900 shadow-[0_0_30px_rgba(45,212,191,0.2)] border border-livecode-400/50 scale-105 z-10" 
        : "bg-livecodeDark-900 border border-white/5 hover:border-white/10 hover:bg-white/5"}`}
      onClick={() => setCurrentCard(cardData?.heading)}
    >
      <div className={`p-6 flex-grow flex flex-col gap-4 border-b border-white/5 ${isCurrent ? 'border-livecode-400/20' : ''}`}>
        <h3 className={`font-bold text-2xl tracking-wide ${isCurrent ? "text-livecode-300" : "text-white"}`}>
          {cardData?.heading}
        </h3>
        <p className="text-richblack-400 text-sm leading-relaxed line-clamp-4">
            {cardData?.description}
        </p>
      </div>

      <div
        className={`flex justify-between px-6 py-4 text-sm font-medium ${
          isCurrent ? "text-livecode-400 bg-livecode-400/5" : "text-richblack-500 bg-white/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <HiUsers className="text-lg" />
          <p>{cardData?.level}</p>
        </div>

        <div className="flex items-center gap-2">
          <ImTree className="text-lg" />
          <p>{cardData?.lessionNumber} Lessons</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;