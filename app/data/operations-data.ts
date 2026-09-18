import type { Equipment, EquipmentIssue, EquipmentTrainingLink, HandoffNote, MaintenanceRecord, OperationsState, PrepTask } from "../types";

export const operationsContext = { restaurantId:"restaurant-casa-mercado", locationId:"vancouver-main", date:"2026-09-01", previousDate:"2026-08-31", tomorrowDate:"2026-09-02" };

export const equipment: Equipment[] = [
  ["walkin-1","EQ-COOL-001","Walk-in Cooler #1","Cold Storage","True","T-Series","TR-44201","Back Hall","2023-03-12","Operational","2026-07-18","2026-10-18","Pacific Food Equipment","Maya Singh","2028-03-12","Primary produce and dairy cooler"],
  ["walkin-2","EQ-COOL-002","Walk-in Cooler #2","Cold Storage","True","T-Series","TR-44202","Back Hall","2023-03-12","Attention Required","2026-08-02","2026-09-02","Pacific Food Equipment","Unassigned","2028-03-12","Monitor temperature until service"],
  ["rational-oven","EQ-OVEN-001","Rational Combi Oven #1","Cooking","Rational","iCombi Pro","RA-91182","Hot Line","2024-01-17","Operational","2026-08-04","2026-11-04","ABC Restaurant Equipment","Mike Chen","2027-01-17","Main hot-line combi oven"],
  ["fryer-1","EQ-FRY-001","Fryer #1","Cooking","Pitco","SG14","PT-31004","Fryer Station","2022-11-20","Operational","2026-07-11","2026-10-11","ABC Restaurant Equipment","Mike Chen","Expired","Left fryer bank"],
  ["fryer-2","EQ-FRY-002","Fryer #2","Cooking","Pitco","SG14","PT-31005","Fryer Station","2022-11-20","Attention Required","2026-07-11","2026-09-03","ABC Restaurant Equipment","Unassigned","Expired","Small leak reported at closing"],
  ["dishwasher","EQ-DISH-001","Dishwasher","Warewashing","Hobart","AM16","HB-77503","Dish Pit","2024-05-08","Operational","2026-08-12","2026-11-12","Pacific Food Equipment","Maya Singh","2027-05-08","High-temperature unit"],
  ["ice-machine","EQ-ICE-001","Ice Machine","Beverage","Manitowoc","Indigo NXT","MN-55291","Service Bar","2023-09-10","Operational","2026-08-20","2026-11-20","Coastal Refrigeration","Sam Lee","2026-09-10","Monthly sanitation checklist linked"],
  ["blender-1","EQ-BLEND-001","Blender #1","Prep","Vitamix","Vita-Prep 3","VM-13021","Cold Station","2025-02-14","Operational","2026-06-18","2026-09-18","In-house","Martin","2028-02-14","Primary salsa blender"],
  ["blender-2","EQ-BLEND-002","Blender #2","Prep","Vitamix","Vita-Prep 3","VM-13022","Cold Station","2025-02-14","Attention Required","2026-06-18","2026-09-04","In-house","Martin","2028-02-14","Unusual bearing noise"],
  ["range","EQ-RANGE-001","Six-burner Range","Cooking","Garland","G36","GA-81220","Hot Line","2021-06-01","Operational","2026-05-26","2026-11-26","ABC Restaurant Equipment","Mike Chen","Expired","Gas line inspected annually"],
  ["prep-fridge","EQ-PREP-001","Prep Refrigerator","Cold Storage","True","TUC-48","TR-90214","Cold Station","2024-08-22","Operational","2026-08-22","2026-11-22","Coastal Refrigeration","Sam Lee","2027-08-22","Cold-station undercounter unit"],
  ["vacuum-sealer","EQ-PREP-002","Vacuum Sealer","Prep","Henkelman","Boxer 42","HK-21098","Prep Area","2025-04-06","Under Repair","2026-08-29","2026-09-05","Pacific Food Equipment","Maya Singh","2027-04-06","Seal bar replacement ordered"],
].map(([id,assetCode,name,category,brand,model,serialNumber,station,installedDate,status,lastServicedDate,nextServiceDate,serviceCompany,technician,warrantyExpiration,notes])=>({id,restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,assetCode,name,category,brand,model,serialNumber,station,installedDate,status,lastServicedDate,nextServiceDate,serviceCompany,technician,warrantyExpiration,notes,qrIdentifier:`baysics:${assetCode}`})) as Equipment[];

