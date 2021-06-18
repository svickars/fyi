import { getCopyId } from "../stores/currentSelections.js";

export default function getSustainabilityScoreMetrics(
  copy,
  planData,
  age,
  term
) {
  //Solvency: Is the Plan on a Path to Full Funding?
  const hasFullFunding = planData["Sustain_Total_Score"] != "N/A";
  let fullFundingMetrics = {
    applicable: hasFullFunding,
    metrics: [
      {
        copy: getCopyId(
          copy,
          "sustainability-score-detail-tile-funding-amortization"
        ),
        type: "years",
        years: planData["Amo_Period"],
      },
      {
        copy: getCopyId(
          copy,
          "sustainability-score-detail-tile-funding-funded"
        ),
        type: "percent",
        percent: planData["Funded_Ratio"],
      },
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-funding-score"),
        type: "score",
        score: planData["Fund_Path_Score"],
        scoreDenominator: planData["Fund_Path_Available"],
      },
    ],
  };

  //Solvency: Are Government Employers Paying Their Bills?
  const hasPayingBills = planData["Sustain_Total_Score"] != "N/A";
  let payingBillsMetrics = {
    applicable: hasPayingBills,
    metrics: [
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-bills-fully"),
        type: "years",
        years: planData["Bill_Full_Pay"],
        past: 10,
      },
      {
        copy: getCopyId(
          copy,
          "sustainability-score-detail-tile-bills-overpaid"
        ),
        type: "years",
        years: planData["Bill_Overpay"],
        past: 10,
      },
      {
        copy: getCopyId(
          copy,
          "sustainability-score-detail-tile-bills-underpaid"
        ),
        type: "years",
        years: planData["Bill_Underpay"],
        past: 10,
      },
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-bills-score"),
        type: "score",
        score: planData["Pay_Bill_Score"],
        scoreDenominator: planData["Pay_Bill_Available"],
      },
    ],
  };

  //Management: Does the Retirement System Board Have Special Tools to Manage Through Tough Times?
  const hasRiskSharing = planData["Sustain_Total_Score"] != "N/A";
  let riskSharingMetrics = {
    applicable: hasRiskSharing,
    metrics: [
      {
        copy: planData["Risk_Status"],
        type: "icon",
        icon:
          planData["Risk_Status"] === "Plan does not have risk-sharing tools"
            ? "times-Regular"
            : "check-Solid",
      },
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-risk-score"),
        type: "score",
        score: planData["Risk_Score"],
        scoreDenominator: planData["Risk_Available"],
      },
    ],
  };

  //Management: Are the Plan’s Investments Earning What They Should?
  const hasInvestmentEarnings = planData["Sustain_Total_Score"] != "N/A";
  let investmentEarningsMetrics = {
    applicable: hasInvestmentEarnings,
    metrics: [
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-earnings-good"),
        type: "years",
        years: planData["Good_Invest"],
        past: 10,
      },
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-earnings-bad"),
        type: "years",
        years: planData["Bad_Invest"],
        past: 10,
      },
      {
        copy: getCopyId(copy, "sustainability-score-detail-tile-earnings-arr"),
        type: "percent",
        percent: planData["ARR"],
      },
      {
        copy: getCopyId(
          copy,
          "sustainability-score-detail-tile-earnings-score"
        ),
        type: "score",
        score: planData["Invest_Score"],
        scoreDenominator: planData["Invest_Available"],
      },
    ],
  };

  return {
    fullFunding: fullFundingMetrics,
    payingBills: payingBillsMetrics,
    riskSharing: riskSharingMetrics,
    investmentEarnings: investmentEarningsMetrics,
  };
}
