export default function isPlanType(planData, planTypes) {
  return planTypes.indexOf(planData["Plan_Type"]) > -1;
}
