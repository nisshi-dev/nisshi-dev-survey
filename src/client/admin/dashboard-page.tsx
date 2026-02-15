import { Link } from "react-router-dom";
import { useGetApiAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";

export function DashboardPage() {
  const { data, isLoading } = useGetApiAdminSurveys();

  if (isLoading || !data) {
    return <p>読み込み中...</p>;
  }

  const surveys = data.data.surveys;

  return (
    <div>
      <h1>ダッシュボード</h1>
      <Link to="/admin/surveys/new">新規作成</Link>
      {surveys.length === 0 ? (
        <p>アンケートがまだありません。</p>
      ) : (
        <ul>
          {surveys.map((s) => (
            <li key={s.id}>
              <Link to={`/admin/surveys/${s.id}`}>{s.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
