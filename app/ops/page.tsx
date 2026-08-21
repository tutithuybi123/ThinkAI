import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {createProductionRuntime,runtimeConfigurationFromEnvironment} from "../../src/runtime/server.js";
export default async function OpsPage(){const token=(await cookies()).get("thinkai_session")?.value;try{const runtime=await createProductionRuntime(runtimeConfigurationFromEnvironment());const actor=await runtime.auth.verify(token);await runtime.close();if(actor.role!=="presenter"&&actor.role!=="auditor")redirect("/");}catch{redirect("/");}return <main><h1>ThinkAI Content Studio</h1><p>Protected reviewed-content lifecycle workspace.</p></main>}
