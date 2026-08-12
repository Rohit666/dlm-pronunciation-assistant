/**
 * Articulation State Engine & SVG Path / Transform Interpolators
 */

// Keyframes define path shapes for morphing tongue states
export const TONGUE_PATHS = {
  neutral:
    "M 220,380 C 230,340 270,335 310,340 C 340,345 365,350 380,360 C 390,370 380,395 360,400 C 300,415 250,410 220,380 Z",
  between_teeth:
    "M 220,380 C 240,335 290,325 350,320 C 385,317 425,322 435,328 C 440,335 430,345 405,348 C 340,360 260,395 220,380 Z",
  alveolar:
    "M 220,380 C 240,330 280,310 340,300 C 370,295 388,272 392,278 C 396,285 375,325 340,345 C 280,375 240,390 220,380 Z",
  postalveolar:
    "M 220,380 C 240,320 270,295 320,282 C 355,272 375,282 378,295 C 375,310 340,335 310,350 C 260,375 235,390 220,380 Z",
  velar:
    "M 220,380 C 235,320 270,265 310,250 C 330,242 345,260 335,285 C 315,320 290,350 270,370 C 245,385 230,385 220,380 Z",
  high_front:
    "M 220,380 C 240,310 280,270 340,265 C 370,262 385,280 380,300 C 360,330 310,360 270,375 C 240,385 225,385 220,380 Z",
  high_back:
    "M 220,380 C 230,305 275,260 320,255 C 345,252 355,280 340,310 C 315,345 280,370 255,380 C 235,385 225,385 220,380 Z",
  low: "M 220,380 C 230,360 270,360 310,365 C 340,370 365,372 380,378 C 385,385 375,398 355,402 C 300,415 250,405 220,380 Z",
};

// Structural transform maps
export const JAW_TRANSFORMS = {
  closed: "rotate(0, 310, 410) translate(0, 0)",
  half: "rotate(3, 200, 450) translate(2, 6)",
  open: "rotate(7, 200, 450) translate(5, 15)",
};

export const LIP_TRANSFORMS = {
  upper: {
    closed: "translate(0, 4) scale(1, 1.1)",
    slightly_open: "translate(0, 0) scale(1, 1)",
    rounded: "translate(12, -2) scale(1.15, 0.9)",
    spread: "translate(-6, -2) scale(0.9, 0.9)",
  },
  lower: {
    closed: "translate(-2, -8) scale(1, 1.15)",
    slightly_open: "translate(0, 0) scale(1, 1)",
    rounded: "translate(14, 4) scale(1.15, 0.9)",
    spread: "translate(-6, 2) scale(0.9, 0.9)",
  },
};

export const VELUM_TRANSFORMS = {
  raised: "rotate(0, 275, 225)",
  lowered: "rotate(18, 275, 225)",
};

// Utility to parse numeric sequence out of SVG path string for linear interpolation
function parsePathNumbers(pathStr) {
  return pathStr.match(/-?\d+(?:\.\d+)?/g).map(Number);
}

// Reconstruct path string with target template
function createPathFromNumbers(templateStr, numbers) {
  let i = 0;
  return templateStr.replace(/-?\d+(?:\.\d+)?/g, () => numbers[i++].toFixed(2));
}

// Cubic lerp helper
export function interpolatePath(pathA, pathB, progress) {
  const numsA = parsePathNumbers(pathA);
  const numsB = parsePathNumbers(pathB);
  if (numsA.length !== numsB.length) return pathB;
  const interpolatedNums = numsA.map(
    (a, idx) => a + (numsB[idx] - a) * progress,
  );
  return createPathFromNumbers(pathA, interpolatedNums);
}
