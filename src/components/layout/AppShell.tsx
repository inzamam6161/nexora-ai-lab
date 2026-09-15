import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, Home, Sparkles, X } from "lucide-react";
import { tools } from "../../data/tools";
import type { ToolRoute } from "../../app/toolRegistry";

type Props={children:ReactNode;activeTool:ToolRoute;onNavigate:(tool:ToolRoute)=>void};
export default function AppShell({children,activeTool,onNavigate}:Props){
 const isHome=activeTool==="dashboard"; const[open,setOpen]=useState(false);
 return <div className={`app-shell app-shell--topnav ${isHome?"app-shell--home":""}`}>
  {!isHome&&<header className="global-nav">
   <button className="global-brand" onClick={()=>onNavigate("dashboard")}><span><Sparkles size={16}/></span><b>NEXORA</b><small>AI LAB</small></button>
   <nav className="global-nav__links"><button onClick={()=>onNavigate("dashboard")}><Home size={13}/> Home</button><div className="global-tools"><button className={open?"is-active":""} onClick={()=>setOpen(v=>!v)}>Tools <ChevronDown size={13}/></button>{open&&<div className="global-tools__menu"><div className="global-tools__head"><span>Choose a capability</span><button onClick={()=>setOpen(false)}><X size={14}/></button></div>{tools.map(t=><button key={t.id} className={activeTool===t.id?"is-current":""} onClick={()=>{onNavigate(t.id as ToolRoute);setOpen(false)}}><t.icon size={15}/><span><b>{t.title}</b><small>{t.shortDescription}</small></span></button>)}</div>}</div></nav>
   <div className="global-nav__status"><i/> Local processing</div>
  </header>}
  <main className={`app-shell__content ${isHome?"app-shell__content--home":"app-shell__content--workspace"}`}>{children}</main>
 </div>;
}
