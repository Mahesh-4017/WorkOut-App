const compositions = require('@ifct2017/compositions');
const nutrients = require('@ifct2017/nutrients');

const PREPARATION_TERMS = new Set([
  'baked',
  'boiled',
  'cooked',
  'fried',
  'grilled',
  'roasted',
  'raw',
  'steamed',
  'smoked',
  'dried',
  'pickled',
  'curry',
  'masala',
  'soup',
  'stew',
  'sauce',
  'battered',
  'breaded',
]);
let compositionLoad;

function foodTerms(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

async function loadFoodCompositions() {
  compositionLoad ??= compositions.load();
  await compositionLoad;
}

function findFoodComposition(foodName) {
  const queryTerms = foodTerms(foodName);
  if (!queryTerms.length) return null;

  if (queryTerms.length === 1) {
    const matches = compositions(foodName);
    if (matches.length !== 1 || !foodTerms(matches[0].name).includes(queryTerms[0])) return null;
    return matches[0];
  }

  const queryTermSet = new Set(queryTerms);
  const queryPreparations = queryTerms.filter(term => PREPARATION_TERMS.has(term));
  const ranked = compositions(foodName)
    .slice(0, 20)
    .map(food => {
      const candidateTerms = new Set(foodTerms(food.name));
      if (queryPreparations.some(term => !candidateTerms.has(term))) return null;

      const sharedTerms = queryTerms.filter(term => candidateTerms.has(term));
      const coverage = sharedTerms.length / queryTermSet.size;
      if (coverage < 0.75) return null;

      const precision = sharedTerms.length / candidateTerms.size;
      return { food, score: coverage * 0.75 + precision * 0.25 };
    })
    .filter(Boolean)
    .sort((first, second) => second.score - first.score);

  if (!ranked.length || (ranked[1] && ranked[0].score - ranked[1].score < 0.08)) return null;
  return ranked[0].food;
}

function getIfctReference(foodName, grams) {
  const food = findFoodComposition(foodName);
  if (!food || grams <= 0) return null;

  const portionRatio = grams / 100;
  return {
    source: 'IFCT 2017',
    foodName: food.name,
    portionGrams: grams,
    protein: round(food.protcnt * portionRatio),
    carbs: round(food.choavldf * portionRatio),
    fat: round(food.fatce * portionRatio),
    kcal: Math.round((food.enerc / 4.184) * portionRatio),
  };
}

function getNutrientDescriptions() {
  return {
    protein: nutrients('Protein'),
    carbs: nutrients('Carbohydrate'),
    fat: nutrients('Total fat'),
  };
}

module.exports = { findFoodComposition, getIfctReference, getNutrientDescriptions, loadFoodCompositions };
