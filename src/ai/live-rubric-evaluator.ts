import type { RubricEvaluatorAdapter } from "./evaluator.js";
import { OpenAICompatibleProvider,providerConfigFromEnvironment } from "./openai-compatible.js";

/** Provider-neutral boundary: it returns raw facets only; grading remains server-owned. */
export class LiveRubricEvaluator implements RubricEvaluatorAdapter {
  private readonly config=providerConfigFromEnvironment();
  private readonly provider=new OpenAICompatibleProvider(this.config);
  async evaluate(input:{taskVersion:string;rubricVersion:string;rawText:string}):Promise<unknown>{
    const reply=await this.provider.complete({system:"Return only JSON rubric facets. Never return a grade or outcome.",user:JSON.stringify({taskVersion:input.taskVersion,rubricVersion:input.rubricVersion,solution:input.rawText})});
    return JSON.parse(reply.text) as unknown;
  }
}
