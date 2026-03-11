import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { TableLoader } from "@/components/Loader";
import { Utensils, Calendar } from "lucide-react";

export default function TenantMenu() {
    const { data: menu, isLoading } = useQuery({
        queryKey: ["food-menu"],
        queryFn: async () => {
            const { data } = await api.get("/menu");
            return data.data;
        }
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Utensils className="h-6 w-6 text-primary" /></div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Weekly Food Menu</h1>
                    <p className="text-sm text-muted-foreground">Check out what's cooking this week</p>
                </div>
            </div>

            {isLoading ? <TableLoader /> : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {days.map((day) => {
                        const item = menu?.find((m: any) => m.day === day);
                        return (
                            <div key={day} className="rounded-xl border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-bold text-lg">{day}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Breakfast</p>
                                        <p className="text-sm font-medium">{item?.breakfast || "N/A"}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Lunch</p>
                                        <p className="text-sm font-medium">{item?.lunch || "N/A"}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Dinner</p>
                                        <p className="text-sm font-medium">{item?.dinner || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
