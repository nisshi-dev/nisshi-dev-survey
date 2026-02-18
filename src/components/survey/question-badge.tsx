interface Props {
  index: number;
}

export function QuestionBadge({ index }: Props) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-sm">
      {index}
    </span>
  );
}
