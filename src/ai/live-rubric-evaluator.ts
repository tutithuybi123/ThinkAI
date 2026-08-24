import type { RubricEvaluatorAdapter } from "./evaluator.js";
import { OpenAICompatibleProvider,providerConfigFromEnvironment } from "./openai-compatible.js";

/** Provider-neutral boundary: it returns raw facets only; grading remains server-owned. */
export class LiveRubricEvaluator implements RubricEvaluatorAdapter {
  private readonly config=providerConfigFromEnvironment();
  private readonly provider=new OpenAICompatibleProvider(this.config);
  async evaluate(input:{taskVersion:string;rubricVersion:string;rawText:string;expectedResult:string;criteria:readonly {readonly id:string;readonly description:string}[];shape:import("../content/rubric.js").ReviewedRubricGradingShape}):Promise<unknown>{
    const finalAnswer=input.shape.finalAnswerFacet==="required"?`"finalAnswer":"correct|incorrect|unknown",`:"";
    const criteria=input.criteria.map((criterion)=>`${criterion.id}: ${criterion.description}`).join("\n");
    const schema=`{${finalAnswer}"reasoning":"correct|incorrect|partial|not_assessed|uncertain","facets":[${input.criteria.map((criterion)=>`{"criterionId":"${criterion.id}","status":"correct|incorrect|partial|not_assessed|uncertain"}`).join(",")}],"confidence":"high|medium|low"}`;
    const reply=await this.provider.complete({
      system:"Bạn đánh giá bài giải toán. Chỉ trả JSON thuần; không markdown, không outcome.",
      user:`Bài làm: ${input.rawText}\nTiêu chí:\n${criteria}\nTrả đúng JSON: ${schema}`
    });
    return normalizeCompactFacets(JSON.parse(reply.text),input.shape,this.config.model);
  }
}

function normalizeCompactFacets(value:unknown,shape:import("../content/rubric.js").ReviewedRubricGradingShape,model:string):unknown{
  if(!value||typeof value!=="object"||Array.isArray(value))return value;
  const compact=value as Record<string,unknown>;
  const allowed=new Set(shape.finalAnswerFacet==="required"?["finalAnswer","reasoning","facets","confidence"]:["reasoning","facets","confidence"]);
  if(Object.keys(compact).some((key)=>!allowed.has(key))||!Array.isArray(compact.facets))return value;
  if(!compact.facets.every((facet)=>!!facet&&typeof facet==="object"&&!Array.isArray(facet)&&Object.keys(facet as Record<string,unknown>).every((key)=>key==="criterionId"||key==="status")&&typeof (facet as Record<string,unknown>).criterionId==="string"&&typeof (facet as Record<string,unknown>).status==="string"))return value;
  return {
    ...(shape.finalAnswerFacet==="required"?{finalAnswer:compact.finalAnswer}:{}),
    reasoning:compact.reasoning,
    criteria:compact.facets.map((facet)=>({id:(facet as Record<string,unknown>).criterionId,status:(facet as Record<string,unknown>).status})),
    errors:[],
    confidence:compact.confidence,
    evaluatorVersion:model
  };
}
