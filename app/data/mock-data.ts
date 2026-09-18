import { brand } from "../config/brand";
import type { Certificate, ChecklistTemplate, Employee, Lesson, ManagerActivity, QuizQuestion, Recipe, TrainingModule } from "../types";

export const restaurant = { name: brand.restaurantName, code: brand.restaurantCode, location: "Vancouver Demo Location", cuisine: "Modern Mexican" };

export const trainingModules: TrainingModule[] = [
  { id:"orientation",title:"Restaurant Orientation",microLabel:"Bienvenido",category:"Orientation",lessons:5,completedLessons:5,duration:24,progress:100,status:"completed",image:brand.images.login },
  { id:"safety",title:"Kitchen Safety",microLabel:"Seguridad",category:"Safety",lessons:6,completedLessons:6,duration:32,progress:100,status:"completed",image:brand.images.pathway },
  { id:"menu",title:"Menu Knowledge",microLabel:"El menú",category:"Menu",lessons:7,completedLessons:7,duration:35,progress:100,status:"completed",image:brand.images.learning },
  { id:"prep",title:"Food Preparation Basics",microLabel:"Preparación",category:"Prep",lessons:6,completedLessons:6,duration:30,progress:100,status:"completed",image:brand.images.vegetables },
  { id:"cold-station",title:"Cold Station Fundamentals",microLabel:"Estación fría",category:"Cold Station",lessons:8,completedLessons:5,duration:42,progress:65,status:"in-progress",image:brand.images.coldStation },
  { id:"fryer-station",title:"Fryer Station",microLabel:"Freidora",category:"Fryer",lessons:8,completedLessons:2,duration:46,progress:25,status:"in-progress",image:brand.images.fryer },
  { id:"grill-station",title:"Grill Station",microLabel:"Parrilla",category:"Grill",lessons:9,completedLessons:0,duration:52,progress:0,status:"locked",image:brand.images.grill },
];

export const fryerLesson: Lesson = {
  id:"chips-and-tortillas",moduleId:"fryer-station",title:"Fryer Station: Chips and Tortillas",lessonNumber:3,duration:8,
  summary:"A visual introduction to the station flow, tools, communication, and quality checks used in this fictional restaurant demo.",
  outcomes:["Identify the station setup and required tools","Describe the demonstration workflow in the correct order","Recognize common quality and safety checks","Use shared English and Spanish station terms"],
  equipment:["Demonstration fryer","Heat-safe tongs","Labeled storage container","Timer","Protective apron"],
  steps:["Confirm the station checklist and manager sign-off are complete.","Review the fictional batch reference and communicate with the station lead.","Use the illustrated loading sequence shown in the training video.","Complete the visual quality check and record the demonstration batch.","Transfer the product to the labeled demo container and reset the station."],
  mistakes:["Skipping the pre-shift station check","Overloading the demonstration basket","Using an unlabeled storage container","Forgetting to communicate a batch delay"],
};

export const quizQuestions: QuizQuestion[] = [
  { id:"q1",type:"multiple",prompt:"What should happen before beginning a demonstration batch?",options:["Confirm the station checklist","Turn off the timer","Fill every storage container","Skip to the quality check"],answer:"Confirm the station checklist",explanation:"The station checklist establishes that the workspace, tools, and sign-offs are ready." },
  { id:"q2",type:"boolean",prompt:"True or false: unlabeled containers are acceptable during a busy service.",options:["True","False"],answer:"False",explanation:"Every demo storage container should be clearly labeled according to the restaurant’s actual policy." },
  { id:"q3",type:"image",prompt:"Which placeholder best represents the correct tool for handling a hot fryer basket?",options:["Heat-safe tongs","Bare hands","Dining fork","Paper towel"],answer:"Heat-safe tongs",explanation:"The training flow calls for an approved heat-safe handling tool." },
  { id:"q4",type:"sequence",prompt:"Which sequence best matches the demonstration workflow?",options:["Check → prepare → quality check → label","Prepare → label → check → serve","Serve → check → prepare → label","Label → serve → prepare → check"],answer:"Check → prepare → quality check → label",explanation:"Readiness comes first, followed by preparation, quality review, and correct storage." },
  { id:"q5",type:"multiple",prompt:"What should you do when a batch is delayed?",options:["Communicate with the station lead","Hide the timer","Ignore the delay","Leave the station"],answer:"Communicate with the station lead",explanation:"Clear communication helps the whole kitchen respond consistently." },
];

