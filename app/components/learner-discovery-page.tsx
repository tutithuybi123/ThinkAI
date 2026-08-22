"use client";

import { useEffect, useState } from "react";

import type { FoundationRoute } from "../../src/frontend/foundation.js";
import { idempotencyKey, requestJson } from "../lib/api-client.js";
import type { LearnerDiscovery, LearnerHome, LearnerMicroSkillState } from "../lib/learner-discovery.js";
import { AppShell } from "./app-shell.js";
import { Button, Skeleton, StatePanel, Status } from "./ui.js";

type Mode = "home" | "learn";
type LoadState = { readonly kind: "loading" } | { readonly kind: "error"; readonly message: string } | { readonly kind: "ready"; readonly discovery: LearnerDiscovery };

const stateCopy: Record<LearnerMicroSkillState, { readonly label: string; readonly tone: "success" | "partial" | "uncertain" }> = {
  available: { label: "Sẵn sàng", tone: "success" },
  current: { label: "Đang làm", tone: "partial" },
  completed: { label: "Đã thể hiện", tone: "success" },
  unavailable: { label: "Chưa mở", tone: "uncertain" },
};

function contextFor(discovery: LearnerDiscovery): string | undefined {
  const current = discovery.subjects.flatMap((subject) => subject.topics.flatMap((topic) => topic.microSkills.map((microSkill) => ({ subject, topic, microSkill })))).find(({ microSkill }) => microSkill.state === "current");
  return current ? `${current.subject.label} · ${current.topic.label}` : undefined;
}

