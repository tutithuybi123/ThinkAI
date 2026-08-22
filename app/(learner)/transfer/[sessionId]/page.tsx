import { TransferWorkspace } from "../../../components/transfer-workspace.js";
export default async function TransferFoundationPage({params}:{params:Promise<{sessionId:string}>}){const {sessionId}=await params;return <TransferWorkspace sessionId={sessionId}/>;}
