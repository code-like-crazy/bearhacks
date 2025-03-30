import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BoardCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden border border-slate-200 bg-white">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-3/5 bg-slate-100" />
        <Skeleton className="h-7 w-7 rounded-full bg-slate-100" />
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <Skeleton className="mt-2 h-4 w-1/4 bg-slate-100" />
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
        <Skeleton className="h-3 w-1/3 bg-slate-100" />
        <Skeleton className="h-3 w-1/4 bg-slate-100" />
      </CardFooter>
    </Card>
  );
}
