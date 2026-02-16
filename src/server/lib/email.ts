import { Resend } from "resend";
import type { Question } from "@/shared/schema/survey";

export function buildResponseEmailHtml(
  surveyTitle: string,
  questions: Question[],
  answers: Record<string, string | string[]>
): string {
  const rows = questions
    .map((q, i) => {
      const raw = answers[q.id];
      const value = Array.isArray(raw) ? raw.join("、") : (raw ?? "");
      return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;white-space:nowrap;vertical-align:top;">Q${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${q.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${value}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f9fafb;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="padding:24px;background:#f3f4f6;border-bottom:1px solid #e5e7eb;">
      <h1 style="margin:0;font-size:18px;color:#111;">【回答コピー】${surveyTitle}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#666;">以下はあなたの回答内容です。</p>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${rows}
      </table>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#999;">
      このメールは自動送信されました。
    </div>
  </div>
</body>
</html>`;
}

interface SendResponseCopyEmailParams {
  to: string;
  surveyTitle: string;
  questions: Question[];
  answers: Record<string, string | string[]>;
}

export async function sendResponseCopyEmail({
  to,
  surveyTitle,
  questions,
  answers,
}: SendResponseCopyEmailParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = "nisshi-dev <work@nisshi.dev>";
  const html = buildResponseEmailHtml(surveyTitle, questions, answers);

  await resend.emails.send({
    from,
    to,
    subject: `【回答コピー】${surveyTitle}`,
    html,
  });
}
