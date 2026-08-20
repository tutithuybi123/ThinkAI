import assert from "node:assert/strict";
import test from "node:test";
import {providerConfigFromEnvironment} from "./openai-compatible.js";
test("provider selection is explicit and configuration-driven",()=>{assert.deepEqual(providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter",TOKENROUTER_BASE_URL:"https://router",TOKENROUTER_API_KEY:"secret",THINKAI_AI_MODEL:"fixed-model"}),{provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"});assert.throws(()=>providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter"}),/Qualified/);});
