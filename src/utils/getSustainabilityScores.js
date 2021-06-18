export default function getBenefitsScores(planData, age, term) {
  //Solvency: Is the Plan on a Path to Full Funding?
  const hasFullFunding = planData["Sustain_Total_Score"] != "N/A";
  let fullFundingScore = {
    applicable: hasFullFunding,
    score: planData["Fund_Path_Score"],
    scoreDenominator: planData["Fund_Path_Available"],
  };

  //Solvency: Are Government Employers Paying Their Bills?
  const hasPayingBills = planData["Sustain_Total_Score"] != "N/A";
  let payingBillsScore = {
    applicable: hasPayingBills,
    score: planData["Pay_Bill_Score"],
    scoreDenominator: planData["Pay_Bill_Available"],
  };

  //Management: Does the Retirement System Board Have Special Tools to Manage Through Tough Times?
  const hasRiskSharing = planData["Sustain_Total_Score"] != "N/A";
  let riskSharingScore = {
    applicable: hasRiskSharing,
    score: planData["Risk_Score"],
    scoreDenominator: planData["Risk_Available"],
  };

  //Management: Are the Plan’s Investments Earning What They Should?
  const hasInvestmentEarnings = planData["Sustain_Total_Score"] != "N/A";
  let investmentEarningsScore = {
    applicable: hasInvestmentEarnings,
    score: planData["Invest_Score"],
    scoreDenominator: planData["Invest_Available"],
  };

  return {
    fullFunding: fullFundingScore,
    payingBills: payingBillsScore,
    riskSharing: riskSharingScore,
    investmentEarnings: investmentEarningsScore,
  };
}
