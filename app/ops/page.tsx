"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Divider, Skeleton, StatePanel, Status, TextField, WrittenSolutionField } from "../components/ui.js";
import { idempotencyKey, requestJson } from "../lib/api-client.js";

type Pair = { id: string; version: string; microSkillRevisionId?: string; practiceContent?: { id?: string; skillId?: string; prompt?: { body?: string }; answerSpec?: { kind?: string } }; transferContent?: { id?: string; skillId?: string; prompt?: { body?: string }; answerSpec?: { kind?: string } }; connectionReveal?: { title?: string; pairId?: string; pairVersion?: string; explanation?: { body?: string } } };
type Node = { subject?: { label?: string }; topic?: { label?: string }; microSkill?: { id?: string; title?: string; evidenceSkillId?: string; revisionId?: string }; practiceGate?: { policyVersion?: string; strategy?: string; requiredCorrectCount?: number; maxPracticeItems?: number }; pairs?: Pair[] };
type Aggregate = { microSkills?: Node[] };
type Revision = { id: string; lifecycle: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "DEPRECATED"; body: Aggregate };

const lifecycleTone = (lifecycle: Revision["lifecycle"]) => lifecycle === "PUBLISHED" ? "success" : lifecycle === "DRAFT" ? "uncertain" : lifecycle === "DEPRECATED" ? "danger" : "partial" as const;
const firstNode = (body: Aggregate): Node | undefined => body.microSkills?.[0];
const clone = <T,>(value: T): T => structuredClone(value);

