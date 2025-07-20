import React, { useEffect, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

const TooltipWrapper = ({ label, children }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-md z-50"
          side="top"
          sideOffset={6}
        >
          {label}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

const Tech = () => {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
  }, []);

  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((technology) => (
        <TooltipWrapper key={technology.name} label={technology.name}>
          <div className="w-28 h-28">
            {!isAndroid ? (
              <BallCanvas icon={technology.icon} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-500 rounded-full shadow-md">
                <img
                  src={technology.icon}
                  alt={technology.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
          </div>
        </TooltipWrapper>
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "");
