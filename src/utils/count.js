export default (arr, accessor, val) => {
  if (accessor) arr = arr.filter((d) => d[accessor] === val);

  return arr.length;
};