export const equipmentTrainingLinks: EquipmentTrainingLink[] = [
  {id:"etl1",equipmentId:"rational-oven",trainingModuleId:"grill-station",relationshipType:"operation"},{id:"etl2",equipmentId:"rational-oven",trainingModuleId:"safety",relationshipType:"safety"},{id:"etl3",equipmentId:"fryer-1",trainingModuleId:"fryer-station",relationshipType:"operation"},{id:"etl4",equipmentId:"fryer-2",trainingModuleId:"fryer-station",relationshipType:"operation"},{id:"etl5",equipmentId:"walkin-1",trainingModuleId:"safety",relationshipType:"safety"},{id:"etl6",equipmentId:"walkin-2",trainingModuleId:"safety",relationshipType:"safety"},{id:"etl7",equipmentId:"blender-1",trainingModuleId:"prep",relationshipType:"operation"},{id:"etl8",equipmentId:"blender-2",trainingModuleId:"prep",relationshipType:"troubleshooting"},{id:"etl9",equipmentId:"dishwasher",trainingModuleId:"safety",relationshipType:"cleaning"},{id:"etl10",equipmentId:"prep-fridge",trainingModuleId:"cold-station",relationshipType:"operation"},
];

export const initialEquipmentIssues: EquipmentIssue[] = [
  {id:"issue-cooler",equipmentId:"walkin-2",type:"Temperature issue",priority:"Critical",description:"Temperature reading reported at 9°C during opening check.",reportedByEmployeeId:"nina",reportedAt:"2026-09-01T08:14:00",resolved:false},
  {id:"issue-fryer",equipmentId:"fryer-2",type:"Leak",priority:"High",description:"Small leak visible beneath the drain assembly.",reportedByEmployeeId:"leo",reportedAt:"2026-08-31T22:18:00",resolved:false,linkedHandoffId:"handoff-fryer"},
  {id:"issue-blender",equipmentId:"blender-2",type:"Unusual sound",priority:"Normal",description:"Bearing noise increases at high speed.",reportedByEmployeeId:"bhavik",reportedAt:"2026-08-31T17:42:00",resolved:false},
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  {id:"mr1",equipmentId:"rational-oven",date:"2026-08-04",type:"Preventive service",technician:"Mike Chen",company:"ABC Restaurant Equipment",cost:285,notes:"Cleaned burner assembly and inspected seals."},{id:"mr2",equipmentId:"rational-oven",date:"2026-05-17",type:"Temperature issue",technician:"Mike Chen",company:"ABC Restaurant Equipment",cost:680,notes:"Replaced temperature sensor."},{id:"mr3",equipmentId:"rational-oven",date:"2026-02-01",type:"Routine inspection",technician:"Mike Chen",company:"ABC Restaurant Equipment",cost:180,notes:"Inspection completed; no repairs required."},{id:"mr4",equipmentId:"rational-oven",date:"2025-10-12",type:"Door seal replacement",technician:"A. Torres",company:"ABC Restaurant Equipment",cost:410,notes:"Replaced worn door seal."},{id:"mr5",equipmentId:"walkin-2",date:"2026-08-02",type:"Preventive service",technician:"Sam Lee",company:"Coastal Refrigeration",cost:320,notes:"Coils cleaned and temperature calibration checked."},{id:"mr6",equipmentId:"dishwasher",date:"2026-08-12",type:"Routine service",technician:"Maya Singh",company:"Pacific Food Equipment",cost:240,notes:"Descaled wash system and checked booster."},{id:"mr7",equipmentId:"fryer-2",date:"2026-07-11",type:"Annual service",technician:"Mike Chen",company:"ABC Restaurant Equipment",cost:265,notes:"Inspected burners and drain assembly."},
];

