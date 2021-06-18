export default (str) => {
  let middle = Math.floor(str.length / 2),
    before = str.lastIndexOf(" ", middle),
    after = str.indexOf(" ", middle + 1);

  if (middle - before < after - middle || after < 0) middle = before;
  else middle = after;

  let s1 = str.substr(0, middle),
    s2 = str.substr(middle + 1);

  return [s1, s2];
};
