import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  source: string;
}

export default function ConceptSection({ source }: Props) {
  return (
    <div className="prose prose-invert prose-slate max-w-none
      prose-h1:hidden
      prose-headings:text-slate-100
      prose-headings:font-semibold
      prose-h2:border-b
      prose-h2:border-slate-800
      prose-h2:pb-2
      prose-p:text-slate-300
      prose-p:leading-7
      prose-li:text-slate-300
      prose-strong:text-slate-200
      prose-code:text-cyan-300
      prose-code:bg-slate-800
      prose-code:px-1
      prose-code:py-0.5
      prose-code:rounded
      prose-pre:bg-slate-900
      prose-pre:border
      prose-pre:border-slate-800
      prose-blockquote:border-cyan-400
      prose-blockquote:text-slate-300
      prose-table:text-slate-300
      prose-th:text-slate-200
      prose-a:text-cyan-300
      prose-hr:border-slate-700
    ">
      <MDXRemote source={source} />
    </div>
  );
}
