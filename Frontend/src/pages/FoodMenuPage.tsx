import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenu, updateMenuItem, MenuItem } from "@/api/foodMenu.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { Pencil, UtensilsCrossed, QrCode, Download } from "lucide-react";
import api from "@/api/axios";

export default function FoodMenuPage() {
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ breakfast: "", lunch: "", dinner: "" });
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({ queryKey: ["menu"], queryFn: getMenu, select: (res) => res.data });
  const menu: MenuItem[] = data || [];

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: { id: string } & Partial<MenuItem>) => updateMenuItem(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu"] }); toast.success("Menu updated"); setEditItem(null); },
  });

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ breakfast: item.breakfast, lunch: item.lunch, dinner: item.dinner });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Food Menu</h1>
        <p className="text-sm text-muted-foreground">Weekly food menu for your PG</p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            api.post("/menu/generate-qr").then(() => toast.success("QR Code regenerated successfully"));
          }}>
            <QrCode className="mr-2 h-4 w-4" /> Regenerate QR
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/uploads/menuQR.png`} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download QR
            </a>
          </Button>
        </div>
        {error && <p className="text-xs text-warning">Using demo data</p>}
      </div>

      {isLoading && !error ? <TableLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menu.map((item) => (
            <Card key={item._id} className="group relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    {item.day}
                  </span>
                  <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="font-medium text-muted-foreground">Breakfast:</span><p>{item.breakfast}</p></div>
                <div><span className="font-medium text-muted-foreground">Lunch:</span><p>{item.lunch}</p></div>
                <div><span className="font-medium text-muted-foreground">Dinner:</span><p>{item.dinner}</p></div>
              </CardContent>
            </Card>
          ))}
          {menu.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl bg-card/50">
              <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>No food menu entries found. Add your weekly schedule to get started.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {editItem?.day} Menu</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Breakfast</Label><Input value={form.breakfast} onChange={(e) => setForm({ ...form, breakfast: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Lunch</Label><Input value={form.lunch} onChange={(e) => setForm({ ...form, lunch: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Dinner</Label><Input value={form.dinner} onChange={(e) => setForm({ ...form, dinner: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => editItem && updateMut.mutate({ id: editItem._id, ...form })}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