const prepSeeds = [
  ["guacamole","Guacamole","Cold Station",12,4,"containers","bhavik","High","In Progress","Large reservation tonight.","guacamole","cold-station"],
  ["salsa-roja","Salsa Roja","Cold Station",10,6,"containers","nina","Important","In Progress","Prioritize before lunch.","salsa","prep"],
  ["salsa-verde","Salsa Verde","Cold Station",9,2,"containers","nina","High","Not Started","Party of 35 tomorrow.","salsa","prep"],
  ["onions","Pickled Onions","Cold Station",8,5,"containers","bhavik","Normal","Not Started","","vegetables","prep"],
  ["birria","Birria","Hot Line",6,4,"hotel pans","leo","Important","In Progress","Confirm cooling labels.",undefined,"grill-station"],
  ["pico","Pico de Gallo","Cold Station",10,10,"containers","bhavik","Normal","Complete","Completed opening batch.","vegetables","cold-station"],
  ["tortillas","Tortillas","Fryer",18,12,"packs","leo","Normal","In Progress","","chips","fryer-station"],
  ["rice","Rice","Hot Line",7,7,"hotel pans","jonas","Normal","Complete","","storage","prep"],
  ["beans","Beans","Hot Line",7,3,"hotel pans","jonas","High","Not Started","Soak started at close.","storage","prep"],
  ["chips","Tortilla Chips","Fryer",14,9,"bins","leo","Important","In Progress","","chips","fryer-station"],
  ["crema","Crema","Cold Station",6,6,"bottles","bhavik","Normal","Complete","","storage","cold-station"],
  ["macha","Salsa Macha","Cold Station",5,2,"containers","nina","Normal","Not Started","","salsa","prep"],
  ["carrots","Roasted Carrots","Hot Line",5,1,"hotel pans","jonas","High","Not Started","Bavette prep.","vegetables","grill-station"],
  ["chicken","Highway Chicken","Hot Line",24,18,"portions","jonas","Important","In Progress","Six more portions needed.",undefined,"grill-station"],
  ["shrimp","Ceviche Shrimp","Cold Station",30,26,"portions","bhavik","Normal","Not Started","","storage","cold-station"],
  ["beets","Golden Beets","Cold Station",20,20,"portions","nina","Normal","Complete","","vegetables","cold-station"],
  ["potatoes","Fingerling Potatoes","Hot Line",18,8,"portions","leo","High","In Progress","","vegetables","prep"],
  ["consomme","Birria Consommé","Hot Line",8,5,"litres","jonas","Important","Not Started","","storage","grill-station"],
  ["churro","Churro Dough","Dessert",8,8,"bags","nina","Normal","Complete","","storage","prep"],
  ["labels","Closing Labels","All Stations",40,40,"labels","bhavik","Normal","Complete","Restocked.","storage","safety"],
] as const;

export const initialPrepTasks: PrepTask[] = prepSeeds.map(([id,itemName,category,targetPar,currentQuantity,unit,assignedEmployeeId,priority,status,notes,linkedSopId,linkedTrainingModuleId])=>({id:`prep-${id}`,restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,date:operationsContext.date,itemName,category,targetPar,currentQuantity,requiredQuantity:Math.max(0,targetPar-currentQuantity),unit,assignedEmployeeId,priority,status,notes,createdByEmployeeId:"bhavik",createdAt:"2026-09-01T07:30:00",completedAt:status==="Complete"?"2026-09-01T09:00:00":undefined,linkedSopId,linkedTrainingModuleId})) as PrepTask[];

