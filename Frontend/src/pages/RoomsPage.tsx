import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRooms, createRoom, updateRoom, deleteRoom, Room } from "@/api/room.api";
import { createTenant, deleteTenant } from "@/api/tenant.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, BedDouble, ChevronDown, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Inline styles for guaranteed bed card colors ──────────────────────────
const OCCUPIED_CARD: React.CSSProperties = {
  background: "#fff5f5",
  border: "2px solid #feb2b2",
  color: "#742a2a",
  cursor: "default",
  boxShadow: "0 1px 4px rgba(229,62,62,0.08)",
};

const VACANT_CARD: React.CSSProperties = {
  background: "#f0fff4",
  border: "2px dashed #86efac",
  color: "#14532d",
  cursor: "pointer",
};

const OCCUPIED_BADGE_NUM: React.CSSProperties = {
  background: "#e53e3e",
  color: "#fff",
  width: 32, height: 32,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 12,
  boxShadow: "0 2px 6px rgba(229,62,62,0.3)",
};

const VACANT_BADGE_NUM: React.CSSProperties = {
  background: "#22c55e",
  color: "#fff",
  width: 32, height: 32,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 12,
  boxShadow: "0 2px 6px rgba(34,197,94,0.3)",
};

const OCCUPIED_CHIP: React.CSSProperties = {
  background: "#fee2e2",
  border: "1px solid #fca5a5",
  color: "#dc2626",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 9,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const DELETE_BTN: React.CSSProperties = {
  width: "100%",
  marginTop: 8,
  padding: "4px 0",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 900,
  fontSize: 10,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  letterSpacing: "0.05em",
};

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [checkOutId, setCheckOutId] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string | null>(null);
  const [targetBedNumber, setTargetBedNumber] = useState<number | null>(null);

  const [form, setForm] = useState<{
    roomNumber: string;
    roomType: "single" | "double" | "triple" | "four-sharing" | "dormitory";
    capacity: number;
    rentAmount: number;
    status: "vacant" | "occupied"
  }>({
    roomNumber: "",
    roomType: "double",
    capacity: 2,
    rentAmount: 0,
    status: "vacant"
  });

  const [tenantForm, setTenantForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    select: (data) => {
      const rooms = data.data;
      // DEBUG: log tenant bedNumbers to browser console
      if (rooms?.length) {
        rooms.forEach((r: any) => {
          if (r.tenants?.length) {
            console.log(`[BedMap] Room ${r.roomNumber} tenants:`, r.tenants.map((t: any) => ({ name: t.name, bedNumber: t.bedNumber, type: typeof t.bedNumber })));
          }
        });
      }
      return rooms;
    }
  });

  const rooms: Room[] = data || [];
  const filtered = rooms.filter((r) => {
    const searchTerm = search.toLowerCase();
    const matchesRoom = r.roomNumber && r.roomNumber.toLowerCase().includes(searchTerm);
    const matchesTenant = r.tenants?.some((t: any) => 
      t.name && t.name.toLowerCase().includes(searchTerm)
    );
    return matchesRoom || matchesTenant;
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Room created");
      setModalOpen(false);
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: { id: string } & Partial<Room>) => updateRoom(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Room updated");
      setModalOpen(false);
      setEditRoom(null);
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Room deleted");
      setDeleteId(null);
    }
  });

  const createTenantMut = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resident added to bed!");
      setQuickAddOpen(false);
      setTenantForm({ name: "", phone: "", email: "", address: "" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add resident");
    }
  });

  const checkOutMut = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resident permanently deleted. Bed is now available.");
      setCheckOutId(null);
    }
  });

  const openCreate = () => {
    setEditRoom(null);
    setForm({ roomNumber: "", roomType: "double", capacity: 2, rentAmount: 0, status: "vacant" });
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType || "double",
      capacity: room.capacity,
      rentAmount: room.rentAmount,
      status: room.status
    });
    setModalOpen(true);
  };

  const openQuickAdd = (roomId: string, bedNum: number) => {
    setTargetRoomId(roomId);
    setTargetBedNumber(bedNum);
    setQuickAddOpen(true);
  };

  const handleSubmit = () => {
    if (editRoom) updateMut.mutate({ id: editRoom._id, ...form });
    else createMut.mutate(form);
  };

  const handleQuickAdd = () => {
    if (!targetRoomId || !targetBedNumber) return;
    createTenantMut.mutate({
      ...tenantForm,
      roomId: targetRoomId,
      bedNumber: targetBedNumber,
      status: "active",
      checkInDate: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground">Manage all rooms and house residents instantly</p>
          {error && <p className="text-xs text-warning">Error loading data. Showing server results if available.</p>}
        </div>
        <Button onClick={openCreate} className="rounded-xl shadow-lg shadow-primary/20"><Plus className="mr-2 h-4 w-4" />Add Room</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search Room No. or Tenant Name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-card rounded-xl" />
      </div>

      {isLoading ? <TableLoader /> : (
        <div className="space-y-6">
          {/* Mobile Card View */}
          <div className="grid gap-6 md:hidden">
            {filtered.map((room) => (
              <motion.div
                key={room._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[2rem] border overflow-hidden shadow-sm flex flex-col"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BedDouble className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xl font-black">Room {room.roomNumber}</span>
                    </div>
                    <StatusBadge status={room.status as any} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-muted/50">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Type</p>
                      <p className="font-bold capitalize">{room.roomType}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/50">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Occupancy</p>
                      <p className="font-bold">
                        <span className={cn(
                          room.currentTenants === room.capacity ? "text-red-500" : 
                          room.currentTenants && room.currentTenants > 0 ? "text-yellow-500" : 
                          "text-green-600"
                        )}>
                          {room.currentTenants || 0}
                        </span>/{room.capacity} beds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Rent / Bed</p>
                      <p className="text-lg font-black text-primary">₹{room.rentPerBed?.toLocaleString() || room.rentAmount?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(room)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => setDeleteId(room._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-2xl font-bold h-12" 
                    variant="secondary"
                    onClick={() => toggleRow(room._id)}
                  >
                    {expandedRows[room._id] ? "Hide Occupancy Map" : "View Occupancy Map"}
                  </Button>
                </div>

                {expandedRows[room._id] && (
                  <div className="px-6 pb-6 bg-muted/20 border-t pt-6">
                    <div className="flex flex-col gap-4">
                      {Array.from({ length: room.capacity }).map((_, idx) => {
                        const bedNum = idx + 1;
                        const tenantsWithBed = room.tenants?.filter(t => t.bedNumber != null) || [];
                        const tenantsWithoutBed = room.tenants?.filter(t => t.bedNumber == null) || [];
                        const tenant = tenantsWithBed.find(t => Number(t.bedNumber) === bedNum) || tenantsWithoutBed[idx];
                        
                        return (
                          <div 
                            key={bedNum} 
                            className={cn(
                              "p-4 rounded-2xl border flex items-center justify-between transition-all",
                              tenant ? "bg-red-50/50 border-red-200" : "bg-green-50/50 border-green-200 border-dashed"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs text-white",
                                tenant ? "bg-red-500" : "bg-green-500"
                              )}>
                                {bedNum}
                              </div>
                              <div>
                                <p className={cn("text-xs font-black uppercase tracking-widest", tenant ? "text-red-700" : "text-green-700")}>
                                  Bed {bedNum} {tenant ? "• Occupied" : "• Available"}
                                </p>
                                {tenant && <p className="font-bold text-sm text-red-900">{tenant.name}</p>}
                              </div>
                            </div>
                            {tenant ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-red-600 hover:bg-red-100"
                                onClick={() => setCheckOutId(tenant._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl h-8 text-[10px] font-black uppercase border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                onClick={() => openQuickAdd(room._id, bedNum)}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-[2rem] border bg-card shadow-sm overflow-hidden border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Rent/Bed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((room) => (
                  <Fragment key={room._id}>
                    <TableRow className={cn("transition-colors", expandedRows[room._id] && "bg-muted/30")}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8 rounded-lg transition-transform", expandedRows[room._id] && "rotate-180")}
                          onClick={() => toggleRow(room._id)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BedDouble className="h-4 w-4 text-primary" />
                          </div>
                          {room.roomNumber}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize font-medium text-muted-foreground">{room.roomType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-black", room.currentTenants === room.capacity ? "text-red-500" : room.currentTenants && room.currentTenants > 0 ? "text-yellow-500" : "text-green-600")}>
                            {room.currentTenants || 0}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="font-bold">{room.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{room.capacity}</TableCell>
                      <TableCell className="font-black">₹{room.rentPerBed > 0 ? room.rentPerBed.toLocaleString() : room.rentAmount.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={room.status as any} /></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(room)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(room._id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>

                    {expandedRows[room._id] && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="p-0 border-b">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div style={{ padding: "2rem 2rem 2rem 3.5rem", background: "linear-gradient(to bottom, rgba(0,0,0,0.02), transparent)" }}>
                              {/* Desktop Bed Grid Code... */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <Users style={{ width: 16, height: 16, color: "#6366f1" }} />
                                  <span style={{ fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280" }}>
                                    Room Occupancy Map — Room {room.roomNumber}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                                {Array.from({ length: room.capacity }).map((_, idx) => {
                                  const bedNum = idx + 1;
                                  const tenantsWithBed = room.tenants?.filter(t => t.bedNumber != null) || [];
                                  const tenantsWithoutBed = room.tenants?.filter(t => t.bedNumber == null) || [];
                                  const tenant = tenantsWithBed.find(t => Number(t.bedNumber) === bedNum) || tenantsWithoutBed[idx];
                                  return (
                                    <div
                                      key={bedNum}
                                      style={{
                                        ...(tenant ? OCCUPIED_CARD : VACANT_CARD),
                                        borderRadius: 20,
                                        padding: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        minHeight: 160,
                                        position: "relative",
                                      }}
                                      onClick={() => !tenant && openQuickAdd(room._id, bedNum)}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={tenant ? OCCUPIED_BADGE_NUM : VACANT_BADGE_NUM}>{bedNum}</div>
                                        {tenant && <div style={OCCUPIED_CHIP}>Occupied</div>}
                                      </div>
                                      <div style={{ fontWeight: 900, fontSize: 11, color: tenant ? "#991b1b" : "#15803d", textTransform: "uppercase" }}>Bed {bedNum}</div>
                                      {tenant ? (
                                        <div style={{ marginTop: "auto" }}>
                                          <div style={{ fontWeight: 900, fontSize: 14, color: "#7f1d1d" }}>{tenant.name}</div>
                                          <button style={DELETE_BTN} onClick={(e) => { e.stopPropagation(); setCheckOutId(tenant._id); }}>🗑 DELETE</button>
                                        </div>
                                      ) : (
                                        <div style={{ marginTop: "auto", fontWeight: 900, fontSize: 13, color: "#16a34a" }}>CLICK TO ADD</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-bold text-lg">No rooms found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Resident Dialog */}
      <Dialog open={quickAddOpen} onOpenChange={(open) => { setQuickAddOpen(open); if (!open) setTenantForm({ name: "", phone: "", email: "", address: "" }); }}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tighter">
              Add Resident to <span className="text-primary">Bed {targetBedNumber}</span>
            </DialogTitle>
            <DialogDescription className="font-medium">
              Fill in the details below. This bed will be blocked immediately after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                placeholder="Ex: Ganesh Kumar"
                value={tenantForm.name}
                onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                className="h-12 rounded-2xl bg-muted/50 border-none font-bold"
              />
              {tenantForm.name.trim() === "" && tenantForm.name.length > 0 && (
                <p style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>⚠ Full name is required.</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                Phone Number <span style={{ color: "#ef4444" }}>*</span> &nbsp;
                <span style={{ color: "#9ca3af", fontWeight: 500, textTransform: "none", fontSize: 9 }}>(exactly 10 digits)</span>
              </Label>
              <Input
                placeholder="9876543210"
                value={tenantForm.phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => {
                  // Strip all non-digit characters
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setTenantForm({ ...tenantForm, phone: digits });
                }}
                className={cn(
                  "h-12 rounded-2xl bg-muted/50 border-2 font-bold tracking-widest",
                  tenantForm.phone.length > 0 && tenantForm.phone.length !== 10
                    ? "border-red-400 focus-visible:ring-red-400"
                    : tenantForm.phone.length === 10
                      ? "border-green-400 focus-visible:ring-green-400"
                      : "border-transparent"
                )}
              />
              {/* Live counter + error */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {tenantForm.phone.length > 0 && tenantForm.phone.length < 10 && (
                  <p style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>
                    ⚠ Phone must be exactly 10 digits ({tenantForm.phone.length}/10)
                  </p>
                )}
                {tenantForm.phone.length > 0 && tenantForm.phone.length === 10 && (
                  <p style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>✅ Valid phone number</p>
                )}
                <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>
                  {tenantForm.phone.length}/10
                </span>
              </div>
            </div>

            {/* Email (optional) */}
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Email Address (optional)</Label>
              <Input
                placeholder="resident@example.com"
                value={tenantForm.email}
                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                className="h-12 rounded-2xl bg-muted/50 border-none font-bold"
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              onClick={handleQuickAdd}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              disabled={
                createTenantMut.isPending ||
                !tenantForm.name.trim() ||
                tenantForm.phone.length !== 10
              }
            >
              {createTenantMut.isPending ? "Assigning..." : "✅ CONFIRM & OCCUPY BED"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Room Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editRoom ? "Edit Room" : "Add New Room"}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Room Number</Label><Input className="h-12 rounded-2xl bg-muted/50 border-none font-bold" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Room Type</Label>
              <Select value={form.roomType} onValueChange={(v: any) => setForm({ ...form, roomType: v })}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="triple">Triple</SelectItem>
                  <SelectItem value="four-sharing">Four Sharing</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Capacity (Beds)</Label><Input className="h-12 rounded-2xl bg-muted/50 border-none font-bold" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
              <div className="grid gap-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Monthly Rent Per Bed (₹)</Label><Input className="h-12 rounded-2xl bg-muted/50 border-none font-bold" type="number" value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: +e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v: "vacant" | "occupied") => setForm({ ...form, status: v })}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6"><Button onClick={() => {
            const finalData = { ...form, rentPerBed: form.rentAmount };
            if (editRoom) updateMut.mutate({ id: editRoom._id, ...finalData });
            else createMut.mutate(finalData);
          }} className="w-full h-14 rounded-2xl font-black text-lg">{editRoom ? "Update Room" : "Create Room"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-destructive">Delete Room?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">This will permanently delete the room and all associated data. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-2xl h-12 border-none bg-muted/50 font-black">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="rounded-2xl h-12 bg-destructive text-white hover:bg-destructive/90 font-black px-8">YES, DELETE</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Resident Confirmation */}
      <AlertDialog open={!!checkOutId} onOpenChange={() => setCheckOutId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black" style={{ color: "#dc2626" }}>🗑 Delete Resident?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This will remove the resident from the bed. The bed will become <strong>GREEN (Available)</strong> again instantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-2xl h-12 border-none bg-muted/50 font-black">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => checkOutId && checkOutMut.mutate(checkOutId)}
              className="rounded-2xl h-12 font-black px-8 uppercase tracking-widest"
              style={{ background: "#dc2626", color: "#fff" }}
            >
              CONFIRM DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
