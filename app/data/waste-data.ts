import type { WasteLog } from "../types";

export const initialWasteLogs: WasteLog[] = [
  {id:"w1",date:"2026-08-27",time:"15:20",ingredient:"Avocado",menuItemId:"guacamole",quantity:2.4,unit:"kg",unitCost:7.8,station:"Cold Station",employee:"Bhavik",reason:"Over-prep",note:"Batch exceeded forecast",provenance:"illustrative-demo"},
  {id:"w2",date:"2026-08-27",time:"18:10",ingredient:"Shrimp",menuItemId:"shrimp-ceviche",quantity:.8,unit:"kg",unitCost:19,station:"Cold Station",employee:"Sofia R.",reason:"Quality issue",note:"Texture outside demo standard",provenance:"illustrative-demo"},
  {id:"w3",date:"2026-08-26",time:"22:05",ingredient:"Corn tortillas",menuItemId:"beef-birria",quantity:18,unit:"each",unitCost:.22,station:"Fryer",employee:"Diego L.",reason:"Over-prep",note:"End-of-night surplus",provenance:"illustrative-demo"},
  {id:"w4",date:"2026-08-25",time:"16:45",ingredient:"Broccolini",menuItemId:"greens",quantity:1.1,unit:"kg",unitCost:8.5,station:"Grill",employee:"Nora P.",reason:"Spoilage",note:"Older prep container",provenance:"illustrative-demo"},
  {id:"w5",date:"2026-08-24",time:"19:30",ingredient:"Cornish chicken",menuItemId:"highway-chicken",quantity:1,unit:"each",unitCost:12.4,station:"Grill",employee:"Alex J.",reason:"Incorrect preparation",note:"Demo cook error",provenance:"illustrative-demo"},
  {id:"w6",date:"2026-08-23",time:"21:10",ingredient:"Potatoes",menuItemId:"potatoes-chorizo",quantity:1.6,unit:"kg",unitCost:2.9,station:"Fryer",employee:"Bhavik",reason:"Dropped/damaged",note:"Container dropped",provenance:"illustrative-demo"},
];

export const wasteCost = (log: WasteLog) => log.quantity * log.unitCost;