export function LearnerDiscoveryPage({ mode }: { readonly mode: Mode }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [starting, setStarting] = useState(false);
  const load = async () => {
    setState({ kind: "loading" });
    try {
      const payload = mode === "home" ? await requestJson<LearnerHome>("/api/v1/home") : await requestJson<LearnerDiscovery>("/api/v1/skills");
      setState({ kind: "ready", discovery: payload });
    } catch (error) { setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể tải lộ trình." }); }
  };
  useEffect(() => { void load(); }, [mode]);
  const discovery = state.kind === "ready" ? state.discovery : undefined;
  const start = async () => {
    if (!discovery || discovery.nextAction.kind !== "start_practice") return;
    setStarting(true);
    try {
      const result = await requestJson<{ readonly sessionId: string }>("/api/v1/practice/start", { method: "POST", idempotencyKey: idempotencyKey(), body: { microSkillRevisionId: discovery.nextAction.microSkillRevisionId } });
      window.location.assign(`/practice/${encodeURIComponent(result.sessionId)}`);
    } catch (error) { setStarting(false); setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể mở bài luyện." }); }
  };
  const resume = () => {
    if (discovery?.nextAction.kind === "resume_practice") window.location.assign(`/practice/${encodeURIComponent(discovery.nextAction.practiceSessionId)}`);
  };
  const context = discovery ? contextFor(discovery) : undefined;
  return <AppShell active={mode as FoundationRoute} {...(context ? { context } : {})}>
    <main className="page-shell learner-page" id="main-content">
      {state.kind === "loading" ? <Loading mode={mode}/> : state.kind === "error" ? <ErrorState onRetry={() => void load()} message={state.message}/> : mode === "home" ? <Home discovery={discovery!} starting={starting} onStart={() => void start()} onResume={resume}/> : <Learn discovery={discovery!} starting={starting} onStart={() => void start()} onResume={resume}/>
      }
    </main>
  </AppShell>;
}

function Loading({ mode }: { readonly mode: Mode }) { return <><header className="page-header"><div><div className="page-eyebrow">{mode === "home" ? "TRANG CHỦ" : "HỌC"}</div><Skeleton title/></div></header><div className="learner-loading"><Skeleton/><Skeleton/><Skeleton/></div></>; }
function ErrorState({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) { return <StatePanel tone="error" title="Chưa tải được lộ trình" actions={<Button onClick={onRetry}>Thử lại</Button>}>{message}</StatePanel>; }

function Action({ discovery, starting, onStart, onResume }: { readonly discovery: LearnerDiscovery; readonly starting: boolean; readonly onStart: () => void; readonly onResume: () => void }) {
  if (discovery.nextAction.kind === "none") return <StatePanel title="Bạn đã hoàn tất nội dung đang mở">Khi có nội dung tiếp theo, lộ trình sẽ cập nhật tại đây.</StatePanel>;
  const resume = discovery.nextAction.kind === "resume_practice";
  return <section className="next-action"><div><div className="section-label">BƯỚC TIẾP THEO</div><h2>{resume ? "Tiếp tục từ đây" : "Bắt đầu micro-skill tiếp theo"}</h2><p>{resume ? "Bài luyện đang chờ bạn quay lại." : "Mở bài luyện đã được chọn cho bạn."}</p></div><Button loading={starting} onClick={resume ? onResume : onStart}>{resume ? "Tiếp tục bài luyện" : "Mở bài luyện"}</Button></section>;
}

function Home({ discovery, starting, onStart, onResume }: { readonly discovery: LearnerDiscovery; readonly starting: boolean; readonly onStart: () => void; readonly onResume: () => void }) {
  const current = flatten(discovery).find((item) => item.microSkill.state === "current") ?? flatten(discovery).find((item) => item.microSkill.state === "available");
  const isFirstUse = !discovery.progress.hasPracticeEvidence && !discovery.progress.hasIndependentTransferEvidence;
  return <><header className="page-header"><div><div className="page-eyebrow">TRANG CHỦ</div><h1 className="page-title">{current ? (isFirstUse ? "Bắt đầu từ đây" : "Tiếp tục học") : "Lộ trình của bạn đang sẵn sàng."}</h1><p className="page-description">{current ? `${current.subject.label} · ${current.topic.label}` : "Chọn một micro-skill đã được xuất bản để bắt đầu."}</p></div></header><div className="page-body home-body"><Action discovery={discovery} starting={starting} onStart={onStart} onResume={onResume}/>{current ? <section className="resume-row"><div><div className="section-label">MICRO-SKILL</div><h2>{current.microSkill.title}</h2><p>{current.microSkill.state === "current" ? "Bạn đã mở bài luyện này." : "Đây là điểm bắt đầu phù hợp lúc này."}</p></div><Status tone={stateCopy[current.microSkill.state].tone}>{stateCopy[current.microSkill.state].label}</Status></section> : null}</div></>;
}

function Learn({ discovery, starting, onStart, onResume }: { readonly discovery: LearnerDiscovery; readonly starting: boolean; readonly onStart: () => void; readonly onResume: () => void }) {
  return <><header className="page-header"><div><div className="page-eyebrow">HỌC</div><h1 className="page-title">Lộ trình theo môn học</h1><p className="page-description">Mỗi bước mở ra từ nội dung đã xuất bản và bằng chứng bạn đã có.</p></div></header><div className="page-body"><Action discovery={discovery} starting={starting} onStart={onStart} onResume={onResume}/>{discovery.subjects.length === 0 ? <StatePanel title="Chưa có nội dung để học">Nội dung được xuất bản sẽ xuất hiện tại đây.</StatePanel> : <div className="subject-path" id="subjects">{discovery.subjects.map((subject) => <section className="subject-section" key={subject.id}><h2>{subject.label}</h2>{subject.topics.map((topic) => <section className="topic-section" key={topic.id}><h3>{topic.label}</h3><div className="micro-skill-list">{topic.microSkills.map((microSkill) => <div className="micro-skill-row" data-state={microSkill.state} key={microSkill.id}><div><h4>{microSkill.title}</h4>{microSkill.unavailableReason ? <p>{microSkill.unavailableReason}</p> : null}</div><Status tone={stateCopy[microSkill.state].tone}>{stateCopy[microSkill.state].label}</Status></div>)}</div></section>)}</section>)}</div>}</div></>;
}

function flatten(discovery: LearnerDiscovery) { return discovery.subjects.flatMap((subject) => subject.topics.flatMap((topic) => topic.microSkills.map((microSkill) => ({ subject, topic, microSkill })))); }
