import { Button, Card, Chip, Spinner } from "@heroui/react";
import { Link } from "react-router-dom";
import { useGetAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";
import {
  SURVEY_STATUS_COLOR_MAP,
  SURVEY_STATUS_LABELS,
  type SurveyStatus,
} from "@/types/survey";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <Card.Content className="py-4">
        <p className="text-muted text-xs">{label}</p>
        <p className="font-bold text-2xl tabular-nums">{value}</p>
      </Card.Content>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useGetAdminSurveys();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner aria-label="読み込み中" />
        <p className="ml-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  const surveys = data.data.surveys;
  const activeCount = surveys.filter((s) => s.status === "active").length;
  const draftCount = surveys.filter((s) => s.status === "draft").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">ダッシュボード</h1>
          <p className="mt-1 text-muted text-sm">アンケートの作成・管理</p>
        </div>
        <Button variant="secondary">
          <Link to="/admin/surveys/new">新規作成</Link>
        </Button>
      </div>

      {surveys.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="全アンケート" value={surveys.length} />
          <StatCard label="受付中" value={activeCount} />
          <StatCard label="下書き" value={draftCount} />
        </div>
      )}

      {surveys.length === 0 ? (
        <Card>
          <Card.Content className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <svg
                aria-label="追加アイコン"
                className="h-6 w-6 text-accent"
                fill="none"
                role="img"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4.5v15m7.5-7.5h-15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">アンケートがまだありません</p>
              <p className="mt-1 text-muted text-sm">
                アンケートを作成して、フィードバックを集めましょう。
              </p>
            </div>
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
                  <th className="px-4 py-3 font-medium text-muted text-xs tracking-wider">
                    タイトル
                  </th>
                  <th className="px-4 py-3 font-medium text-muted text-xs tracking-wider">
                    ステータス
                  </th>
                  <th className="px-4 py-3 font-medium text-muted text-xs tracking-wider">
                    作成日
                  </th>
                  <th className="px-4 py-3 font-medium text-muted text-xs tracking-wider">
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
                        className="font-medium text-foreground hover:text-accent"
                        to={`/admin/surveys/${s.id}`}
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        color={
                          SURVEY_STATUS_COLOR_MAP[
                            (s.status as SurveyStatus) ?? "draft"
                          ]
                        }
                        size="sm"
                        variant="soft"
                      >
                        {SURVEY_STATUS_LABELS[s.status as SurveyStatus] ??
                          s.status}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs tabular-nums">
                      {dateFormatter.format(new Date(s.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="text-accent text-xs hover:underline"
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
