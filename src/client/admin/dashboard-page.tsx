import { Button, Card, Spinner } from "@heroui/react";
import { Link } from "react-router-dom";
import { useGetApiAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";

export function DashboardPage() {
  const { data, isLoading } = useGetApiAdminSurveys();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner aria-label="読み込み中" />
        <p className="ml-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  const surveys = data.data.surveys;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">ダッシュボード</h1>
        <Button variant="secondary">
          <Link to="/admin/surveys/new">新規作成</Link>
        </Button>
      </div>
      {surveys.length === 0 ? (
        <Card>
          <Card.Content className="py-8 text-center">
            <p className="text-muted">アンケートがまだありません。</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {surveys.map((s) => (
            <Card key={s.id}>
              <Card.Header>
                <Card.Title>
                  <Link
                    className="text-foreground hover:text-accent"
                    to={`/admin/surveys/${s.id}`}
                  >
                    {s.title}
                  </Link>
                </Card.Title>
              </Card.Header>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
