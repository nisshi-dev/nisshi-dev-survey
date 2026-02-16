import { Button, Card, Chip, Spinner } from "@heroui/react";
import { Link } from "react-router-dom";
import { useGetApiAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";
import {
  SURVEY_STATUS_LABELS,
  type SurveyStatus,
} from "@/shared/schema/survey";

const statusColorMap: Record<SurveyStatus, "default" | "success" | "warning"> =
  {
    draft: "default",
    active: "success",
    completed: "warning",
  };

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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
          <Card.Content className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted">アンケートがまだありません。</p>
            <p className="text-muted text-sm">
              アンケートを作成して、チームやユーザーからフィードバックを集めましょう。
            </p>
            <Button variant="secondary">
              <Link to="/admin/surveys/new">最初のアンケートを作成</Link>
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card>
          <Card.Content className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-4 py-3 font-medium text-muted">タイトル</th>
                  <th className="px-4 py-3 font-medium text-muted">
                    ステータス
                  </th>
                  <th className="px-4 py-3 font-medium text-muted">作成日</th>
                  <th className="px-4 py-3 font-medium text-muted">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => (
                  <tr
                    className="border-border/50 border-b transition-colors last:border-b-0 hover:bg-surface-secondary"
                    key={s.id}
                  >
                    <td className="px-4 py-3">
                      <Link
                        className="text-foreground hover:text-accent"
                        to={`/admin/surveys/${s.id}`}
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        color={
                          statusColorMap[(s.status as SurveyStatus) ?? "draft"]
                        }
                        size="sm"
                        variant="soft"
                      >
                        {SURVEY_STATUS_LABELS[s.status as SurveyStatus] ??
                          s.status}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {dateFormatter.format(new Date(s.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="text-accent hover:underline"
                        to={`/admin/surveys/${s.id}`}
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
