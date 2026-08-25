type ButtonTone = "primary" | "secondary" | "quiet";
type StatusTone = "success" | "partial" | "uncertain" | "danger";
type PanelTone = "default" | "partial" | "uncertain" | "error";

export function Button({ children, tone = "primary", loading = false, disabled = false, type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { readonly tone?: ButtonTone; readonly loading?: boolean }) {
  return <button {...props} aria-busy={loading || undefined} className={`ui-button ui-button--${tone}`} data-loading={loading} disabled={loading || disabled} type={type}>{loading ? "Đang xử lý…" : children}</button>;
}

export function TextField({ label, note, name, autoComplete = "off", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { readonly label: string; readonly note?: string }) {
  return <div className="ui-field"><label htmlFor={props.id}>{label}</label><input autoComplete={autoComplete} className="ui-input" name={name ?? props.id} {...props}/>{note ? <span className="ui-field-note">{note}</span> : null}</div>;
}

export function WrittenSolutionField({ label = "Cách bạn lập luận", note, name, autoComplete = "off", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { readonly label?: string; readonly note?: string }) {
  return <div className="ui-field"><label htmlFor={props.id}>{label}</label><textarea autoComplete={autoComplete} className="ui-textarea" name={name ?? props.id} {...props}/>{note ? <span className="ui-field-note">{note}</span> : null}</div>;
}

export function Status({ tone, children }: { readonly tone: StatusTone; readonly children: React.ReactNode }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}

export function FeedbackSurface({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return <section className="feedback-surface"><h2>{title}</h2><div>{children}</div></section>;
}

export function StatePanel({ tone = "default", title, children, actions }: { readonly tone?: PanelTone; readonly title: string; readonly children: React.ReactNode; readonly actions?: React.ReactNode }) {
  return <section className="state-panel" data-tone={tone}><h2>{title}</h2><p>{children}</p>{actions ? <div className="state-panel-actions">{actions}</div> : null}</section>;
}

export function Skeleton({ title = false }: { readonly title?: boolean }) { return <div className={`skeleton ${title ? "skeleton--title" : "skeleton--body"}`} aria-hidden="true"/>; }

export function Divider() { return <div className="ui-divider" role="separator"/>; }
