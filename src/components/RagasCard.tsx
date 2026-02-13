import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RagasCardProps {
  ragas: Record<string, number>;
}

export default function RagasCard({ ragas }: RagasCardProps) {
  const entries = Object.entries(ragas);
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">📊 RAGAS Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">{key}</span>
              <span className="font-mono">{value.toFixed(4)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(value * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
