import type { AssistanceRecord } from "./contracts.js";
import type { AssistanceLevel } from "./contracts.js";
import { classifyCompanionCandidate, type CompanionCandidate } from "./classifier.js";
import { recordAssistance } from "./service.js";
export interface PracticeCompanionTaskContext {
  readonly practiceTaskId: string;
  readonly practiceTaskVersion: string;
  readonly prompt: string;
  readonly commonMisconceptions: readonly string[];
  readonly allowedSupportLevels: readonly Exclude<AssistanceLevel,"NONE">[];
}
export interface PracticeCompanionProvider { reply(input:{readonly learnerMessage:string;readonly guidanceVersion:string;readonly taskContext:PracticeCompanionTaskContext}):Promise<unknown>; }
export interface CompanionInteraction { readonly delivery?:string; readonly record:AssistanceRecord; }
/** Practice-only server boundary. The provider never supplies authoritative facts. */
export class PracticeCompanionService { constructor(private readonly provider:PracticeCompanionProvider,private readonly now=()=>new Date()){} async respond(input:{learnerMessage:string;guidanceVersion:string;messageId:string;taskContext:PracticeCompanionTaskContext}):Promise<CompanionInteraction>{const candidate=classifyCompanionCandidate(await this.provider.reply({learnerMessage:input.learnerMessage,guidanceVersion:input.guidanceVersion,taskContext:input.taskContext}) as CompanionCandidate);const supportLevel=input.taskContext.allowedSupportLevels.includes(candidate.supportLevel)?candidate.supportLevel:"PROMPT";const record=recordAssistance({supportLevel,messageId:input.messageId,occurredAt:this.now().toISOString(),answerRevealAttempted:candidate.answerRevealAttempted,answerRevealed:false,responseBlocked:candidate.responseBlocked});return Object.freeze({...(!candidate.responseBlocked&&candidate.reply?{delivery:candidate.reply}:{}),record});} }
