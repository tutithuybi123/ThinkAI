import {ReceiptPage}from"../../../components/receipt-page.js";
export default async function Receipt({params}:{params:Promise<{receiptId:string}>}){return <ReceiptPage receiptId={(await params).receiptId}/>;}
