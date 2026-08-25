"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** Learner-safe authored/AI text: Markdown is parsed without raw HTML and math is rendered with KaTeX. */
export function RichText({ children }: { readonly children: string }) {
  return <div className="rich-text"><ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[[rehypeKatex, { output: "htmlAndMathml", throwOnError: false, trust: false, strict: false }]]}
  >{normalizeMathDelimiters(children)}</ReactMarkdown></div>;
}

function normalizeMathDelimiters(value: string): string {
  return value.replace(/\\\[([\s\S]*?)\\\]/g, (_, math: string) => `\n\n$$\n${math}\n$$\n\n`).replace(/\\\(([\s\S]*?)\\\)/g, (_, math: string) => `$${math}$`);
}
