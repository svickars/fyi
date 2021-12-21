export default (scrollId) =>
  document.getElementById(scrollId).scrollIntoView({
    behavior: "smooth",
  });
