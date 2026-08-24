export interface ProviderConfig { readonly provider:"tokenrouter"|"openrouter"; readonly baseUrl:string; readonly apiKey:string; readonly model:string; }
export function providerConfigFromEnvironment(env:NodeJS.ProcessEnv=process.env):ProviderConfig { const provider=env.THINKAI_AI_PROVIDER; if(provider!=="tokenrouter"&&provider!=="openrouter")throw new Error("THINKAI_AI_PROVIDER must select tokenrouter or openrouter."); const baseUrl=provider==="tokenrouter"?env.TOKENROUTER_BASE_URL:env.OPENROUTER_BASE_URL; const apiKey=provider==="tokenrouter"?env.TOKENROUTER_API_KEY:env.OPENROUTER_API_KEY; const model=env.THINKAI_AI_MODEL; if(!baseUrl||!apiKey||!model)throw new Error("Qualified AI provider configuration is required."); return{provider,baseUrl,apiKey,model}; }
export class OpenAICompatibleProvider {
  constructor(private readonly config:ProviderConfig,private readonly fetcher:typeof fetch=fetch){}
  async complete(input:{system:string;user:string}):Promise<{provider:"tokenrouter"|"openrouter";model:string;text:string}>{
    for(let attempt=0;attempt<2;attempt+=1){
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),30_000);
      try {
        const response=await this.fetcher(`${this.config.baseUrl.replace(/\/$/,"")}/chat/completions`,{method:"POST",signal:controller.signal,headers:{Authorization:`Bearer ${this.config.apiKey}`,"content-type":"application/json"},body:JSON.stringify({model:this.config.model,temperature:0,messages:[{role:"system",content:input.system},{role:"user",content:input.user}]})});
        if(!response.ok){
          if(attempt===0&&[429,502,503,504].includes(response.status)){await delay(250);continue;}
          throw unavailable();
        }
        let body:{model?:unknown;choices?:{message?:{content?:unknown}}[]};
        try { body=await response.json() as {model?:unknown;choices?:{message?:{content?:unknown}}[]}; }
        catch { throw unavailable(); }
        const text=body.choices?.[0]?.message?.content;
        if(typeof text!=="string"||!text.trim())throw unavailable();
        return{provider:this.config.provider,model:typeof body.model==="string"?body.model:this.config.model,text};
      } catch(error) {
        if(attempt===0&&isTransientTransportFailure(error)){await delay(250);continue;}
        throw unavailable();
      } finally { clearTimeout(timeout); }
    }
    throw unavailable();
  }
}
const delay=(milliseconds:number)=>new Promise<void>((resolve)=>setTimeout(resolve,milliseconds));
const unavailable=()=>Object.assign(new Error("AI service is unavailable."),{code:"AI_UNAVAILABLE"});
const isTransientTransportFailure=(error:unknown)=>!(typeof error==="object"&&error!==null&&"code" in error&&(error as {code?:unknown}).code==="AI_UNAVAILABLE");
export class OpenAICompatibleCompanionAdapter { constructor(private readonly provider:OpenAICompatibleProvider){} async reply(input:{learnerMessage:string;guidanceVersion:string;taskContext:{practiceTaskId:string;practiceTaskVersion:string;prompt:string;commonMisconceptions:readonly string[];allowedSupportLevels:readonly string[]}}){const response=await this.provider.complete({system:"You are a Practice Companion. Return one concise Vietnamese conceptual hint. Never give a final answer.",user:`Task context: ${input.taskContext.prompt}\nMisconceptions to address: ${input.taskContext.commonMisconceptions.join("; ") || "none"}\nAllowed levels: ${input.taskContext.allowedSupportLevels.join(", ")}\nLearner message: ${input.learnerMessage}`});return{reply:response.text,proposedSupportLevel:"CONCEPTUAL_HINT",provider:response.provider,model:response.model};} }
