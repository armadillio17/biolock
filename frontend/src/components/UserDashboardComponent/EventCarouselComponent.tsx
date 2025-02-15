"use client";

import { useState } from "react";
import { imgData } from "@/data/ts/dummyData"; // Import the data
import { Link } from "react-router-dom";

export const EventCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="flex flex-col w-full max-h-[499px] rounded-2xl px-6 py-4 bg-[#D1F8FF]">
            <div className="overflow-hidden text-ellipsis">
                <div className="flex flex-col text-[#4E4E53]">
                    <p className="text-2xl font-bold">Events</p>
                </div>

                {/* Carousel Container */}
                {imgData.length > 0 && (
                    <div className="flex flex-col my-5 w-full">
                        {/* Image and Content Section */}
                        <div className="flex gap-5">
                            {/* Image Section */}
                            <div className="w-1/2">
                                <img
                                    src={imgData[currentIndex].src}
                                    alt={`Event ${imgData[currentIndex].id}`}
                                    className="w-full h-[300px] object-cover rounded-[10px]"
                                />
                            </div>

                            {/* Content Section */}
                            <div className="w-1/2 p-2 overflow-hidden">
                                <h1 className="text-[18px] font-bold">{imgData[currentIndex].title}</h1>
                                <h2 className="my-1 text-[12px] font-normal">
                                    {imgData[currentIndex].date}
                                </h2>
                                <p className="w-full max-h-[247px] my-5 text-[16px] font-normal overflow-hidden">
                                {imgData[currentIndex].description.length > 400
                                    ? `${imgData[currentIndex].description.substring(0, 400)}...`
                                    : imgData[currentIndex].description}
                                </p>

                                {/* ✅ "See More" Button that links to a new page */}
                                <Link
                                to={`/events/${imgData[currentIndex].id}`}
                                className="p-2 text-[12px] text-blue-500 hover:underline border-[1px] border-[#028090] rounded-xl"
                                >
                                Read More
                                </Link>
                            </div>
                        </div>

                        {/* Circle Indicators */}
                        <div className="flex justify-center mt-4">
                            {imgData.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-3 h-3 mx-1 rounded-full transition-all ${
                                        currentIndex === index ? "bg-[#7D7D7D]" : "bg-[#9E88FD]"
                                    }`}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

