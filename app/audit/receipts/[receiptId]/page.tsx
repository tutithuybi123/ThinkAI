import {RestrictedAuditPage}from"../../../components/restricted-audit-page.js";
export default async function AuditReceipt({params}:{params:Promise<{receiptId:string}>}){return <RestrictedAuditPage receiptId={(await params).receiptId}/>;}
