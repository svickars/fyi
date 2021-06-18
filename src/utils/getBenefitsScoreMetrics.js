import { getCopyId } from "../stores/currentSelections";

export default function getBenefitsScoreMetrics(copy, planData, age, term) {
  //Eligibility: Vesting
  const hasVesting = planData["Vesting_Score"] != "N/A" && term === "Short";
  let vestingMetrics = {
    applicable: hasVesting,
    metrics: [
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-vesting-years"),
        type: "years",
        years: planData["Vesting_Years"],
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-vesting-score"),
        type: "score",
        score: planData["Vesting_Score"],
        scoreDenominator: planData["Vesting_Available"],
      },
    ],
  };

  //Income Adequacy: Benefit Value
  const hasBenefitValue = term !== "Full";
  let benefitValueMetrics = {
    applicable: hasBenefitValue,
    metrics: [
      {
        title: getCopyId(copy, "benefits-score-detail-tile-benefit-line-title"),
        type: "line",
        copyStart: getCopyId(
          copy,
          "benefits-score-detail-tile-benefit-line-copy-start"
        ),
        copyEnd: getCopyId(
          copy,
          "benefits-score-detail-tile-benefit-line-copy-end"
        ),
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-benefit-score"),
        type: "score",
        score: planData[`${age}_${term}_Ben_Score`],
        scoreDenominator: planData[`${term}_Ben_Available`],
      },
    ],
  };

  //Income Adequacy: COLA Policy
  const hasColaPolicy = planData["COLA_Score"] != "N/A" && term !== "Short";
  let colaPolicyMetrics = {
    applicable: hasColaPolicy,
    metrics: [
      {
        copy: planData["COLA_Policy"],
        type: "icon",
        icon:
          planData["COLA_Policy"] === "No COLA"
            ? "times-Regular"
            : "check-Solid",
      },
      {
        copy: planData["COLA_Value"],
        type: "icon",
        icon:
          planData["COLA_Value"] === "No COLA"
            ? "times-Regular"
            : "check-Solid",
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-cola-score"),
        type: "score",
        score: planData["COLA_Score"],
        scoreDenominator: planData["COLA_Available"],
      },
    ],
  };

  //Flexibility & Mobility: Refunding Policy
  //THIS HAS SPECIFIC TEXT FOR DC PLAN
  const hasRefundingPolicy =
    planData["Refund_Score"] != "N/A" && term !== "Full";
  let refundingPolicyMetrics = {
    applicable: hasRefundingPolicy,
    metrics: [
      {
        copy: planData["Refund_Policy_Text"],
        type: "icon",
        icon: "check-Solid",
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-refunding-score"),
        type: "score",
        score: planData["Refund_Score"],
        scoreDenominator: planData["Refund_Score_Available"],
      },
    ],
  };

  //Flexibility & Mobility: Crediting Interest Rate
  const hasCreditingRate =
    planData["Credit_Rate_Score"] != "N/A" && term !== "Full";
  let creditingRateMetrics = {
    applicable: hasCreditingRate,
    metrics: [
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-crediting-interest"),
        type: "percent",
        percent: planData["Credit_Rate"],
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-crediting-inflation"),
        type: "percent",
        percent: planData["Assumed_Inflation"],
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-crediting-score"),
        type: "score",
        score: planData["Credit_Rate_Score"],
        scoreDenominator: planData["Credit_Rate_Available"],
      },
    ],
  };

  //Flexibility & Mobility: Minimum Guaranteed Return Rate
  const hasMinimumGuaranteedReturnRate =
    planData["MinGR_Score"] != "N/A" && term !== "Full";
  let minimumGuaranteedReturnRateMetrics = {
    applicable: hasMinimumGuaranteedReturnRate,
    metrics: [
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-guaranteed-minimum"),
        type: "percent",
        percent: planData["MinGR_Rate"],
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-guaranteed-assumed"),
        type: "percent",
        percent: planData["ARR"],
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-guaranteed-score"),
        type: "score",
        score: planData["MinGR_Score"],
        scoreDenominator: planData["Min_GR_Available"],
      },
    ],
  };

  //Income Adequacy: Replacement Rate at Retirement
  const hasReplacementRateAtRetirement = term === "Full";
  let replacementRateAtRetirementMetrics = {
    applicable: hasReplacementRateAtRetirement,
    metrics: [
      {
        title: getCopyId(
          copy,
          "benefits-score-detail-tile-replacement-line-title"
        ),
        type: "line",
        copyStart: getCopyId(
          copy,
          "benefits-score-detail-tile-replacement-line-copy-start"
        ),
      },
      {
        copy: getCopyId(copy, "benefits-score-detail-tile-replacement-score"),
        type: "score",
        score: planData[`${age}_Repl_Rate_Score`],
        scoreDenominator: planData[`Repl_Rate_Available`],
      },
    ],
  };

  return {
    vesting: vestingMetrics,
    benefitValue: benefitValueMetrics,
    colaPolicy: colaPolicyMetrics,
    refundingPolicy: refundingPolicyMetrics,
    creditingRate: creditingRateMetrics,
    minimumGuaranteedReturnRate: minimumGuaranteedReturnRateMetrics,
    replacementRateAtRetirement: replacementRateAtRetirementMetrics,
  };
}
