import type { FoundationRoute } from "../../src/frontend/foundation.js";

const destinations: ReadonlyArray<{ readonly href: string; readonly label: string; readonly route: FoundationRoute }> = [
  { href: "/", label: "Trang chủ", route: "home" },
  { href: "/learn", label: "Học", route: "learn" },
  { href: "/progress", label: "Tiến độ", route: "progress" },
];

export function AppShell({ active, context, children }: { readonly active: FoundationRoute; readonly context?: string; readonly children: React.ReactNode }) {
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <header className="app-dock">
      <a className="dock-brand" href="/">THINKAI</a>
      <nav className="dock-nav" aria-label="Điều hướng chính">
        {destinations.map((destination) => <a aria-current={active === destination.route ? "page" : undefined} href={destination.href} key={destination.href}>{destination.label}</a>)}
      </nav>
      {context ? <div className="dock-context"><div><span>ĐANG HỌC</span><strong>{context}</strong></div></div> : null}
      <a className="ui-button ui-button--secondary dock-action" href="/learn#subjects">Khám phá môn học</a>
      <details className="dock-mobile">
        <summary>Menu</summary>
        <nav aria-label="Điều hướng di động">
          {destinations.map((destination) => <a aria-current={active === destination.route ? "page" : undefined} href={destination.href} key={destination.href}>{destination.label}</a>)}
          <a href="/learn#subjects">Khám phá môn học</a>
        </nav>
      </details>
    </header>
    {context ? <div className="dock-compact-context"><span>ĐANG HỌC</span><strong>{context}</strong></div> : null}
    {children}
  </div>;
}
