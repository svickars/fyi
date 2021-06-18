import random from "./random";
import randomPosNeg from "./randomPosNeg";

export function randomRotate(min, max, neg = true) {
  return `${neg ? randomPosNeg() : ""}rotate-${random(min, max)}`;
}
