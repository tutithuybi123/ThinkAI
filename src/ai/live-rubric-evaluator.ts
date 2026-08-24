import type { RubricEvaluatorAdapter } from "./evaluator.js";
import { OpenAICompatibleProvider,providerConfigFromEnvironment } from "./openai-compatible.js";

/** Provider-neutral boundary: it returns raw facets only; grading remains server-owned. */
export class LiveRubricEvaluator implements RubricEvaluatorAdapter {
  private readonly config=providerConfigFromEnvironment();
  private readonly provider=new OpenAICompatibleProvider(this.config);
  async evaluate(input:{taskVersion:string;rubricVersion:string;rawText:string;expectedResult:string;criteria:readonly {readonly id:string;readonly description:string}[];shape:import("../content/rubric.js").ReviewedRubricGradingShape}):Promise<unknown>{
    const finalAnswer=input.shape.finalAnswerFacet==="required"?`"finalAnswer":"correct|incorrect|unknown",`:"";
    const criteria=input.criteria.map((criterion)=>`${criterion.id}: ${criterion.description}`).join("\n");
    const schema=`{${finalAnswer}"reasoning":"correct|incorrect|partial|uncertain","criteria":[${input.criteria.map((criterion)=>`{"id":"${criterion.id}","status":"correct|incorrect|partial|uncertain"}`).join(",")}],"errors":[],"confidence":"high|medium|low","evaluatorVersion":"qwen"}`;
    const reply=await this.provider.complete({
      system:"Bạn đánh giá bài giải toán. Chỉ trả JSON thuần; không markdown, không outcome.",
      user:`Bài làm: ${input.rawText}\nTiêu chí:\n${criteria}\nTrả đúng JSON: ${schema}`
    });
    return JSON.parse(reply.text) as unknown;
  }
}
