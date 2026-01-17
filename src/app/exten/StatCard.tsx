import { Card } from "@/components/ui/card";

interface StatCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  value?: string | number;
  unit?: string;
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function StatCard({ icon, title, value, unit, isLoading, children }: StatCardProps) {
  return (
    <Card className="p-6 flex  gap-6 shadow-lg hover-lift rounded-xl border-2 border-border/50">
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl opacity-50" />
        <div className="relative">{icon}</div>
      </div>
      <div className="flex-1 ">
        <p className="text-lg font-semibold text-muted-foreground mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 w-3/4 bg-muted rounded-md animate-pulse mt-1" />
        ) : children ? (
          children
        ) : (
          <p className="text-3xl font-bold text-foreground mt-1">
            {value} <span className="text-xl font-medium text-muted-foreground">{unit}</span>
          </p>
        )}
      </div>
    </Card>
  );
}