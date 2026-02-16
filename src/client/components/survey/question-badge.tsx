interface Props {
  index: number;
}

export function QuestionBadge({ index }: Props) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-xs">
      {index}
    </span>
  );
}
