//@ts-nocheck
import { Card } from "@/components/ui/card"; 

export default function StatCard({ icon, title, value, unit, isLoading, children }) {
  return (
    <Card className="p-6 flex items-center gap-6 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-lg font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <div className="h-8 w-3/4 bg-gray-200 rounded-md animate-pulse mt-1" />
        ) : children ? (
          children
        ) : (
          <p className="text-3xl font-bold text-gray-800 mt-1 text-center">
            {value} <span className="text-xl font-medium text-gray-600">{unit}</span>
          </p>
        )}
      </div>
    </Card>
  );
}