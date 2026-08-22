import assert from "node:assert/strict";
import test from "node:test";
import {OpenAICompatibleProvider,providerConfigFromEnvironment} from "./openai-compatible.js";
test("provider selection is explicit and configuration-driven",()=>{assert.deepEqual(providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter",TOKENROUTER_BASE_URL:"https://router",TOKENROUTER_API_KEY:"secret",THINKAI_AI_MODEL:"fixed-model"}),{provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"});assert.throws(()=>providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter"}),/Qualified/);});

test("provider transport failures are a safe unavailable boundary",async()=>{const provider=new OpenAICompatibleProvider({provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"},async()=>new Response("temporarily unavailable",{status:503}));await assert.rejects(provider.complete({system:"system",user:"user"}),(error:unknown)=>typeof error==="object"&&error!==null&&(error as {code?:unknown}).code==="AI_UNAVAILABLE");});
