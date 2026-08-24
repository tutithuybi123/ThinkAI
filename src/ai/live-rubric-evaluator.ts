import type { RubricEvaluatorAdapter } from "./evaluator.js";
import { OpenAICompatibleProvider,providerConfigFromEnvironment } from "./openai-compatible.js";

/** Provider-neutral boundary: it returns raw facets only; grading remains server-owned. */
export class LiveRubricEvaluator implements RubricEvaluatorAdapter {
  private readonly config=providerConfigFromEnvironment();
  private readonly provider=new OpenAICompatibleProvider(this.config);
  async evaluate(input:{taskVersion:string;rubricVersion:string;rawText:string;expectedResult:string;criteria:readonly {readonly id:string;readonly description:string}[];shape:import("../content/rubric.js").ReviewedRubricGradingShape}):Promise<unknown>{
    const reply=await this.provider.complete({system:"Return only a JSON object with finalAnswer, reasoning, criteria, errors, confidence and evaluatorVersion. Return rubric facets only; never return a grade or outcome.",user:JSON.stringify({taskVersion:input.taskVersion,rubricVersion:input.rubricVersion,expectedResult:input.expectedResult,criteria:input.criteria,gradingShape:input.shape,solution:input.rawText})});
    return JSON.parse(reply.text) as unknown;
  }
}
