import type { PublicMenuItem } from "../types";

export const menuMetadata = {
  menuSource: "Alimentaria Mexicana public menu",
  menuSourceUrl: "https://alimentariamexicana.com/menu",
  menuDataType: "Public menu names, descriptions and listed prices",
  operationalDataType: "Illustrative fictional demo data",
  verified: "August 27, 2026",
} as const;

export const publicMenu: PublicMenuItem[] = [
  ["guacamole","Guacamole","To Share",15,"$15","Avocado, cilantro, onion, feta cheese, pumpkin seeds and lime; served with house-made heirloom corn chips."],
  ["sopa","Sopa de Tortilla","To Share",12,"$7 / $12","Tomato broth, guajillo and ancho chile, feta cheese, crema, cilantro and crispy tortilla strips."],
  ["beet-ceviche","Golden Beet Ceviche","To Share",18,"$18","Golden beets, cucumber, onion, avocado, cilantro and charred poblano marinade; served with house-made corn chips."],
  ["shrimp-ceviche","Shrimp Ceviche","To Share",24,"$24","Red shrimp, cucumber, red onion, avocado, cilantro and tomatillo; served with house-made corn chips."],
  ["hamachi","Hamachi Tiradito","To Share",30,"$30","Cured hamachi, cucumber, red onion, guajillo oil, cilantro, jícama aguachile and tomatillo."],
  ["potatoes-chorizo","Potatoes con Green Chorizo","To Share",15,"$15","Fingerling potatoes, grilled green chorizo, salsa macha, feta cheese and cilantro."],
  ["halloumi","Halloumi Tostada","To Share",10,"$10","Fried halloumi, edamame hummus, avocado, lime, seeds, cilantro and a crispy corn tortilla."],
  ["greens","Greens con Pipián Verde","To Share",19,"$19","Char-grilled broccolini and asparagus, cilantro, parsley, cucumber and roasted pumpkin seeds."],
  ["chilaquiles-verdes","Chilaquiles Verdes","Chilaquiles",17,"$17","Heirloom corn totopos, tomatillo-cilantro salsa, refried beans, feta, crema, onion, cilantro and fried egg."],
  ["chilaquiles-rojos","Chilaquiles Rojos","Chilaquiles",17,"$17","Heirloom corn totopos, tomato-guajillo salsa, refried beans, feta, crema, onion, cilantro and fried egg."],
  ["highway-chicken","Highway Chicken","Mains",28,"$28","Grilled Cornish chicken, dried chile rub, orange béarnaise, grilled bok choy and jalapeño."],
  ["shrimp-rajas","Shrimp & Corn Rajas","Mains",30,"$30","Poblano peppers, yellow corn, onion, cilantro, crema, cheese and sautéed shrimp."],
  ["bavette","Grilled Bavette","Mains",32,"$32","Grilled bavette steak, fingerling potatoes, crema, salsa macha, cilantro-chimichurri and roasted carrots."],
  ["soy-chorizo","Soy Chorizo & Papas","Tacos",20,"$20","House-made soy chorizo, crispy potatoes, guajillo-miso dressing, pickled red onion and cilantro."],
  ["salmon-gobernador","Smoked Salmon Gobernador","Tacos",22,"$22","Smoked sockeye salmon, melted cheese, pickled red onion and cilantro."],
  ["beef-birria","Beef Birria","Tacos",22,"$22","Slow-braised beef, birria consomé, pickled red onion and cilantro."],
  ["carne-asada","Carne Asada con Queso","Tacos",24,"$24","Citrus-marinated grilled beef, guacasalsa, cheese crust, grilled onion and cilantro."],
  ["churros","House Made Churros","Dessert",13,"$13","Dulce de leche, cinnamon sugar, horchata gelato and cacao nibs."],
].map(([id,name,category,sellingPrice,priceDisplay,description]) => ({ id, name, category, sellingPrice, priceDisplay, description, provenance:"public-menu" })) as PublicMenuItem[];
