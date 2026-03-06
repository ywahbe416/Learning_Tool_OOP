import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  source: string;
}

export default function ConceptSection({ source }: Props) {
  return (
    <div className="prose prose-invert prose-slate max-w-none
      prose-headings:text-slate-100
      prose-p:text-slate-300
      prose-strong:text-slate-200
      prose-code:text-indigo-300
      prose-code:bg-slate-800
      prose-code:px-1
      prose-code:py-0.5
      prose-code:rounded
      prose-pre:bg-slate-800
      prose-pre:border
      prose-pre:border-slate-700
      prose-table:text-slate-300
      prose-th:text-slate-200
      prose-a:text-indigo-400
      prose-hr:border-slate-700
    ">
      <MDXRemote source={source} />
    </div>
  );
}
