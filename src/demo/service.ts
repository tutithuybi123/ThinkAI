import type { MemoryPersistenceDatabase } from "../persistence/index.js";

export type DemoProfile = "clean" | "history";
export interface DemoResetResult { readonly profile: DemoProfile; readonly resetAt: string; readonly provenance: "seeded_demo" | "historical_seed"; }
export interface HealthView { readonly status: "ok"; readonly persistence: "available"; readonly ai: "disabled"; }

/** In-memory demo controller. The production database adapter supplies the same atomic replacement boundary later. */
export class DemoService {
  private readonly cleanState: unknown;
  private readonly historyState: unknown;
  public constructor(private readonly database: MemoryPersistenceDatabase, private readonly presenterSecret: string, historySeed?: unknown, private readonly now = () => new Date()) {
    this.cleanState = structuredClone(database.state);
    this.historyState = structuredClone(historySeed ?? database.state);
  }
  public reset(input: { readonly presenterSecret: string; readonly profile: DemoProfile }): DemoResetResult {
    if (input.presenterSecret !== this.presenterSecret) throw new Error("DEMO_RESET_FORBIDDEN");
    this.database.state = structuredClone((input.profile === "clean" ? this.cleanState : this.historyState) as typeof this.database.state);
    return Object.freeze({ profile: input.profile, resetAt: this.now().toISOString(), provenance: input.profile === "history" ? "historical_seed" : "seeded_demo" });
  }
  public health(): HealthView { return Object.freeze({ status: "ok", persistence: "available", ai: "disabled" }); }
}
