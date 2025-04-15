import React, { useContext } from "react";
import { ThemeContext } from "./ThemeProvider"; 




// this is the file which is used to manage the dark mode buttons settings .. means which color for which button .. we just need to 
// import this in any other file and then wrap that file inside <YourPageWrapper>  </YourPageWrapper>

const YourPageWrapper = ({ children }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
    className={`min-h-screen p-6 ${
        theme === "original"
          ? "bg-gradient-to-br from-[#232526] to-[#414345] text-white"
          : theme === "light"
          ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-900"
          : "bg-gradient-to-br from-[#141414] to-[#212121] text-white"
      }`}
    >
      {children}
    </div>
  );
};

export default YourPageWrapper;
