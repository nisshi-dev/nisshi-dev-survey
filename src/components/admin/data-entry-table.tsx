import { Button } from "@heroui/react";
import type { SurveyParam } from "@/types/survey";

export interface DataEntry {
  createdAt: string;
  id: string;
  label: string | null;
  responseCount: number;
  surveyId: string;
  values: Record<string, string>;
}

interface DataEntryTableProps {
  entries: DataEntry[];
  onAdd: () => void;
  onDelete: (entryId: string) => void;
  onEdit: (entry: DataEntry) => void;
  params: SurveyParam[];
  surveyId: string;
}

export function DataEntryTable({
  surveyId,
  params,
  entries,
  onAdd,
  onEdit,
  onDelete,
}: DataEntryTableProps) {
  function handleCopyUrl(entryId: string) {
    const url = `${window.location.origin}/survey/${surveyId}?entry=${entryId}`;
    navigator.clipboard.writeText(url);
  }

  if (entries.length === 0) {
    return (
      <div>
        <div className="py-8 text-center">
          <svg
            aria-label="空のドキュメントアイコン"
            className="mx-auto mb-3 h-10 w-10 text-muted/40"
            fill="none"
            role="img"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-medium text-muted">データエントリがありません</p>
          <p className="mt-1 text-muted/60 text-sm">
            追加ボタンから新しいエントリを作成できます。
          </p>
        </div>
        <div className="flex justify-end">
          <Button onPress={onAdd} size="sm">
            追加
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border border-b bg-surface-secondary/50">
              {params.map((p) => (
                <th
                  className="px-3 py-2 font-medium text-muted text-xs tracking-wider"
                  key={`param-${p.key}`}
                >
                  {p.label}
                </th>
              ))}
              <th className="px-3 py-2 font-medium text-muted text-xs tracking-wider">
                ラベル
              </th>
              <th className="px-3 py-2 font-medium text-muted text-xs tracking-wider">
                回答数
              </th>
              <th className="px-3 py-2 font-medium text-muted text-xs tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                className="border-border/50 border-b transition-colors even:bg-surface-secondary/30 hover:bg-surface-secondary/50"
                key={entry.id}
              >
                {params.map((p) => (
                  <td className="px-3 py-2" key={`param-${p.key}`}>
                    {entry.values[p.key] ?? ""}
                  </td>
                ))}
                <td className="px-3 py-2">{entry.label ?? ""}</td>
                <td className="px-3 py-2">{entry.responseCount}</td>
                <td className="flex gap-1 px-3 py-2">
                  <Button
                    aria-label="URLコピー"
                    onPress={() => handleCopyUrl(entry.id)}
                    size="sm"
                    variant="secondary"
                  >
                    URLコピー
                  </Button>
                  <Button
                    onPress={() => onEdit(entry)}
                    size="sm"
                    variant="secondary"
                  >
                    編集
                  </Button>
                  <Button
                    isDisabled={entry.responseCount > 0}
                    onPress={() => onDelete(entry.id)}
                    size="sm"
                    variant="danger"
                  >
                    削除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onPress={onAdd} size="sm">
          追加
        </Button>
      </div>
    </div>
  );
}