export const initialHandoffNotes: HandoffNote[] = [
  {id:"handoff-cilantro",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Cilantro missing from delivery",description:"Produce delivery was short one case. Credit requested.",category:"Supplier / Delivery",priority:"Important",shift:"Closing",createdByEmployeeId:"leo",createdAt:"2026-08-31T22:05:00",resolved:false,acknowledged:false},
  {id:"handoff-fryer",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Fryer #2 leaking",description:"Small leak beneath drain assembly. Do not move unit.",category:"Equipment",priority:"Critical",shift:"Closing",createdByEmployeeId:"leo",createdAt:"2026-08-31T22:18:00",resolved:false,acknowledged:true,linkedEquipmentId:"fryer-2"},
  {id:"handoff-salsa",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Extra salsa verde tomorrow",description:"Prepare extra for the 35-person reservation.",category:"Prep",priority:"Important",shift:"Closing",createdByEmployeeId:"nina",createdAt:"2026-08-31T22:24:00",resolved:false,acknowledged:false},
  {id:"handoff-salmon",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Salmon running low",description:"Approximately eight portions remain.",category:"Inventory / Stock",priority:"Important",shift:"Closing",createdByEmployeeId:"bhavik",createdAt:"2026-08-31T21:40:00",resolved:false,acknowledged:false},
  {id:"handoff-party",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Party of 35 at 7 PM",description:"Family-style menu; confirm cold-station par levels.",category:"Reservation / Event",priority:"High",shift:"Closing",createdByEmployeeId:"bhavik",createdAt:"2026-08-31T21:15:00",resolved:false,acknowledged:true},
  {id:"handoff-blender",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Blender #2 unusual noise",description:"Use Blender #1 until reviewed.",category:"Equipment",priority:"Normal",shift:"Day",createdByEmployeeId:"bhavik",createdAt:"2026-08-31T17:40:00",resolved:false,acknowledged:false,linkedEquipmentId:"blender-2"},
  {id:"handoff-callout",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Dish shift coverage",description:"Owen confirmed coverage for tonight.",category:"Staffing",priority:"Normal",shift:"Closing",createdByEmployeeId:"leo",createdAt:"2026-08-30T22:10:00",resolved:true,acknowledged:true,resolutionNote:"Coverage confirmed",resolvedByEmployeeId:"bhavik",resolvedAt:"2026-08-31T08:00:00"},
  {id:"handoff-labels",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Label roll replaced",description:"New roll installed at cold station.",category:"General",priority:"Normal",shift:"Closing",createdByEmployeeId:"nina",createdAt:"2026-08-30T21:48:00",resolved:true,acknowledged:true,resolutionNote:"Completed",resolvedByEmployeeId:"bhavik",resolvedAt:"2026-08-31T07:45:00"},
  {id:"handoff-avocado",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Avocados ripening quickly",description:"Use older case first during opening prep.",category:"Inventory / Stock",priority:"Important",shift:"Closing",createdByEmployeeId:"nina",createdAt:"2026-08-30T21:32:00",resolved:true,acknowledged:true,resolutionNote:"Moved to front prep shelf",resolvedByEmployeeId:"bhavik",resolvedAt:"2026-08-31T08:20:00"},
  {id:"handoff-cleaning",restaurantId:operationsContext.restaurantId,locationId:operationsContext.locationId,title:"Oven deep clean complete",description:"Cleaning cycle and seal inspection completed.",category:"Equipment",priority:"Normal",shift:"Closing",createdByEmployeeId:"jonas",createdAt:"2026-08-29T22:14:00",resolved:true,acknowledged:true,linkedEquipmentId:"rational-oven",resolutionNote:"Manager verified",resolvedByEmployeeId:"bhavik",resolvedAt:"2026-08-30T07:40:00"},
];

export const initialOperationsState: OperationsState = {prepTasks:initialPrepTasks,handoffNotes:initialHandoffNotes,equipmentIssues:initialEquipmentIssues,maintenanceRecords:initialMaintenanceRecords};
