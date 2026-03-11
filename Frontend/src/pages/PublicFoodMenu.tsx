import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Utensils, Clock } from "lucide-react";

const getTodayMenu = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const { data } = await axios.get(`${baseUrl}/menu/today`);
    return data.data;
};

export default function PublicFoodMenu() {
    const { data: menu, isLoading } = useQuery({
        queryKey: ["todayMenu"],
        queryFn: getTodayMenu
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-8">
                <div className="bg-primary p-8 text-white text-center">
                    <Utensils className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Today's Menu</h1>
                    <p className="opacity-80">{new Date().toDateString()}</p>
                </div>

                <div className="p-6 space-y-8">
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                        </div>
                    ) : !menu ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No menu uploaded for today yet.</p>
                        </div>
                    ) : (
                        <>
                            {["breakfast", "lunch", "dinner"].map((meal) => (
                                <div key={meal} className="relative">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <h2 className="text-lg font-bold capitalize">{meal}</h2>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed">
                                            {(menu as any)[meal] || "Not scheduled"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} PG Management System</p>
                    <p className="mt-1">Hand-picked fresh meals served daily.</p>
                </div>
            </div>
        </div>
    );
}