export const recipes: Recipe[] = [
  { id:"guacamole",name:"Guacamole Preparation",spanishName:"Preparación de guacamole",station:"Cold Station",time:"12 min",difficulty:"Easy",allergens:[],status:"Completed",image:brand.images.guacamole,ingredients:["Demo avocados","Demo lime","Demo herbs","Demonstration seasoning"],equipment:["Mixing bowl","Chef spoon","Color-coded board"],method:["Complete the station readiness check.","Prepare the fictional ingredients shown in the visual guide.","Combine gently and compare with the demo quality card.","Transfer to a labeled demonstration container."],portion:"Demo portion: one training container",quality:"Bright colour, visible texture, clean edges.",storage:"Follow the restaurant’s approved storage and labeling policy.",notes:"Manager should review texture and station organization during practical sign-off." },
  { id:"salsa",name:"Salsa Preparation",spanishName:"Preparación de salsa",station:"Cold Station",time:"18 min",difficulty:"Medium",allergens:[],status:"In review",image:brand.images.salsa,ingredients:["Demo tomatoes","Demo aromatics","Demo citrus","Demonstration seasoning"],equipment:["Blender placeholder","Ladle","Labeled container"],method:["Review the demo recipe card.","Prepare the visual ingredient set.","Follow the fictional blend sequence.","Complete the colour and texture check."],portion:"Demo yield: one training batch",quality:"Consistent colour and texture shown in the reference image.",storage:"Use the fictional use-by label only for this demo.",notes:"Confirm actual operating recipe with a manager." },
  { id:"chips",name:"Tortilla Chips",spanishName:"Totopos",station:"Fryer",time:"8 min",difficulty:"Medium",allergens:["Shared equipment"],status:"Learning",image:brand.images.chips,ingredients:["Demo tortilla pieces","Demonstration seasoning"],equipment:["Fryer placeholder","Heat-safe tongs","Timer"],method:fryerLesson.steps,portion:"Demo batch only",quality:"Even visual colour, consistent shape, no excess residue.",storage:"Transfer to a clean, labeled demo container.",notes:"All temperatures and timings must come from the restaurant’s approved SOP." },
  { id:"vegetables",name:"Vegetable Preparation",spanishName:"Preparación de verduras",station:"Prep",time:"20 min",difficulty:"Easy",allergens:[],status:"Completed",image:brand.images.vegetables,ingredients:["Demo vegetables","Training labels"],equipment:["Color-coded board","Knife placeholder","Storage pans"],method:["Wash hands and review the prep list.","Match vegetables to the visual cut guide.","Complete the quality check.","Label each demo container."],portion:"Based on fictional prep list",quality:"Consistent cuts with clean, organized storage.",storage:"Use actual restaurant policy during live operations.",notes:"Practical knife skills require in-person supervision." },
  { id:"storage",name:"Closing Prep Storage",spanishName:"Almacenamiento al cierre",station:"Closing",time:"15 min",difficulty:"Easy",allergens:["Varies"],status:"Not started",image:brand.images.storage,ingredients:["Training labels","Demo storage containers"],equipment:["Sanitizer placeholder","Labels","Closing checklist"],method:["Review all open demo containers.","Complete the visual quality check.","Apply the fictional training labels.","Confirm manager sign-off placeholder."],portion:"Not applicable",quality:"Clean, labeled, organized storage areas.",storage:"Always follow the restaurant’s current food-safety plan.",notes:"This guide is demonstration content, not an operating procedure." },
];

