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
        <p className="py-4 text-center text-muted text-sm">
          データエントリがありません。
        </p>
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
            <tr className="border-border border-b">
              {params.map((p) => (
                <th
                  className="px-3 py-2 font-medium text-muted"
                  key={`param-${p.key}`}
                >
                  {p.label}
                </th>
              ))}
              <th className="px-3 py-2 font-medium text-muted">ラベル</th>
              <th className="px-3 py-2 font-medium text-muted">回答数</th>
              <th className="px-3 py-2 font-medium text-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr className="border-border/50 border-b" key={entry.id}>
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
