/* eslint-disable @next/next/no-img-element */
import React from "react";

const LatestDate = () => {
  // Create a new Date object with the desired date
  const latestDate = new Date("2024-05-29");

  // Format the date as "Month Day, Year"
  const formattedDate = latestDate.toLocaleDateString("en-US", {
    month: "long", // Full month name
    day: "numeric", // Day of the month
    year: "numeric", // Full year
  });

  return (

      <div>
        <div className="mt-32 text-lg font-medium text-center ">
          {formattedDate}
          <h1 className="mt-2 text-4xl font-semibold">Stay Inspired</h1>
        </div>
        <span className="flex items-center justify-center gap-6 mt-10">
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>Which one are you?</h1>
              <h1 className="px-10 text-2xl font-medium">
                Giving morning person & night owl vibes
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/0b/8e/f4/0b8ef447678aa897821187fb6ec46bc2.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>From your lens</h1>
              <h1 className="px-10 text-2xl font-medium">
                Capturing the best flight views
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/34/68/c6/3468c68947c5676acc5e365295bd1a2d.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>Funny actvities</h1>
              <h1 className="px-10 text-2xl font-medium">
                Crafts to feel creative
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/05/cf/f8/05cff8dcddc0980ec697c64caa9afbba.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
        </span>
        <span className="flex items-center justify-center gap-6 my-10">
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>Fun with cooking</h1>
              <h1 className="px-10 text-2xl font-medium">
                Noodles recipes for the chef in your
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/01/54/ec/0154ec176bcae42e7a08bf7ef1a1fd4e.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>Sporty vibe</h1>
              <h1 className="px-10 text-2xl font-medium">
                The most comfy & cool athleisure looks
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/d6/73/2d/d6732d658de9d2a23f01a29d30069cba.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-[444px] h-[333px] rounded-2xl bg-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/35"></div>
            <div className="absolute left-0 w-full font-medium text-center text-white bottom-4">
              <h1>Shine on</h1>
              <h1 className="px-10 text-2xl font-medium">
                The most comfy & cool athleisure looks
              </h1>
            </div>
            <img
              src="https://i.pinimg.com/736x/0a/8a/e5/0a8ae5fe7f86a1c69bf3dcbae309b998.jpg"
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
        </span>
      </div>
  );
};

export default LatestDate;