export const checklists: ChecklistTemplate[] = [
  { id:"cold-open",title:"Opening the Cold Station",microLabel:"Abrir estación",items:["Review prep and reservation notes","Confirm handwashing and PPE setup","Check demo labels and containers","Organize tools using the station map"] },
  { id:"fryer-setup",title:"Fryer Setup",microLabel:"Preparar freidora",items:["Review practical sign-off status","Inspect demonstration tools","Confirm timer and labels","Notify station lead when ready"] },
  { id:"pre-shift",title:"Pre-Shift Safety",microLabel:"Seguridad",items:["Check footwear and uniform","Review allergy communication process","Locate emergency equipment","Confirm today’s manager"] },
  { id:"closing",title:"Closing and Cleaning",microLabel:"Cerrar y limpiar",items:["Complete station count","Move demo products to labeled storage","Follow cleaning sequence","Request manager review"] },
  { id:"storage-labels",title:"Food Storage and Labelling",microLabel:"Etiquetas",items:["Use approved container type","Add product name","Add fictional demo date","Place container in mapped location"] },
];

export const certificates: Certificate[] = [
  { id:"orientation",title:"Restaurant Orientation",earned:true,date:"July 18, 2026" },
  { id:"safety",title:"Kitchen Safety",earned:true,date:"July 20, 2026" },
  { id:"cold",title:"Cold Station Ready",earned:false },
  { id:"fryer",title:"Fryer Station Ready",earned:false },
  { id:"grill",title:"Grill Station Ready",earned:false },
];

export const employees: Employee[] = [
  { id:"bhavik",name:brand.demoEmployee.name,initials:brand.demoEmployee.initials,role:brand.demoEmployee.role,station:"Cold Station",startDate:"Jul 14, 2026",pathway:"Kitchen Core",progress:68,quizAverage:88,lastActive:"12 min ago",status:"On track" },
  { id:"nina",name:"Nina Patel",initials:"NP",role:"Prep Cook",station:"Prep",startDate:"Jul 21, 2026",pathway:"Prep Foundations",progress:42,quizAverage:76,lastActive:"1 hr ago",status:"Needs attention" },
  { id:"leo",name:"Leo Martinez",initials:"LM",role:"Line Cook",station:"Fryer",startDate:"Jul 7, 2026",pathway:"Kitchen Core",progress:91,quizAverage:94,lastActive:"Today",status:"Ready for sign-off" },
  { id:"maya",name:"Maya Chen",initials:"MC",role:"Server",station:"Front of House",startDate:"Jul 28, 2026",pathway:"Service Essentials",progress:25,quizAverage:82,lastActive:"Yesterday",status:"On track" },
  { id:"jonas",name:"Jonas Reed",initials:"JR",role:"Line Cook",station:"Grill",startDate:"Jun 30, 2026",pathway:"Kitchen Core",progress:57,quizAverage:69,lastActive:"3 days ago",status:"Needs attention" },
  { id:"amira",name:"Amira Hassan",initials:"AH",role:"Host",station:"Front of House",startDate:"Jul 12, 2026",pathway:"Guest Welcome",progress:100,quizAverage:96,lastActive:"Today",status:"Ready for sign-off" },
];

export const managerActivity: ManagerActivity[] = [
  { id:"a1",person:"Leo Martinez",action:"passed Fryer Safety Quiz with 94%",time:"18 minutes ago" },
  { id:"a2",person:"Nina Patel",action:"completed Vegetable Preparation",time:"1 hour ago" },
  { id:"a3",person:brand.demoEmployee.name,action:"checked 3 pre-shift items",time:"2 hours ago" },
  { id:"a4",person:"Amira Hassan",action:"became ready for practical sign-off",time:"Yesterday" },
];

export const completionChart = [
  { week:"W1",completion:34 },{ week:"W2",completion:46 },{ week:"W3",completion:59 },{ week:"W4",completion:68 },{ week:"W5",completion:78 },
];

export const terminology = [["Fryer","Freidora"],["Chips","Totopos"],["Tongs","Pinzas"],["Cutting board","Tabla de cortar"],["Storage container","Recipiente"],["Label","Etiqueta"]];
