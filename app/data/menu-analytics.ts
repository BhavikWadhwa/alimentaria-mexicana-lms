import { publicMenu } from "./alimentaria-menu";
import type { MenuClassification, MenuItemAnalytics } from "../types";

const demoInputs = [
  [186,4.10,.42],[72,3.25,.18],[42,5.80,.64],[64,8.90,.75],[28,11.20,.58],[95,4.80,.21],[38,3.60,.12],[31,6.90,.46],[118,5.35,.24],[92,5.15,.22],[74,10.80,.35],[39,11.90,.72],[45,13.40,.30],[68,6.75,.26],[81,8.60,.31],[142,7.40,.28],[103,9.80,.19],[109,3.10,.11],
] as const;

const ingredientMap: Record<string,string[]> = {
  "beef-birria":["Beef","Tortillas","Onion","Cilantro","Consommé components"],
  guacamole:["Avocado","Corn chips","Feta","Pumpkin seeds","Lime"],
};

export const menuAnalytics: MenuItemAnalytics[] = publicMenu.map((item,index) => {
  const [unitsSold,foodCostPerPlate,allocatedWasteCost] = demoInputs[index];
  const contributionMargin = item.sellingPrice-foodCostPerPlate;
  const popularityScore = Math.round(unitsSold/1.86);
  const classification: MenuClassification = unitsSold >= 75 ? (contributionMargin >= 12 ? "star" : "plowhorse") : (contributionMargin >= 12 ? "puzzle" : "dog");
  const ingredients = ingredientMap[item.id] ?? item.description.split(",").slice(0,5).map(value=>value.trim());
  return {...item,unitsSold,foodCostPerPlate,allocatedWasteCost,revenue:item.sellingPrice*unitsSold,contributionMargin,foodCostPercent:foodCostPerPlate/item.sellingPrice*100,theoreticalFoodCost:foodCostPerPlate*unitsSold,wasteAdjustedFoodCost:foodCostPerPlate+allocatedWasteCost,adjustedContributionMargin:item.sellingPrice-foodCostPerPlate-allocatedWasteCost,popularityScore,classification,ingredientCosts:ingredients.map((ingredient,i)=>({ingredient,cost:Number((foodCostPerPlate*[.48,.18,.13,.11,.1][i]).toFixed(2))}))};
});

export const menuTotals = menuAnalytics.reduce((totals,item)=>({revenue:totals.revenue+item.revenue,cost:totals.cost+item.theoreticalFoodCost,waste:totals.waste+item.allocatedWasteCost*item.unitsSold,units:totals.units+item.unitsSold}),{revenue:0,cost:0,waste:0,units:0});
