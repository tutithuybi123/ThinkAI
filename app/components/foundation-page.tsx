import type { FoundationRoute } from "../../src/frontend/foundation.js";
import { AppShell } from "./app-shell.js";
import { Button, FeedbackSurface, Skeleton, StatePanel, Status, TextField, WrittenSolutionField } from "./ui.js";

export interface FoundationPageProps {
  readonly active: FoundationRoute;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly contextTitle: string;
  readonly contextCopy: string;
  readonly mode?: "home" | "learn" | "practice" | "transfer" | "receipt" | "progress";
}

export function FoundationPage(props: FoundationPageProps) {
  const practiceLike = props.mode === "practice" || props.mode === "transfer";
  return <AppShell active={props.active}><main className="page-shell" id="main-content">
    <header className="page-header"><div><div className="page-eyebrow">{props.eyebrow}</div><h1 className="page-title">{props.title}</h1><p className="page-description">{props.description}</p></div></header>
    <div className="page-body"><div className="foundation-grid"><section className="foundation-primary">
      <div className="section-label">NỘI DUNG</div>
      {practiceLike ? <><h2 className="foundation-title">{props.mode === "transfer" ? "Một tình huống mới, không có hỗ trợ." : "Bài luyện sẽ xuất hiện khi bạn mở một phiên."}</h2><div style={{ display: "grid", gap: "var(--space-4)", marginTop: "var(--space-6)" }}><TextField id="foundation-answer" label="Đáp án của bạn" placeholder="Nhập đáp án" disabled/><WrittenSolutionField id="foundation-reasoning" placeholder="Viết các bước bạn đã dùng…" note="Bài làm được giữ lại khi gửi bị gián đoạn." disabled/></div><div className="state-panel-actions"><Button disabled>Gửi bài làm</Button><Button loading>Đang xử lý</Button></div></> : <><StatePanel title={props.mode === "progress" ? "Chưa có bằng chứng để hiển thị." : "Chưa có nội dung để hiển thị."}>Thông tin sẽ xuất hiện từ phiên học và nội dung đã được xuất bản.</StatePanel><div style={{ display: "grid", gap: "var(--space-3)", marginTop: "var(--space-6)" }}><Skeleton title/><Skeleton/><Skeleton/></div></>}
    </section><aside className="context-rail"><div className="section-label">NGỮ CẢNH</div><strong>{props.contextTitle}</strong><p>{props.contextCopy}</p>{props.mode === "transfer" ? <FeedbackSurface title="Phiên độc lập">Không có Companion hoặc dữ liệu Bài luyện ở đây.</FeedbackSurface> : props.mode === "practice" ? <FeedbackSurface title="Practice Companion">Hỗ trợ chỉ xuất hiện trong Bài luyện.</FeedbackSurface> : <StatePanel tone="uncertain" title="Đang chuẩn bị">Chưa có dữ liệu để hiển thị.</StatePanel>}<div style={{ marginTop: "var(--space-5)" }}><Status tone="uncertain">Đang chờ dữ liệu server</Status></div></aside></div></div>
  </main></AppShell>;
}
