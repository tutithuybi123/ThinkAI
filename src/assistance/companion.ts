import type { AssistanceRecord } from "./contracts.js";
import { classifyCompanionCandidate, type CompanionCandidate } from "./classifier.js";
import { recordAssistance } from "./service.js";
export interface PracticeCompanionProvider { reply(input:{readonly learnerMessage:string;readonly guidanceVersion:string}):Promise<unknown>; }
export interface CompanionInteraction { readonly delivery?:string; readonly record:AssistanceRecord; }
/** Practice-only server boundary. The provider never supplies authoritative facts. */
export class PracticeCompanionService { constructor(private readonly provider:PracticeCompanionProvider,private readonly now=()=>new Date()){} async respond(input:{learnerMessage:string;guidanceVersion:string;messageId:string}):Promise<CompanionInteraction>{const candidate=classifyCompanionCandidate(await this.provider.reply({learnerMessage:input.learnerMessage,guidanceVersion:input.guidanceVersion}) as CompanionCandidate);const record=recordAssistance({supportLevel:candidate.supportLevel,messageId:input.messageId,occurredAt:this.now().toISOString(),answerRevealAttempted:candidate.answerRevealAttempted,answerRevealed:false,responseBlocked:candidate.responseBlocked});return Object.freeze({...(!candidate.responseBlocked&&candidate.reply?{delivery:candidate.reply}:{}),record});} }
