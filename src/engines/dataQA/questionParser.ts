import type { AggregationOperation, AggregationRequest, DateGranularity } from "../data/aggregationEngine";
import type { DatasetProfile } from "../data/profiler";
import type { DatasetFilter } from "../data/filterEngine";
import { parseQuestionFilters } from "./filterParser";

export type QuestionIntent="aggregate"|"rank"|"group"|"count"|"comparison"|"unknown";
export type ComparisonDefinition={column:string;values:[string,string]};
export type QuestionParseResult={success:boolean;originalQuestion:string;normalizedQuestion:string;intent:QuestionIntent;request:AggregationRequest|null;filters:DatasetFilter[];comparison?:ComparisonDefinition;confidence:number;explanation:string;detected:{operation?:AggregationOperation;valueColumn?:string;groupByColumn?:string;dateGranularity?:DateGranularity;ranking?:"highest"|"lowest"}};

export function parseDataQuestion(question:string,profile:DatasetProfile):QuestionParseResult{
 const q=normalize(question); if(!q)return fail(question,q,"The question is empty.");
 const filters=parseQuestionFilters(q,profile).filters; const ranking=rank(q); const granularity=grain(q); const comparison=detectComparison(q,profile);
 let operation=op(q); const matches=profile.columns.map(c=>({c,s:score(q,c.name)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.c);
 let valueColumn=matches.find(c=>c.type==="number")?.name; let groupByColumn=matches.find(c=>["category","text","boolean","date"].includes(c.type))?.name;
 if(granularity&&!groupByColumn)groupByColumn=profile.columns.find(c=>c.type==="date")?.name;
 if(operation==="count")valueColumn=undefined; if(!operation&&valueColumn)operation="sum";
 if(!operation)return fail(question,q,"I couldn't determine the calculation you want.",filters);
 if(operation!=="count"&&!valueColumn)return fail(question,q,"I couldn't identify a numeric column for this question.",filters);
 const request:AggregationRequest={operation,valueColumn,groupByColumn,dateGranularity:groupByColumn?granularity:undefined,sort:ranking==="lowest"?"asc":"desc",limit:ranking?1:undefined};
 const intent:QuestionIntent=comparison?"comparison":ranking?"rank":operation==="count"?"count":groupByColumn?"group":"aggregate";
 return {success:true,originalQuestion:question,normalizedQuestion:q,intent,request,filters,comparison,confidence:Math.min(.95,.55+(valueColumn?.length?0.2:0)+(groupByColumn?0.1:0)+(ranking||granularity?0.05:0)),explanation:label(request),detected:{operation,valueColumn,groupByColumn,dateGranularity:granularity,ranking}};
}
function op(q:string):AggregationOperation|undefined{if(any(q,["average","avg","mean"]))return"avg";if(any(q,["how many","count","number of records","number of rows"]))return"count";if(any(q,["minimum","smallest value"]))return"min";if(any(q,["maximum","largest value"]))return"max";if(any(q,["total","sum","generated","revenue","sales","spending","expense","cost","show"]))return"sum";}
function rank(q:string){if(any(q,["highest","most","largest","top","best"]))return"highest" as const;if(any(q,["lowest","least","smallest","bottom"]))return"lowest" as const;}
function grain(q:string):DateGranularity|undefined{if(any(q,["daily","per day","by day"]))return"day";if(any(q,["monthly","per month","by month"]))return"month";if(any(q,["quarterly","per quarter","by quarter"]))return"quarter";if(any(q,["yearly","annual","per year","by year"]))return"year";}
function score(q:string,name:string){const n=normalize(name);if(phrase(q,n))return 100;return n.split(" ").reduce((s,w)=>s+(phrase(q,w)?20:0),0)}
function detectComparison(q:string,profile:DatasetProfile):ComparisonDefinition|undefined{if(!any(q,["compare","versus","vs","difference between"]))return;for(const c of profile.columns){if(!["category","text"].includes(c.type))continue;const vals=c.sampleValues.filter(v=>v!==null&&!(v instanceof Date)).map(String).filter(v=>phrase(q,normalize(v)));const u=[...new Set(vals)];if(u.length>=2)return{column:c.name,values:[u[0],u[1]]}}}
function label(r:AggregationRequest){return `${r.operation.toUpperCase()}(${r.valueColumn??"*"})${r.groupByColumn?` grouped by ${r.groupByColumn}`:""}${r.dateGranularity?` by ${r.dateGranularity}`:""}.`}
function fail(original:string,normalized:string,explanation:string,filters:DatasetFilter[]=[]):QuestionParseResult{return{success:false,originalQuestion:original,normalizedQuestion:normalized,intent:"unknown",request:null,filters,confidence:0,explanation,detected:{}}}
function normalize(s:string){return s.toLowerCase().replace(/[_-]+/g," ").replace(/[^\p{L}\p{N}\s,.]/gu," ").replace(/\s+/g," ").trim()}
function phrase(text:string,p:string){const e=p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`(^|\\s)${e}(?=\\s|$)`,`i`).test(text)}
function any(q:string,terms:string[]){return terms.some(t=>phrase(q,t))}
