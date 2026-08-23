"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Divider,
  Skeleton,
  StatePanel,
  Status,
  TextField,
  WrittenSolutionField,
} from "../components/ui.js";
import { idempotencyKey, requestJson } from "../lib/api-client.js";

type AnswerKind = "exact_text" | "numeric" | "expression" | "written_solution";
type AnswerSpec = {
  kind?: AnswerKind;
  accepted?: string[];
  expected?: string;
  tolerance?: string;
  normalizationVersion?: string;
  equivalencePolicy?: "symbolic";
  assessment?: {
    expectedResult?: string;
    criteria?: { id: string; description: string }[];
    referenceSolutions?: { format: "plain_text"; body: string }[];
    commonMisconceptions?: string[];
    gradingShape?: {
      finalAnswerFacet: "required" | "not_applicable";
      reasoningFacet: "required" | "not_applicable";
      requiredCriterionIds: string[];
      optionalCriterionIds: string[];
    };
    aiGuidance?: { version: string; allowedSupportLevels: string[] };
  };
};
type Task = {
  id?: string;
  version?: string;
  skillId?: string;
  role?: "practice" | "transfer";
  prompt?: { body?: string; format?: "plain_text" };
  answerSpec?: AnswerSpec;
};
type Pair = {
  id: string;
  version: string;
  microSkillRevisionId?: string;
  practiceContent?: Task;
  transferContent?: Task;
  connectionReveal?: {
    id?: string;
    version?: string;
    title?: string;
    sharedRelation?: string;
    explanation?: { body?: string; format?: "plain_text" };
  };
};
type Node = {
  subject?: { id?: string; label?: string };
  topic?: { id?: string; label?: string };
  microSkill?: {
    title?: string;
    revisionId?: string;
    id?: string;
    evidenceSkillId?: string;
  };
  practiceGate?: { requiredCorrectCount?: number; maxPracticeItems?: number };
  pairs?: Pair[];
};
type Aggregate = { microSkills?: Node[] };
type Lifecycle =
  "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "DEPRECATED";
type Revision = {
  id: string;
  lifecycle: Lifecycle;
  body: Aggregate;
  updatedAt?: string;
};
type Filter = "ALL" | Lifecycle;

const clone = <T,>(value: T): T => structuredClone(value);
const firstNode = (revision: Revision): Node | undefined =>
  revision.body.microSkills?.[0];
const tone = (state: Lifecycle) =>
  state === "PUBLISHED"
    ? "success"
    : state === "DRAFT"
      ? "uncertain"
      : state === "DEPRECATED"
        ? "danger"
        : ("partial" as const);
const isTechnical = (revision: Revision) =>
  /technical|kiểm tra|acceptance|smoke/i.test(
    `${firstNode(revision)?.subject?.label ?? ""} ${firstNode(revision)?.topic?.label ?? ""} ${firstNode(revision)?.microSkill?.title ?? ""}`,
  );
const initialAnswer = (kind: AnswerKind): AnswerSpec =>
  kind === "written_solution"
    ? {
        kind,
        assessment: {
          expectedResult: "",
          criteria: [],
          referenceSolutions: [],
          commonMisconceptions: [],
          gradingShape: {
            finalAnswerFacet: "not_applicable",
            reasoningFacet: "required",
            requiredCriterionIds: [],
            optionalCriterionIds: [],
          },
          aiGuidance: {
            version: "guidance/v1",
            allowedSupportLevels: [
              "PROMPT",
              "CONCEPTUAL_HINT",
              "STRATEGIC_HINT",
            ],
          },
        },
      }
    : kind === "expression"
      ? {
          kind,
          expected: "",
          equivalencePolicy: "symbolic",
          normalizationVersion: "answer/v1",
        }
      : kind === "numeric"
        ? {
            kind,
            expected: "",
            tolerance: "0",
            normalizationVersion: "answer/v1",
          }
        : { kind, accepted: [], normalizationVersion: "answer/v1" };

