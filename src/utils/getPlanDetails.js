import isPlanType from "./isPlanType";

export default function getPlanDetails(planData, age, term) {
  //Retirement Benefit Tier
  const hasRetirement = true;

  //Occupation(s) Covered by the Plan
  const hasOccupations = true;

  //Availability of Retirement Plan Options
  const hasPlanOptions = true;

  //Availability of Supplemental Retirement Savings Options
  const hasSavingsOptions = true;

  //Enrollment in Social Security
  const hasSocialSecurity = true;

  //Employee Contribution Rate
  const hasContributionRate = true;

  //Investment Management and Fees
  const hasManagementAndFees = isPlanType(planData, ["FAS", "GR", "Hybrid"]);

  //Default Investment Portfolio
  const hasInvestmentPortolio = isPlanType(planData, ["DC", "Hybrid"]);

  //Access to Guaranteed Lifetime Income Annuities Within the Plan
  const hasAnnuities = isPlanType(planData, ["DC", "Hybrid"]);

  return {
    retirement: hasRetirement,
    occupations: hasOccupations,
    planOptions: hasPlanOptions,
    savingsOptions: hasSavingsOptions,
    socialSecurity: hasSocialSecurity,
    contributionRate: hasContributionRate,
    managementAndFees: hasManagementAndFees,
    investmentPortfolio: hasInvestmentPortolio,
    annuities: hasAnnuities,
  };
}
