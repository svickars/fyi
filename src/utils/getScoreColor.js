export default function getScoreColor(score, scoreDenominator) {
  if (score / scoreDenominator <= 1 / 3) return "yellow";
  else if (score / scoreDenominator <= 2 / 3) return "blue-light";
  else return "mint";
}
