export default function getBenefitsScores(planData, age, term) {
  //Eligibility
  const hasEligibility = term === "Short";
  let eligibilityScore = {
    applicable: hasEligibility,
    score: planData["Vesting_Score"],
    scoreDenominator: planData["Vesting_Available"],
  };

  //Benefit Adequacy
  const hasBenefitAdequacy = true;
  let benefitAdequacyScore = {
    applicable: hasBenefitAdequacy,
    score: planData[`${age}_${term}_Ben_Total_Score`],
    scoreDenominator: planData[`${term}_Ben_Total_Available`],
  };

  //Flexibility
  const hasFlexibility = term !== "Full";
  let flexibilityScore = {
    applicable: hasFlexibility,
    score: planData["Flex_Total_Score"],
    scoreDenominator: planData["Flex_Total_Available"],
  };

  return {
    elibility: eligibilityScore,
    benefitAdequacy: benefitAdequacyScore,
    flexibility: flexibilityScore,
  };
}
