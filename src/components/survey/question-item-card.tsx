import { Card } from "@heroui/react";

interface Props {
  children: React.ReactNode;
}

export function QuestionItemCard({ children }: Props) {
  return (
    <Card className="w-full border border-border">
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
