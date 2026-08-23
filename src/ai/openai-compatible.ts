export interface ProviderConfig { readonly provider:"tokenrouter"|"openrouter"; readonly baseUrl:string; readonly apiKey:string; readonly model:string; }
export function providerConfigFromEnvironment(env:NodeJS.ProcessEnv=process.env):ProviderConfig { const provider=env.THINKAI_AI_PROVIDER; if(provider!=="tokenrouter"&&provider!=="openrouter")throw new Error("THINKAI_AI_PROVIDER must select tokenrouter or openrouter."); const baseUrl=provider==="tokenrouter"?env.TOKENROUTER_BASE_URL:env.OPENROUTER_BASE_URL; const apiKey=provider==="tokenrouter"?env.TOKENROUTER_API_KEY:env.OPENROUTER_API_KEY; const model=env.THINKAI_AI_MODEL; if(!baseUrl||!apiKey||!model)throw new Error("Qualified AI provider configuration is required."); return{provider,baseUrl,apiKey,model}; }
export class OpenAICompatibleProvider {
  constructor(private readonly config:ProviderConfig,private readonly fetcher:typeof fetch=fetch){}
  async complete(input:{system:string;user:string}):Promise<{provider:"tokenrouter"|"openrouter";model:string;text:string}>{
    let response:Response;
    try { response=await this.fetcher(`${this.config.baseUrl.replace(/\/$/,"")}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${this.config.apiKey}`,"content-type":"application/json"},body:JSON.stringify({model:this.config.model,temperature:0,messages:[{role:"system",content:input.system},{role:"user",content:input.user}]})}); }
    catch { throw Object.assign(new Error("AI service is unavailable."),{code:"AI_UNAVAILABLE"}); }
    if(!response.ok)throw Object.assign(new Error("AI service is unavailable."),{code:"AI_UNAVAILABLE"});
    let body:{model?:unknown;choices?:{message?:{content?:unknown}}[]};
    try { body=await response.json() as {model?:unknown;choices?:{message?:{content?:unknown}}[]}; }
    catch { throw Object.assign(new Error("AI service is unavailable."),{code:"AI_UNAVAILABLE"}); }
    const text=body.choices?.[0]?.message?.content;
    if(typeof text!=="string"||!text.trim())throw Object.assign(new Error("AI service is unavailable."),{code:"AI_UNAVAILABLE"});
    return{provider:this.config.provider,model:typeof body.model==="string"?body.model:this.config.model,text};
  }
}
export class OpenAICompatibleCompanionAdapter { constructor(private readonly provider:OpenAICompatibleProvider){} async reply(input:{learnerMessage:string;guidanceVersion:string;taskContext:{practiceTaskId:string;practiceTaskVersion:string;prompt:string;commonMisconceptions:readonly string[];allowedSupportLevels:readonly string[]}}){const response=await this.provider.complete({system:`You support this Practice task only. Task: ${input.taskContext.prompt} Misconceptions: ${input.taskContext.commonMisconceptions.join("; ") || "none"} Allowed levels: ${input.taskContext.allowedSupportLevels.join(", ")}. Return one concise Vietnamese conceptual hint. Do not give a final answer.`,user:input.learnerMessage});return{reply:response.text,proposedSupportLevel:"CONCEPTUAL_HINT",provider:response.provider,model:response.model};} }
