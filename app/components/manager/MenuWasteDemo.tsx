"use client";

import { useState } from "react";
import { MenuEngineering } from "./MenuEngineering";
import { WasteTracker } from "./WasteTracker";

export function MenuWasteDemo(){const [tab,setTab]=useState<"menu"|"waste">("menu");return <><div className="experimental-banner"><strong>Experimental demo area</strong><span>Illustrative Menu Engineering and Waste tools remain secondary to core kitchen operations.</span></div><div className="tabs"><button className={`tab ${tab==="menu"?"active":""}`} onClick={()=>setTab("menu")}>Menu Engineering</button><button className={`tab ${tab==="waste"?"active":""}`} onClick={()=>setTab("waste")}>Waste Tracking</button></div>{tab==="menu"?<MenuEngineering/>:<WasteTracker/>}</>}
