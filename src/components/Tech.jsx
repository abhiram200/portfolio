import React, { useEffect, useState } from "react";

import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

const Tech = () => {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
  }, []);

  return (
    <div className='flex flex-row flex-wrap justify-center gap-10'>
      {technologies.map((technology) => (
        <div className='w-28 h-28' key={technology.name} title={technology.name}>
          {!isAndroid ? (
            <BallCanvas icon={technology.icon} />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gray-500 rounded-full shadow-md'>
              <img
                src={technology.icon}
                alt={technology.name}
                className='w-16 h-16 object-contain'
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "");
