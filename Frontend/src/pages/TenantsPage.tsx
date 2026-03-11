import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenants, createTenant, updateTenant, deleteTenant, checkOutTenant, Tenant } from "@/api/tenant.api";
import { getRooms } from "@/api/room.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, LogOut } from "lucide-react";

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", roomId: "", bedNumber: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    address: "", idProof: ""
  });

  const [showHistory, setShowHistory] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    select: (data) => data.data
  });

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    select: (data) => data.data
  });

  const rooms = roomsData || [];

  const tenants: Tenant[] = data || [];
  const filtered = tenants.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search);
    const matchesStatus = showHistory ? t.status === 'inactive' : t.status === 'active';
    return matchesSearch && matchesStatus;
  });

  const createMut = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Tenant added");
      setModalOpen(false);
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: { id: string } & Partial<Tenant>) => updateTenant(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Tenant updated");
      setModalOpen(false);
      setEditTenant(null);
    }
  });

  const checkoutMut = useMutation({
    mutationFn: checkOutTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Tenant checked out");
      setCheckoutId(null);
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Tenant removed");
      setDeleteId(null);
    }
  });

  const openCreate = () => {
    setEditTenant(null);
    setForm({ name: "", email: "", phone: "", roomId: "", bedNumber: 1, checkInDate: new Date().toISOString().split('T')[0], address: "", idProof: "" });
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditTenant(t);
    setForm({
      name: t.name,
      email: t.email,
      phone: t.phone,
      roomId: t.roomId && typeof t.roomId === 'object' ? (t.roomId as any)._id : t.roomId,
      bedNumber: t.bedNumber || 1,
      checkInDate: new Date(t.checkInDate).toISOString().split('T')[0],
      address: t.address || "",
      idProof: t.idProof || ""
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const payload = { ...form, status: "active" as const };
    if (editTenant) updateMut.mutate({ id: editTenant._id, ...payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage active and past tenants</p>
        </div>
        <div className="flex gap-2">
          <Button variant={showHistory ? "default" : "outline"} onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Show Active" : "Show History"}
          </Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Tenant</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {isLoading ? <TableLoader /> : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tenant Details</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const roomNum = t.roomId && typeof t.roomId === 'object' ? (t.roomId as any).roomNumber : (t.roomNumber || "N/A");
                return (
                  <TableRow key={t._id}>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.phone}</div>
                    </TableCell>
                    <TableCell>Room: {roomNum}</TableCell>
                    <TableCell>{new Date(t.checkInDate).toLocaleDateString()}</TableCell>
                    <TableCell>{t.checkOutDate ? new Date(t.checkOutDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      {t.status === 'active' && (
                        <Button variant="ghost" size="icon" onClick={() => setCheckoutId(t._id)} title="Check-out">
                          <LogOut className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(t._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No tenants found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTenant ? "Edit Tenant" : "Add Tenant"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Room Assignment</Label>
                <Select value={form.roomId} onValueChange={(v) => setForm({ ...form, roomId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room: any) => (
                      <SelectItem key={room._id} value={room._id}>
                        Room {room.roomNumber} ({room.roomType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Check-in Date</Label><Input type="date" value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Permanent Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit}>{editTenant ? "Update Tenant" : "Add Tenant"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Confirmation */}
      <AlertDialog open={!!checkoutId} onOpenChange={() => setCheckoutId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-out?</AlertDialogTitle>
            <AlertDialogDescription>This will mark the tenant as inactive and free up the room capacity.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => checkoutId && checkoutMut.mutate(checkoutId)} className="bg-warning text-warning-foreground">Check-out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove Tenant?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the tenant record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
