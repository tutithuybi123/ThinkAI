import type { RubricEvaluatorAdapter } from "./evaluator.js";
import { OpenAICompatibleProvider,providerConfigFromEnvironment } from "./openai-compatible.js";

/** Provider-neutral boundary: it returns raw facets only; grading remains server-owned. */
export class LiveRubricEvaluator implements RubricEvaluatorAdapter {
  private readonly config=providerConfigFromEnvironment();
  private readonly provider=new OpenAICompatibleProvider(this.config);
  async evaluate(input:{taskVersion:string;rubricVersion:string;rawText:string;expectedResult:string;criteria:readonly {readonly id:string;readonly description:string}[];shape:import("../content/rubric.js").ReviewedRubricGradingShape}):Promise<unknown>{
    const facets:unknown[]=[];
    for(const criterion of input.criteria){
      const reply=await this.provider.complete({
        system:"Bạn đánh giá một tiêu chí của bài giải toán. Chỉ trả JSON thuần.",
        user:`Tiêu chí ${criterion.id}: ${criterion.description}\nBài làm: ${input.rawText}\nTrả đúng JSON: {"criterionId":"${criterion.id}","status":"correct|incorrect|partial|not_assessed|uncertain","confidence":"high|medium|low"}`
      });
      facets.push(JSON.parse(reply.text) as unknown);
    }
    return normalizeCriterionFacets(facets,input.shape,this.config.model);
  }
}

function normalizeCriterionFacets(value:readonly unknown[],shape:import("../content/rubric.js").ReviewedRubricGradingShape,model:string):unknown{
  if(!value.every((facet)=>!!facet&&typeof facet==="object"&&!Array.isArray(facet)&&Object.keys(facet as Record<string,unknown>).every((key)=>key==="criterionId"||key==="status"||key==="confidence")&&typeof (facet as Record<string,unknown>).criterionId==="string"&&typeof (facet as Record<string,unknown>).status==="string"&&["high","medium","low"].includes(String((facet as Record<string,unknown>).confidence))))return {facets:value};
  const facets=value as readonly Record<string,unknown>[];
  const statuses=facets.map((facet)=>String(facet.status));
  const reasoning=statuses.every((status)=>status==="correct")?"correct":statuses.some((status)=>status==="partial")?"partial":statuses.some((status)=>status==="incorrect")?"incorrect":"uncertain";
  const confidence=facets.some((facet)=>facet.confidence==="low")?"low":facets.some((facet)=>facet.confidence==="medium")?"medium":"high";
  return {
    ...(shape.finalAnswerFacet==="required"?{finalAnswer:"unknown"}:{}),
    reasoning,
    criteria:facets.map((facet)=>({id:facet.criterionId,status:facet.status})),
    errors:[],
    confidence,
    evaluatorVersion:model
  };
}
