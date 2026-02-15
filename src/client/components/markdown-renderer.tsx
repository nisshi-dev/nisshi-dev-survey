import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string | null | undefined;
  className?: string;
}

export function MarkdownRenderer({ content, className }: Props) {
  if (!content) {
    return null;
  }
  return (
    <div className={`prose prose-sm max-w-none ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