export default function OpsPage() {
  const [revisions, setRevisions] = useState<Revision[]>();
  const [selected, setSelected] = useState<Revision>();
  const [draft, setDraft] = useState<Aggregate>();
  const [nodeIndex, setNodeIndex] = useState(0);
  const [newRevisionId, setNewRevisionId] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(undefined);
    try { setRevisions(await requestJson<Revision[]>("/api/v1/ops/revisions")); }
    catch (reason) { try { await requestJson("/api/v1/demo/staff-session", { method: "POST", body: { role: "presenter" } }); setRevisions(await requestJson<Revision[]>("/api/v1/ops/revisions")); } catch { setError(reason instanceof Error ? reason.message : "Không thể mở Content Studio."); } }
  };
  useEffect(() => { void load(); }, []);

  const choose = (revision: Revision) => { setSelected(revision); setDraft(clone(revision.body)); setNodeIndex(0); setError(undefined); };
  const node = useMemo(() => draft?.microSkills?.[nodeIndex], [draft, nodeIndex]);
  const editable = selected?.lifecycle === "DRAFT" && !!draft && !!node;
  const updateNode = (change: (value: Node) => Node) => setDraft(previous => {
    if (!previous?.microSkills?.[nodeIndex]) return previous;
    const body = clone(previous); body.microSkills![nodeIndex] = change(body.microSkills![nodeIndex]!); return body;
  });
  const setLabel = (path: "subject" | "topic" | "microSkill", key: "label" | "title" | "evidenceSkillId" | "revisionId", value: string) => updateNode(current => ({ ...current, [path]: { ...current[path], [key]: value } }));
  const updateGate = (key: "requiredCorrectCount" | "maxPracticeItems", value: number) => updateNode(current => ({ ...current, practiceGate: { policyVersion: "practice-gate/v1", strategy: "distinct-correct-count", ...current.practiceGate, [key]: value } }));
  const updatePair = (index: number, change: (pair: Pair) => Pair) => updateNode(current => ({ ...current, pairs: (current.pairs ?? []).map((pair, pairIndex) => pairIndex === index ? change(pair) : pair) }));
  const reorderPair = (index: number, direction: -1 | 1) => updateNode(current => { const pairs = [...(current.pairs ?? [])]; const target = index + direction; if (target < 0 || target >= pairs.length) return current; [pairs[index], pairs[target]] = [pairs[target]!, pairs[index]!]; return { ...current, pairs }; });
  const removePair = (index: number) => updateNode(current => ({ ...current, pairs: (current.pairs ?? []).filter((_, pairIndex) => pairIndex !== index) }));
  const duplicatePair = () => updateNode(current => {
    const source = current.pairs?.at(-1); if (!source) return current;
    const suffix = `${Date.now()}`;
    const copy = clone(source);
    copy.id = `pair_draft_${suffix}`; copy.version = "1";
    const revisionId = (current.microSkill as { revisionId?: string } | undefined)?.revisionId; if (revisionId) copy.microSkillRevisionId = revisionId;
    if (copy.practiceContent) copy.practiceContent.id = `task_practice_${suffix}`;
    if (copy.transferContent) copy.transferContent.id = `task_transfer_${suffix}`;
    if (copy.connectionReveal) { copy.connectionReveal.pairId = copy.id; copy.connectionReveal.pairVersion = copy.version; }
    return { ...current, pairs: [...(current.pairs ?? []), copy] };
  });

  const persistDraft = async (): Promise<Revision | undefined> => {
    if (!selected || !draft) return undefined;
    const revision = await requestJson<Revision>(`/api/v1/ops/revisions/${selected.id}`, { method: "PUT", body: { contentAggregate: draft }, idempotencyKey: idempotencyKey() });
    choose(revision); await load(); return revision;
  };
  const save = async () => {
    if (!selected || !draft) return;
    setSaving(true); setError(undefined);
    try { await persistDraft(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể lưu draft. Nội dung bạn đang sửa vẫn được giữ trên màn hình."); }
    finally { setSaving(false); }
  };
  const createDraft = async () => {
    if (!draft || !newRevisionId.trim()) return;
    setSaving(true); setError(undefined);
    try { const revision = await requestJson<Revision>("/api/v1/ops/drafts", { method: "POST", body: { revisionId: newRevisionId.trim(), contentAggregate: draft }, idempotencyKey: idempotencyKey() }); setNewRevisionId(""); choose(revision); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể tạo revision mới."); }
    finally { setSaving(false); }
  };
  const lifecycle = async (action: "review" | "approve" | "publish" | "deprecate") => {
    if (!selected) return;
    if (action === "deprecate" && !confirm("Deprecate revision đã publish? Learner runtime sẽ không dùng revision này nữa.")) return;
    setSaving(true); setError(undefined);
    try { const draftRevision = action === "review" && draft ? await persistDraft() : selected; if (!draftRevision) return; const revision = await requestJson<Revision>(`/api/v1/ops/${action}`, { method: "POST", body: { revisionId: draftRevision.id }, idempotencyKey: idempotencyKey() }); choose(revision); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể đổi lifecycle."); }
    finally { setSaving(false); }
  };

  return <main className="ops-shell" id="main-content">
    <header>
      <div><div className="page-eyebrow">OPS · STAFF ONLY</div><h1 className="page-title">Content Studio</h1><p className="page-description">Revision, pair bank và publication dùng chính PostgreSQL content lifecycle của learner runtime.</p></div>
    </header>
    {!revisions && !error ? <div className="learner-loading"><Skeleton title/><Skeleton/></div> : error && !revisions ? <StatePanel tone="error" title="Không có quyền hoặc không tải được nội dung" actions={<Button onClick={() => void load()}>Thử lại</Button>}>{error}</StatePanel> : <div className="ops-grid">
      <aside className="ops-revision-list" aria-label="Danh sách revisions"><div className="section-label">CONTENT HIERARCHY</div>{revisions?.length === 0 ? <StatePanel title="Chưa có revision">Tạo draft đầu tiên từ một aggregate đã được chuẩn bị.</StatePanel> : revisions?.map(revision => { const item = firstNode(revision.body); const additional = Math.max(0, (revision.body.microSkills?.length ?? 1) - 1); return <button className="ops-revision-row" data-selected={selected?.id === revision.id || undefined} key={revision.id} onClick={() => choose(revision)}><span><strong>{item?.subject?.label ?? "Subject chưa đặt"}</strong><small>{item?.topic?.label ?? "Topic chưa đặt"} · {item?.microSkill?.title ?? revision.id}{additional ? ` +${additional} MicroSkill` : ""}</small></span><Status tone={lifecycleTone(revision.lifecycle)}>{revision.lifecycle}</Status></button>; })}</aside>
      <section className="ops-editor" aria-live="polite">
        {selected && draft && node ? <>
          <div className="ops-editor-heading"><div><div className="section-label">{selected.id}</div><h2>{node.microSkill?.title ?? "MicroSkill chưa đặt tên"}</h2></div><Status tone={lifecycleTone(selected.lifecycle)}>{selected.lifecycle}</Status></div>
          {(draft.microSkills?.length ?? 0) > 1 ? <nav className="ops-node-tabs" aria-label="MicroSkills trong revision">{draft.microSkills?.map((candidate, index) => <button key={String(candidate.microSkill?.id ?? index)} aria-current={index === nodeIndex ? "page" : undefined} onClick={() => setNodeIndex(index)}>{candidate.topic?.label ?? "Topic"} · {candidate.microSkill?.title ?? `MicroSkill ${index + 1}`}</button>)}</nav> : null}
          {error ? <StatePanel tone="error" title="Thao tác chưa hoàn tất" actions={<Button tone="quiet" onClick={() => setError(undefined)}>Đóng</Button>}>{error}</StatePanel> : null}
          {editable ? <>
            <section className="ops-section"><div className="section-label">LEARNER HIERARCHY</div><div className="ops-fields"><TextField id="ops-subject" label="Subject" value={node.subject?.label ?? ""} onChange={event => setLabel("subject", "label", event.target.value)}/><TextField id="ops-topic" label="Topic" value={node.topic?.label ?? ""} onChange={event => setLabel("topic", "label", event.target.value)}/><TextField id="ops-microskill" label="MicroSkill" value={node.microSkill?.title ?? ""} onChange={event => setLabel("microSkill", "title", event.target.value)}/><TextField id="ops-evidence-skill" label="Evidence skill ID" note="Identity nội bộ được server kiểm tra khi publish." value={node.microSkill?.evidenceSkillId ?? ""} onChange={event => setLabel("microSkill", "evidenceSkillId", event.target.value)}/><TextField id="ops-microskill-revision" label="MicroSkill revision ID" note="Đổi nội dung reviewed bằng revision ID mới; lịch sử cũ luôn bất biến." value={node.microSkill?.revisionId ?? ""} onChange={event => setLabel("microSkill", "revisionId", event.target.value)}/></div></section>
            <section className="ops-section"><div className="section-label">PRACTICE GATE</div><div className="ops-fields ops-fields--compact"><TextField id="ops-required-correct" type="number" min="1" label="Số bài đúng phân biệt cần có" value={String(node.practiceGate?.requiredCorrectCount ?? "")} onChange={event => updateGate("requiredCorrectCount", Number(event.target.value))}/><TextField id="ops-max-items" type="number" min="1" label="Số bài Practice tối đa" value={String(node.practiceGate?.maxPracticeItems ?? "")} onChange={event => updateGate("maxPracticeItems", Number(event.target.value))}/></div><p className="ops-note">Policy v1 cố định: distinct-correct-count. Server kiểm tra pair bank đủ cho giới hạn này khi publish.</p></section>
            <PairBank pairs={node.pairs ?? []} editable onUpdate={updatePair} onMove={reorderPair} onRemove={removePair} onDuplicate={duplicatePair}/>
            <div className="state-panel-actions"><Button loading={saving} onClick={() => void save()}>Lưu draft</Button><Button tone="secondary" loading={saving} onClick={() => void lifecycle("review")}>Gửi review</Button></div>
          </> : <>
            <StatePanel tone="uncertain" title="Revision bất biến">{selected.lifecycle} đã được khóa. Tạo draft mới để thay đổi nội dung, rồi đưa revision mới qua lifecycle review.</StatePanel>
            <PairBank pairs={node.pairs ?? []}/>
            <div className="ops-create-draft"><TextField id="ops-new-revision" label="ID revision draft mới" note="Ví dụ: revision_linear_20260822" value={newRevisionId} onChange={event => setNewRevisionId(event.target.value)}/><Button loading={saving} disabled={!newRevisionId.trim()} onClick={() => void createDraft()}>Tạo draft từ revision này</Button></div>
            <div className="state-panel-actions">{selected.lifecycle === "IN_REVIEW" ? <Button loading={saving} onClick={() => void lifecycle("approve")}>Approve</Button> : null}{selected.lifecycle === "APPROVED" ? <Button loading={saving} onClick={() => void lifecycle("publish")}>Publish</Button> : null}{selected.lifecycle === "PUBLISHED" ? <Button tone="quiet" loading={saving} onClick={() => void lifecycle("deprecate")}>Deprecate</Button> : null}</div>
          </>}
          <Preview node={node} lifecycle={selected.lifecycle}/>
        </> : <StatePanel title="Chọn một revision">Xem hierarchy, pair bank, preview và lifecycle từ revision được lưu trong PostgreSQL.</StatePanel>}
      </section>
    </div>}
  </main>;
}

function PairBank({ pairs, editable = false, onUpdate, onMove, onRemove, onDuplicate }: { readonly pairs: Pair[]; readonly editable?: boolean; readonly onUpdate?: (index: number, change: (pair: Pair) => Pair) => void; readonly onMove?: (index: number, direction: -1 | 1) => void; readonly onRemove?: (index: number) => void; readonly onDuplicate?: () => void }) {
  return <section className="ops-section"><div className="section-label">PRACTICE → TRANSFER PAIR BANK</div><p className="ops-note">{pairs.length} reviewed pair{pairs.length === 1 ? "" : "s"}. Pair và task version được giữ chính xác khi runtime chọn nội dung.</p>{editable && pairs.length ? <Button tone="quiet" onClick={onDuplicate}>Thêm pair từ bản sao</Button> : null}{pairs.length === 0 ? <StatePanel tone="uncertain" title="Pair bank trống">Revision có thể được lưu ở DRAFT; server sẽ từ chối publish cho đến khi bank đủ điều kiện.</StatePanel> : <div className="ops-pair-list">{pairs.map((pair, index) => <article className="ops-pair" key={`${pair.id}:${pair.version}`}><div className="ops-pair-heading"><div><strong>#{index + 1} · {pair.id}</strong><small>v{pair.version} · Practice {pair.practiceContent?.id ?? "—"} → Transfer {pair.transferContent?.id ?? "—"}</small></div>{editable ? <div className="ops-inline-actions"><Button tone="quiet" aria-label={`Đưa pair ${index + 1} lên`} disabled={index === 0} onClick={() => onMove?.(index, -1)}>↑</Button><Button tone="quiet" aria-label={`Đưa pair ${index + 1} xuống`} disabled={index === pairs.length - 1} onClick={() => onMove?.(index, 1)}>↓</Button><Button tone="quiet" aria-label={`Xóa pair ${index + 1}`} onClick={() => onRemove?.(index)}>Xóa</Button></div> : null}</div>{editable ? <div className="ops-pair-fields"><TextField id={`ops-practice-skill-${index}`} label="Practice evidence skill ID" note="Phải trùng Evidence skill ID của MicroSkill." value={pair.practiceContent?.skillId ?? ""} onChange={event => onUpdate?.(index, current => ({ ...current, practiceContent: { ...current.practiceContent, skillId: event.target.value } }))}/><TextField id={`ops-transfer-skill-${index}`} label="Transfer evidence skill ID" note="Phải trùng Evidence skill ID của MicroSkill." value={pair.transferContent?.skillId ?? ""} onChange={event => onUpdate?.(index, current => ({ ...current, transferContent: { ...current.transferContent, skillId: event.target.value } }))}/><WrittenSolutionField id={`ops-practice-${index}`} rows={3} label="Practice prompt" value={pair.practiceContent?.prompt?.body ?? ""} onChange={event => onUpdate?.(index, current => ({ ...current, practiceContent: { ...current.practiceContent, prompt: { ...(current.practiceContent?.prompt ?? {}), body: event.target.value } } }))}/><WrittenSolutionField id={`ops-transfer-${index}`} rows={3} label="Transfer prompt" value={pair.transferContent?.prompt?.body ?? ""} onChange={event => onUpdate?.(index, current => ({ ...current, transferContent: { ...current.transferContent, prompt: { ...(current.transferContent?.prompt ?? {}), body: event.target.value } } }))}/></div> : null}<div className="ops-pair-meta"><span>Practice: {pair.practiceContent?.answerSpec?.kind ?? "answer spec chưa có"}</span><span>Transfer: {pair.transferContent?.answerSpec?.kind ?? "answer spec chưa có"}</span><span>Reveal: {pair.connectionReveal?.title ?? "chưa có"}</span></div></article>)}</div>}</section>;
}

function Preview({ node, lifecycle }: { readonly node: Node; readonly lifecycle: Revision["lifecycle"] }) {
  return <section className="ops-preview"><Divider/><div className="section-label">PREVIEW · {lifecycle}</div><h3>{node.microSkill?.title ?? "MicroSkill"}</h3><p className="ops-note">Learner thấy từng workspace riêng biệt; preview này không mang Practice assistance sang Transfer.</p>{node.pairs?.map((pair, index) => <div className="ops-preview-pair" key={`${pair.id}:${pair.version}`}><div><div className="section-label">PRACTICE · PAIR {index + 1}</div><p>{pair.practiceContent?.prompt?.body ?? "Chưa có prompt"}</p></div><div><div className="section-label">TRANSFER · PAIR {index + 1}</div><p>{pair.transferContent?.prompt?.body ?? "Chưa có prompt"}</p></div></div>)}</section>;
}
