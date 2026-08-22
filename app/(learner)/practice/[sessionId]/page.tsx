import { PracticeWorkspace } from "../../../components/practice-workspace.js";

export default async function PracticeFoundationPage({ params }: { readonly params: Promise<{ sessionId: string }> }) { const { sessionId } = await params; return <PracticeWorkspace sessionId={sessionId}/>; }
