import { StatePanel } from "../components/ui.js";

export default function OpsPage() {
  return <main className="ops-shell"><header><div><div className="page-eyebrow">OPS · STAFF ONLY</div><h1 className="page-title">Content Studio</h1><p className="page-description">Foundation cho content overview, revision editor, pair bank và preview đã được bảo vệ ở backend.</p></div></header><nav aria-label="Content Studio foundation"><span>Overview</span><span>Revisions</span><span>Pair bank</span><span>Preview</span></nav><div style={{ marginTop: "var(--space-10)", maxWidth: "42rem" }}><StatePanel title="Chờ staff session" tone="uncertain">UI-2 không giả lập quyền reviewer hoặc lifecycle action. UI-3 sẽ nối Ops API đã bảo vệ.</StatePanel></div></main>;
}
