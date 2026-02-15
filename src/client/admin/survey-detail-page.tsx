import { useParams } from "react-router-dom";
import {
  useGetApiAdminSurveysById,
  useGetApiAdminSurveysByIdResponses,
} from "@/generated/api/admin-surveys/admin-surveys";
import type { Question } from "@/shared/schema/survey";

export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: surveyData, isLoading: surveyLoading } =
    useGetApiAdminSurveysById(id ?? "");
  const { data: responsesData, isLoading: responsesLoading } =
    useGetApiAdminSurveysByIdResponses(id ?? "");

  if (surveyLoading || !surveyData) {
    return <p>読み込み中...</p>;
  }

  if (surveyData.status !== 200) {
    return <p>アンケートが見つかりません。</p>;
  }

  const survey = surveyData.data;
  const questions = survey.questions as Question[];
  const responses =
    responsesData && responsesData.status === 200
      ? responsesData.data.responses
      : [];

  const surveyUrl = `${window.location.origin}/survey/${survey.id}`;

  return (
    <div>
      <h1>{survey.title}</h1>

      <div>
        <strong>共有 URL:</strong> <code>{surveyUrl}</code>
      </div>

      <h2>質問一覧</h2>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            {q.label}（{q.type}）
          </li>
        ))}
      </ul>

      <h2>回答一覧（{responses.length}件）</h2>
      {responsesLoading ? (
        <p>回答を読み込み中...</p>
      ) : responses.length === 0 ? (
        <p>まだ回答がありません。</p>
      ) : (
        <table>
          <thead>
            <tr>
              {questions.map((q) => (
                <th key={q.id}>{q.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id}>
                {questions.map((q) => {
                  const answer = r.answers[q.id];
                  return (
                    <td key={q.id}>
                      {Array.isArray(answer)
                        ? answer.join(", ")
                        : (answer ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
