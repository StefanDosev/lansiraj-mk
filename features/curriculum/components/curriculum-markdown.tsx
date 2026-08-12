import Markdown, { defaultUrlTransform, type Components } from "react-markdown";

/* eslint-disable @typescript-eslint/no-unused-vars -- react-markdown injects AST nodes that must not reach native DOM elements. */

const allowedElements = [
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "code",
  "pre",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

const components: Components = {
  h1: ({ node: _node, ...props }) => <h3 className="font-display text-xl font-semibold leading-snug text-ink" {...props} />,
  h2: ({ node: _node, ...props }) => <h3 className="font-display text-xl font-semibold leading-snug text-ink" {...props} />,
  h3: ({ node: _node, ...props }) => <h3 className="font-display text-lg font-semibold leading-snug text-ink" {...props} />,
  p: ({ node: _node, ...props }) => <p className="leading-relaxed text-stone-700" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="list-disc space-y-2 pl-6 text-stone-700" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="list-decimal space-y-2 pl-6 text-stone-700" {...props} />,
  li: ({ node: _node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-ink" {...props} />,
  a: ({ node: _node, href, ...props }) => {
    const external = href?.startsWith("http://") || href?.startsWith("https://");
    return (
      <a
        className="font-semibold text-cobalt underline decoration-2 underline-offset-4"
        href={href}
        rel={external ? "noreferrer noopener" : undefined}
        target={external ? "_blank" : undefined}
        {...props}
      />
    );
  },
  code: ({ node: _node, ...props }) => <code className="rounded-sm bg-stone-100 px-1.5 py-0.5 text-sm text-ink" {...props} />,
  pre: ({ node: _node, ...props }) => <pre className="overflow-x-auto rounded-md border border-stone-300 bg-stone-100 p-4 text-sm text-ink" {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote className="border-l-2 border-cobalt pl-4 text-stone-700" {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => <th className="border border-stone-300 bg-stone-100 p-3 font-semibold text-ink" {...props} />,
  td: ({ node: _node, ...props }) => <td className="border border-stone-300 p-3 text-stone-700" {...props} />,
};

type CurriculumMarkdownProps = {
  children: string;
};

export function CurriculumMarkdown({ children }: CurriculumMarkdownProps) {
  return (
    <div className="space-y-4">
      <Markdown
        allowedElements={[...allowedElements]}
        components={components}
        skipHtml
        urlTransform={defaultUrlTransform}
      >
        {children}
      </Markdown>
    </div>
  );
}