export default function OpsPage() {
  const [revisions, setRevisions] = useState<Revision[]>();
  const [selected, setSelected] = useState<Revision>();
  const [draft, setDraft] = useState<Aggregate>();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    subjectLabel: "",
    topicLabel: "",
    microSkillTitle: "",
  });
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [readiness, setReadiness] = useState<{
    ready: boolean;
    issues: string[];
  }>();
  const load = async () => {
    setError(undefined);
    try {
      setRevisions(await requestJson<Revision[]>("/api/v1/ops/revisions"));
    } catch (reason) {
      try {
        await requestJson("/api/v1/demo/staff-session", {
          method: "POST",
          body: { role: "presenter" },
        });
        setRevisions(await requestJson<Revision[]>("/api/v1/ops/revisions"));
      } catch {
        setError(
          reason instanceof Error
            ? reason.message
            : "Không thể mở Content Studio.",
        );
      }
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const loadReadiness = async (revisionId: string) => {
    try {
      setReadiness(
        await requestJson<{ ready: boolean; issues: string[] }>(
          `/api/v1/ops/revisions/${revisionId}/readiness`,
        ),
      );
    } catch {
      setReadiness(undefined);
    }
  };
  const choose = (revision: Revision) => {
    setSelected(revision);
    setDraft(clone(revision.body));
    setDirty(false);
    setCreating(false);
    setError(undefined);
    void loadReadiness(revision.id);
  };
  const node = draft?.microSkills?.[0];
  const editable = selected?.lifecycle === "DRAFT" && !!node;
  const displayed = useMemo(
    () =>
      (revisions ?? []).filter(
        (revision) =>
          (filter === "ALL" || revision.lifecycle === filter) &&
          `${firstNode(revision)?.subject?.label ?? ""} ${firstNode(revision)?.topic?.label ?? ""} ${firstNode(revision)?.microSkill?.title ?? ""}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
      ),
    [revisions, filter, query],
  );
  const updateNode = (change: (value: Node) => Node) =>
    setDraft((previous) => {
      if (!previous?.microSkills?.[0]) return previous;
      const next = clone(previous);
      next.microSkills![0] = change(next.microSkills![0]!);
      setDirty(true);
      return next;
    });
  const updatePair = (index: number, change: (pair: Pair) => Pair) =>
    updateNode((current) => ({
      ...current,
      pairs: (current.pairs ?? []).map((pair, i) =>
        i === index ? change(pair) : pair,
      ),
    }));
  const updateTask = (
    index: number,
    role: "practiceContent" | "transferContent",
    change: (task: Task) => Task,
  ) =>
    updatePair(index, (pair) => ({
      ...pair,
      [role]: change(pair[role] ?? {}),
    }));
  const save = async (): Promise<boolean> => {
    if (!selected || !draft) return false;
    setSaving(true);
    setError(undefined);
    try {
      const revision = await requestJson<Revision>(
        `/api/v1/ops/revisions/${selected.id}`,
        {
          method: "PUT",
          body: { contentAggregate: draft },
          idempotencyKey: idempotencyKey(),
        },
      );
      choose(revision);
      await load();
      return true;
    } catch (reason) {
      setError("Không thể lưu thay đổi. Nội dung bạn nhập vẫn được giữ.");
      return false;
    } finally {
      setSaving(false);
    }
  };
  const create = async () => {
    setSaving(true);
    setError(undefined);
    try {
      const revision = await requestJson<Revision>("/api/v1/ops/content", {
        method: "POST",
        body: createForm,
        idempotencyKey: idempotencyKey(),
      });
      choose(revision);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Không thể tạo nội dung mới.",
      );
    } finally {
      setSaving(false);
    }
  };
  const addPair = async () => {
    if (!selected) return;
    if (dirty && !(await save())) return;
    setSaving(true);
    try {
      const revision = await requestJson<Revision>(
        `/api/v1/ops/revisions/${selected.id}/pairs`,
        { method: "POST", body: {}, idempotencyKey: idempotencyKey() },
      );
      choose(revision);
      await load();
    } catch {
      setError("Không thể thêm cặp bài. Hãy thử lại.");
    } finally {
      setSaving(false);
    }
  };
  const createNextVersion = async () => {
    if (!selected) return;
    setSaving(true);
    setError(undefined);
    try {
      const revision = await requestJson<Revision>(
        `/api/v1/ops/revisions/${selected.id}/next-draft`,
        { method: "POST", body: {}, idempotencyKey: idempotencyKey() },
      );
      choose(revision);
      await load();
    } catch {
      setError("Không thể tạo phiên bản mới. Hãy thử lại.");
    } finally {
      setSaving(false);
    }
  };
  const lifecycle = async (
    action: "review" | "approve" | "publish" | "deprecate",
  ) => {
    if (!selected) return;
    if (
      action === "deprecate" &&
      !confirm(
        "Ngừng xuất bản revision này? Learner sẽ không dùng nội dung này nữa.",
      )
    )
      return;
    setSaving(true);
    setError(undefined);
    try {
      if (action === "review" && dirty) await save();
      const revision = await requestJson<Revision>(`/api/v1/ops/${action}`, {
        method: "POST",
        body: { revisionId: selected.id },
        idempotencyKey: idempotencyKey(),
      });
      choose(revision);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Không thể đổi trạng thái phiên bản.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className="ops-shell" id="main-content">
      <header className="ops-header">
        <div>
          <div className="page-eyebrow">OPS · STAFF ONLY</div>
          <h1 className="page-title">Content Studio</h1>
          <p className="page-description">
            Soạn, duyệt và xuất bản nội dung học tập từ cùng PostgreSQL
            repository mà learner runtime sử dụng.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreating(true);
            setSelected(undefined);
            setDraft(undefined);
            setError(undefined);
          }}
        >
          + Tạo nội dung mới
        </Button>
      </header>
      {!revisions && !error ? (
        <div className="learner-loading">
          <Skeleton title />
          <Skeleton />
        </div>
      ) : error && !revisions ? (
        <StatePanel
          tone="error"
          title="Không thể mở Content Studio"
          actions={<Button onClick={() => void load()}>Thử lại</Button>}
        >
          {error}
        </StatePanel>
      ) : (
        <div className="ops-grid">
          <aside className="ops-revision-list" aria-label="Danh sách nội dung">
            <div className="section-label">NỘI DUNG</div>
            <TextField
              id="ops-search"
              label="Tìm môn học, chủ đề hoặc kỹ năng"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="ops-filter" aria-label="Lọc phiên bản">
              {(
                [
                  "ALL",
                  "DRAFT",
                  "IN_REVIEW",
                  "APPROVED",
                  "PUBLISHED",
                  "DEPRECATED",
                ] as Filter[]
              ).map((value) => (
                <Button
                  key={value}
                  tone={filter === value ? "secondary" : "quiet"}
                  onClick={() => setFilter(value)}
                >
                  {value === "ALL" ? "Tất cả" : value}
                </Button>
              ))}
            </div>
            {displayed
              .filter((revision) => !isTechnical(revision))
              .map((revision) => (
                <RevisionRow
                  key={revision.id}
                  revision={revision}
                  selected={selected?.id === revision.id}
                  onSelect={() => choose(revision)}
                />
              ))}
            {displayed.some(isTechnical) ? (
              <>
                <Divider />
                <div className="section-label">
                  DỮ LIỆU KỸ THUẬT / THỬ NGHIỆM
                </div>
                {displayed.filter(isTechnical).map((revision) => (
                  <RevisionRow
                    key={revision.id}
                    revision={revision}
                    selected={selected?.id === revision.id}
                    onSelect={() => choose(revision)}
                  />
                ))}
              </>
            ) : null}
          </aside>
          <section className="ops-editor" aria-live="polite">
            {creating ? (
              <CreationForm
                form={createForm}
                existing={(revisions ?? []).filter(
                  (revision) => !isTechnical(revision),
                )}
                saving={saving}
                error={error}
                onChange={setCreateForm}
                onCancel={() => setCreating(false)}
                onCreate={() => void create()}
              />
            ) : selected && draft && node ? (
              <Editor
                revision={selected}
                node={node}
                editable={editable}
                saving={saving}
                dirty={dirty}
                error={error}
                onUpdateNode={updateNode}
                onUpdateTask={updateTask}
                onUpdatePair={updatePair}
                onAddPair={() => void addPair()}
                onNewVersion={() => void createNextVersion()}
                onSave={() => void save()}
                onLifecycle={(action) => void lifecycle(action)}
                readiness={readiness}
              />
            ) : (
              <StatePanel title="Chọn một nội dung để chỉnh sửa hoặc tạo nội dung mới.">
                Bắt đầu bằng nút <strong>+ Tạo nội dung mới</strong> để chọn Môn
                học, Chủ đề và Kỹ năng nhỏ.
              </StatePanel>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function RevisionRow({
  revision,
  selected,
  onSelect,
}: {
  revision: Revision;
  selected: boolean;
  onSelect: () => void;
}) {
  const node = firstNode(revision);
  return (
    <button
      className="ops-revision-row"
      data-selected={selected || undefined}
      onClick={onSelect}
    >
      <span>
        <strong>{node?.subject?.label ?? "Môn học chưa đặt"}</strong>
        <small>
          {node?.topic?.label ?? "Chủ đề chưa đặt"} ·{" "}
          {node?.microSkill?.title ?? revision.id}
        </small>
      </span>
      <Status tone={tone(revision.lifecycle)}>{revision.lifecycle}</Status>
    </button>
  );
}
function CreationForm({
  form,
  existing,
  saving,
  error,
  onChange,
  onCancel,
  onCreate,
}: {
  form: { subjectLabel: string; topicLabel: string; microSkillTitle: string };
  existing: Revision[];
  saving: boolean;
  error?: string | undefined;
  onChange: (form: {
    subjectLabel: string;
    topicLabel: string;
    microSkillTitle: string;
  }) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const subjects = [
    ...new Set(
      existing
        .flatMap((r) => r.body.microSkills ?? [])
        .map((node) => node.subject?.label)
        .filter(Boolean),
    ),
  ] as string[];
  const topics = [
    ...new Set(
      existing
        .flatMap((revision) => revision.body.microSkills ?? [])
        .filter((node) => node.subject?.label === form.subjectLabel)
        .map((node) => node.topic?.label)
        .filter(Boolean),
    ),
  ] as string[];
  return (
    <>
      <div className="ops-editor-heading">
        <div>
          <div className="section-label">NỘI DUNG MỚI</div>
          <h2>Tạo MicroSkill đầu tiên</h2>
          <p className="ops-note">
            Chỉ nhập tên học thuật. Hệ thống sẽ tạo ID và phiên bản bản nháp cho
            bạn.
          </p>
        </div>
        <Status tone="uncertain">DRAFT</Status>
      </div>
      {error ? (
        <StatePanel tone="error" title="Chưa tạo được nội dung">
          {error}
        </StatePanel>
      ) : null}
      <section className="ops-section">
        <div className="section-label">1 · MÔN HỌC</div>
        {subjects.length ? (
          <label className="field">
            <span>Dùng môn học đã có</span>
            <select
              aria-label="Dùng môn học đã có"
              value=""
              onChange={(event) => {
                if (event.target.value)
                  onChange({
                    ...form,
                    subjectLabel: event.target.value,
                    topicLabel: "",
                  });
              }}
            >
              <option value="">Tạo môn học mới</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <TextField
          id="ops-create-subject"
          label="Tên môn học"
          note={
            subjects.length
              ? `Có thể nhập tên trùng để dùng Môn học đã có: ${subjects.join(", ")}.`
              : "Ví dụ: Toán 10"
          }
          value={form.subjectLabel}
          onChange={(e) => onChange({ ...form, subjectLabel: e.target.value })}
        />
      </section>
      <section className="ops-section">
        <div className="section-label">2 · CHỦ ĐỀ</div>
        {topics.length ? (
          <label className="field">
            <span>Dùng chủ đề đã có</span>
            <select
              aria-label="Dùng chủ đề đã có"
              value=""
              onChange={(event) => {
                if (event.target.value)
                  onChange({ ...form, topicLabel: event.target.value });
              }}
            >
              <option value="">Tạo chủ đề mới</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <TextField
          id="ops-create-topic"
          label="Tên chủ đề"
          note="Ví dụ: Hàm số bậc hai"
          value={form.topicLabel}
          onChange={(e) => onChange({ ...form, topicLabel: e.target.value })}
        />
      </section>
      <section className="ops-section">
        <div className="section-label">3 · KỸ NĂNG NHỎ</div>
        <TextField
          id="ops-create-microskill"
          label="Tên kỹ năng"
          note="Ví dụ: Xác định dấu của tam thức bậc hai từ nghiệm và hệ số a."
          value={form.microSkillTitle}
          onChange={(e) =>
            onChange({ ...form, microSkillTitle: e.target.value })
          }
        />
      </section>
      <div className="state-panel-actions">
        <Button tone="quiet" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          loading={saving}
          disabled={
            !form.subjectLabel.trim() ||
            !form.topicLabel.trim() ||
            !form.microSkillTitle.trim()
          }
          onClick={onCreate}
        >
          Tạo bản nháp
        </Button>
      </div>
    </>
  );
}
function Editor({
  revision,
  node,
  editable,
  saving,
  dirty,
  error,
  onUpdateNode,
  onUpdateTask,
  onUpdatePair,
  onAddPair,
  onNewVersion,
  onSave,
  onLifecycle,
  readiness,
}: {
  revision: Revision;
  node: Node;
  editable: boolean;
  saving: boolean;
  dirty: boolean;
  error?: string | undefined;
  onUpdateNode: (change: (node: Node) => Node) => void;
  onUpdateTask: (
    index: number,
    role: "practiceContent" | "transferContent",
    change: (task: Task) => Task,
  ) => void;
  onUpdatePair: (index: number, change: (pair: Pair) => Pair) => void;
  onAddPair: () => void;
  onNewVersion: () => void;
  onSave: () => void;
  onLifecycle: (action: "review" | "approve" | "publish" | "deprecate") => void;
  readiness?: { ready: boolean; issues: string[] } | undefined;
}) {
  const pairs = node.pairs ?? [];
  const updateLabel = (
    path: "subject" | "topic" | "microSkill",
    key: "label" | "title",
    value: string,
  ) =>
    onUpdateNode((current) => ({
      ...current,
      [path]: { ...current[path], [key]: value },
    }));
  return (
    <>
      <div className="ops-editor-heading">
        <div>
          <div className="section-label">PHIÊN BẢN {revision.lifecycle}</div>
          <h2>{node.microSkill?.title ?? "Kỹ năng chưa đặt tên"}</h2>
          <p className="ops-note">
            {dirty ? "Chưa lưu" : "Đã lưu"} · ID kỹ thuật được hệ thống quản lý.
          </p>
        </div>
        <Status tone={tone(revision.lifecycle)}>{revision.lifecycle}</Status>
      </div>
      {error ? (
        <StatePanel
          tone="error"
          title="Thao tác chưa hoàn tất"
          actions={
            <Button tone="quiet" onClick={onSave}>
              Thử lưu lại
            </Button>
          }
        >
          {error}
        </StatePanel>
      ) : null}
      {editable ? (
        <>
          <section className="ops-section">
            <div className="section-label">A · THÔNG TIN KỸ NĂNG</div>
            <div className="ops-fields">
              <TextField
                id="ops-subject"
                label="Môn học"
                value={node.subject?.label ?? ""}
                onChange={(e) =>
                  updateLabel("subject", "label", e.target.value)
                }
              />
              <TextField
                id="ops-topic"
                label="Chủ đề"
                value={node.topic?.label ?? ""}
                onChange={(e) => updateLabel("topic", "label", e.target.value)}
              />
              <TextField
                id="ops-microskill"
                label="Tên kỹ năng"
                value={node.microSkill?.title ?? ""}
                onChange={(e) =>
                  updateLabel("microSkill", "title", e.target.value)
                }
              />
            </div>
          </section>
          <section className="ops-section">
            <div className="section-label">
              B / C / D · BÀI LUYỆN, BÀI VẬN DỤNG VÀ GHÉP CẶP
            </div>
            <p className="ops-note">
              Mỗi hàng là một cặp: Bài luyện 1 ↔ Bài vận dụng 1. Bạn có thể thêm
              nhiều cặp để có nhiều tình huống độc lập.
            </p>
            <Button tone="quiet" loading={saving} onClick={onAddPair}>
              + Thêm cặp Bài luyện – Bài vận dụng
            </Button>
            {pairs.map((pair, index) => (
              <PairEditor
                key={pair.id}
                pair={pair}
                index={index}
                onTask={onUpdateTask}
                onPair={onUpdatePair}
              />
            ))}
          </section>
          <section className="ops-section">
            <div className="section-label">
              E · ĐIỀU KIỆN CHUYỂN SANG BÀI VẬN DỤNG
            </div>
            <div className="ops-fields ops-fields--compact">
              <TextField
                id="ops-required-correct"
                label="Số bài luyện cần làm đúng"
                type="number"
                min="1"
                value={String(node.practiceGate?.requiredCorrectCount ?? 1)}
                onChange={(e) =>
                  onUpdateNode((current) => ({
                    ...current,
                    practiceGate: {
                      policyVersion: "practice-gate/v1",
                      strategy: "distinct-correct-count",
                      ...current.practiceGate,
                      requiredCorrectCount: Number(e.target.value),
                    },
                  }))
                }
              />
              <TextField
                id="ops-max-items"
                label="Số bài luyện tối đa"
                type="number"
                min="1"
                value={String(
                  node.practiceGate?.maxPracticeItems ??
                    Math.max(1, pairs.length),
                )}
                onChange={(e) =>
                  onUpdateNode((current) => ({
                    ...current,
                    practiceGate: {
                      policyVersion: "practice-gate/v1",
                      strategy: "distinct-correct-count",
                      ...current.practiceGate,
                      maxPracticeItems: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <p className="ops-note">
              Học sinh phải làm đúng các bài luyện khác nhau trước khi chuyển
              sang Bài vận dụng độc lập. Server kiểm tra số cặp khi publish.
            </p>
          </section>
          <Preview node={node} lifecycle={revision.lifecycle} />
          <ReviewReadiness readiness={readiness} />
          <div className="state-panel-actions">
            <Button loading={saving} onClick={onSave}>
              Lưu bản nháp
            </Button>
            <Button
              tone="secondary"
              loading={saving}
              onClick={() => onLifecycle("review")}
            >
              Gửi duyệt
            </Button>
          </div>
        </>
      ) : (
        <>
          <StatePanel tone="uncertain" title="Revision bất biến">
            {revision.lifecycle} đã được khóa. Hãy tạo phiên bản mới để thay đổi
            nội dung.
          </StatePanel>
          <Preview node={node} lifecycle={revision.lifecycle} />
          <div className="state-panel-actions">
            {revision.lifecycle === "APPROVED" ||
            revision.lifecycle === "PUBLISHED" ||
            revision.lifecycle === "DEPRECATED" ? (
              <Button loading={saving} onClick={onNewVersion}>
                Tạo phiên bản mới
              </Button>
            ) : null}
            {revision.lifecycle === "IN_REVIEW" ? (
              <Button loading={saving} onClick={() => onLifecycle("approve")}>
                Duyệt nội dung
              </Button>
            ) : null}
            {revision.lifecycle === "APPROVED" ? (
              <Button loading={saving} onClick={() => onLifecycle("publish")}>
                Xuất bản
              </Button>
            ) : null}
            {revision.lifecycle === "PUBLISHED" ? (
              <Button
                tone="quiet"
                loading={saving}
                onClick={() => onLifecycle("deprecate")}
              >
                Ngừng xuất bản
              </Button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
function PairEditor({
  pair,
  index,
  onTask,
  onPair,
}: {
  pair: Pair;
  index: number;
  onTask: (
    index: number,
    role: "practiceContent" | "transferContent",
    change: (task: Task) => Task,
  ) => void;
  onPair: (index: number, change: (pair: Pair) => Pair) => void;
}) {
  return (
    <article className="ops-pair">
      <div className="ops-pair-heading">
        <strong>Cặp {index + 1}</strong>
        <small>
          Bài luyện {index + 1} ↔ Bài vận dụng {index + 1}
        </small>
      </div>
      <TaskEditor
        title={`Bài luyện ${index + 1}`}
        task={pair.practiceContent ?? {}}
        practice
        index={index}
        role="practiceContent"
        onTask={onTask}
      />
      <TaskEditor
        title={`Bài vận dụng ${index + 1}`}
        task={pair.transferContent ?? {}}
        index={index}
        role="transferContent"
        onTask={onTask}
      />
      <div className="ops-pair-fields">
        <TextField
          id={`ops-reveal-title-${index}`}
          label="Giải thích sau Bài vận dụng"
          value={pair.connectionReveal?.title ?? ""}
          onChange={(e) =>
            onPair(index, (current) => ({
              ...current,
              connectionReveal: {
                ...current.connectionReveal,
                title: e.target.value,
              },
            }))
          }
        />
        <WrittenSolutionField
          id={`ops-reveal-body-${index}`}
          label="Giải thích mối liên hệ"
          rows={3}
          value={pair.connectionReveal?.explanation?.body ?? ""}
          onChange={(e) =>
            onPair(index, (current) => ({
              ...current,
              connectionReveal: {
                ...current.connectionReveal,
                explanation: { format: "plain_text", body: e.target.value },
              },
            }))
          }
        />
        <TextField
          id={`ops-reveal-relation-${index}`}
          label="Điểm cần học sinh rút ra"
          value={pair.connectionReveal?.sharedRelation ?? ""}
          onChange={(e) =>
            onPair(index, (current) => ({
              ...current,
              connectionReveal: {
                ...current.connectionReveal,
                sharedRelation: e.target.value,
              },
            }))
          }
        />
      </div>
    </article>
  );
}
function TaskEditor({
  title,
  task,
  practice,
  index,
  role,
  onTask,
}: {
  title: string;
  task: Task;
  practice?: boolean;
  index: number;
  role: "practiceContent" | "transferContent";
  onTask: (
    index: number,
    role: "practiceContent" | "transferContent",
    change: (task: Task) => Task,
  ) => void;
}) {
  const spec = task.answerSpec ?? initialAnswer("exact_text");
  const kind = (spec.kind ?? "exact_text") as AnswerKind;
  const set = (change: (current: Task) => Task) => onTask(index, role, change);
  return (
    <div className="ops-task-editor">
      <div className="section-label">{title}</div>
      {!practice ? (
        <p className="ops-note">Không có gợi ý AI trước khi nộp.</p>
      ) : null}
      <WrittenSolutionField
        id={`ops-${role}-prompt-${index}`}
        label="Đề bài"
        rows={3}
        value={task.prompt?.body ?? ""}
        onChange={(e) =>
          set((current) => ({
            ...current,
            prompt: { format: "plain_text", body: e.target.value },
          }))
        }
      />
      <label className="field">
        <span>Kiểu trả lời</span>
        <select
          value={kind}
          onChange={(e) =>
            set((current) => ({
              ...current,
              answerSpec: initialAnswer(e.target.value as AnswerKind),
            }))
          }
        >
          <option value="exact_text">Câu trả lời ngắn</option>
          <option value="numeric">Số</option>
          <option value="expression">Biểu thức</option>
          <option value="written_solution">Bài giải tự luận</option>
        </select>
      </label>
      {kind === "exact_text" ? (
        <TextField
          id={`ops-${role}-answer-${index}`}
          label="Đáp án chấp nhận"
          note="Có thể ghi nhiều đáp án, ngăn cách bằng dấu ;"
          value={(spec.accepted ?? []).join("; ")}
          onChange={(e) =>
            set((current) => ({
              ...current,
              answerSpec: {
                ...spec,
                accepted: e.target.value
                  .split(";")
                  .map((value) => value.trim())
                  .filter(Boolean),
              },
            }))
          }
        />
      ) : null}
      {kind === "numeric" || kind === "expression" ? (
        <TextField
          id={`ops-${role}-expected-${index}`}
          label="Đáp án kỳ vọng"
          value={spec.expected ?? ""}
          onChange={(e) =>
            set((current) => ({
              ...current,
              answerSpec: { ...spec, expected: e.target.value },
            }))
          }
        />
      ) : null}
      {kind === "written_solution" ? (
        <RubricEditor
          spec={spec}
          practice={!!practice}
          onChange={(next) =>
            set((current) => ({ ...current, answerSpec: next }))
          }
        />
      ) : null}
      {practice ? (
        <p className="ops-note">
          AI chỉ hỗ trợ trong Bài luyện và không quyết định kết quả chấm.
        </p>
      ) : null}
    </div>
  );
}
function RubricEditor({
  spec,
  practice,
  onChange,
}: {
  spec: AnswerSpec;
  practice: boolean;
  onChange: (spec: AnswerSpec) => void;
}) {
  const assessment =
    spec.assessment ?? initialAnswer("written_solution").assessment!;
  const criteria = assessment.criteria ?? [];
  const update = (change: (current: typeof assessment) => typeof assessment) =>
    onChange({ ...spec, assessment: change(assessment) });
  return (
    <div className="ops-rubric">
      <div className="section-label">TIÊU CHÍ ĐÁNH GIÁ</div>
      <TextField
        id="ops-rubric-result"
        label="Kết quả mong đợi"
        value={assessment.expectedResult ?? ""}
        onChange={(e) =>
          update((current) => ({ ...current, expectedResult: e.target.value }))
        }
      />
      <WrittenSolutionField
        id="ops-rubric-reference"
        label="Một bài giải tham khảo"
        rows={3}
        value={assessment.referenceSolutions?.[0]?.body ?? ""}
        onChange={(e) =>
          update((current) => ({
            ...current,
            referenceSolutions: [
              { format: "plain_text", body: e.target.value },
            ],
          }))
        }
      />
      {criteria.map((criterion, index) => (
        <div className="ops-inline-fields" key={criterion.id}>
          <TextField
            id={`ops-criterion-${criterion.id}`}
            label={`Tiêu chí ${index + 1}`}
            value={criterion.description}
            onChange={(e) =>
              update((current) => ({
                ...current,
                criteria: (current.criteria ?? []).map((item, i) =>
                  i === index ? { ...item, description: e.target.value } : item,
                ),
                gradingShape: {
                  ...current.gradingShape!,
                  requiredCriterionIds:
                    current.gradingShape?.requiredCriterionIds ?? [],
                },
              }))
            }
          />
          <Button
            tone="quiet"
            aria-label={`Xóa tiêu chí ${index + 1}`}
            onClick={() =>
              update((current) => ({
                ...current,
                criteria: (current.criteria ?? []).filter(
                  (_, i) => i !== index,
                ),
                gradingShape: {
                  ...current.gradingShape!,
                  requiredCriterionIds: (
                    current.gradingShape?.requiredCriterionIds ?? []
                  ).filter((id) => id !== criterion.id),
                },
              }))
            }
          >
            Xóa
          </Button>
        </div>
      ))}
      <Button
        tone="quiet"
        onClick={() =>
          update((current) => {
            const id = `criterion_${criteria.length + 1}`;
            return {
              ...current,
              criteria: [...(current.criteria ?? []), { id, description: "" }],
              gradingShape: {
                ...current.gradingShape!,
                requiredCriterionIds: [
                  ...(current.gradingShape?.requiredCriterionIds ?? []),
                  id,
                ],
              },
            };
          })
        }
      >
        + Thêm tiêu chí
      </Button>
      {practice ? (
        <TextField
          id="ops-ai-guidance"
          label="Điều AI được phép gợi ý"
          note="Mô tả khái niệm hoặc chiến lược, không ghi đáp án cuối cùng."
          value={(assessment.commonMisconceptions ?? []).join("; ")}
          onChange={(e) =>
            update((current) => ({
              ...current,
              commonMisconceptions: e.target.value
                .split(";")
                .map((value) => value.trim())
                .filter(Boolean),
            }))
          }
        />
      ) : null}
    </div>
  );
}
const readinessMessage = (issue: string): string =>
  ({
    EMPTY_PUBLISHED_PAIR_BANK: "Chưa có cặp Bài luyện – Bài vận dụng.",
    MISSING_PRACTICE_GATE: "Chưa đặt điều kiện chuyển sang Bài vận dụng.",
    INVALID_PRACTICE_GATE: "Điều kiện luyện tập chưa hợp lệ.",
    INSUFFICIENT_PRACTICE_PAIR_BANK:
      "Cần thêm cặp tình huống để đủ số bài luyện tối đa.",
    INVALID_PAIR_BANK_RELATION:
      "Một cặp bài chưa có đủ đề bài, đáp án hoặc nội dung Reveal.",
    INVALID_ANSWER_SPEC: "Một bài chưa có kiểu trả lời hoặc đáp án hợp lệ.",
    INVALID_REVIEWED_RUBRIC: "Rubric bài tự luận chưa hợp lệ.",
  })[issue] ?? "Một phần nội dung chưa sẵn sàng để gửi duyệt.";

function ReviewReadiness({
  readiness,
}: {
  readiness?: { ready: boolean; issues: string[] } | undefined;
}) {
  return (
    <section className="ops-section">
      <div className="section-label">I · KIỂM TRA TRƯỚC KHI GỬI DUYỆT</div>
      <p className="ops-note">
        {!readiness
          ? "Server sẽ kiểm tra nội dung khi bạn lưu hoặc gửi duyệt."
          : readiness.ready
            ? "Nội dung đã sẵn sàng để gửi server kiểm tra khi review/publish."
            : `Cần hoàn thiện: ${readiness.issues.map(readinessMessage).join(" ")}`}
      </p>
    </section>
  );
}
function Preview({ node, lifecycle }: { node: Node; lifecycle: Lifecycle }) {
  return (
    <section className="ops-preview">
      <Divider />
      <div className="section-label">XEM TRƯỚC · {lifecycle}</div>
      <h3>{node.microSkill?.title ?? "Kỹ năng"}</h3>
      <p className="ops-note">
        Đang xem trước đúng body của revision. Transfer không mang Practice
        assistance sang.
      </p>
      {node.pairs?.map((pair, index) => (
        <div className="ops-preview-pair" key={pair.id}>
          <div>
            <div className="section-label">BÀI LUYỆN {index + 1}</div>
            <p>{pair.practiceContent?.prompt?.body ?? "Chưa có đề bài"}</p>
          </div>
          <div>
            <div className="section-label">BÀI VẬN DỤNG {index + 1}</div>
            <p>{pair.transferContent?.prompt?.body ?? "Chưa có đề bài"}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
