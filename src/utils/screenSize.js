// match tailwind screensizes defined in tailwind.config.js -- any way to automate?
export default () => {
  const windowW = window.innerWidth,
    windowH = window.innerHeight,
    screens = {
      mobile: windowW < 640,
      sm: windowW >= 640 && windowW < 768,
      md: windowW >= 768 && windowW < 1024,
      lg: windowW >= 1024 && windowW < 1280,
      xl: windowW >= 1280 && windowW < 1536,
      "2xl": windowW >= 1536,
    },
    screenSize = Object.keys(screens).filter((val) => screens[val])[0];

  return {
    windowW: windowW,
    windowH: windowH,
    screens: screens,
    screenSize: screenSize,
  };
};

// export default () => {
//   const windowW = window.innerWidth,
//     windowH = window.innerHeight;

//   let isDesktop = windowW >= 1000,
//     isTablet = windowW >= 764 && windowW < 1000,
//     isMobile = windowW < 764;

//   return {
//     windowW: windowW,
//     windowH: windowH,
//     isDesktop: isDesktop,
//     isTablet: isTablet,
//     isMobile: isMobile,
//   };
// };
