import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaints, createComplaint, updateComplaint, Complaint } from "@/api/complaint.api";
import { getTenants } from "@/api/tenant.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { MessageSquareWarning, Search, PlusCircle, CheckCircle2 } from "lucide-react";

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    tenantId: "",
    title: "",
    description: "",
    category: "other" as const,
    roomNumber: ""
  });

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: getComplaints,
    select: (data) => data.data
  });

  const { data: tenantsData } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    select: (data) => data.data
  });

  const activeTenants = (tenantsData || []).filter((t: any) => t.status === 'active');

  const complaints: Complaint[] = data || [];
  const filtered = complaints.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: (data: any) => createComplaint(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["complaints"] }); toast.success("Complaint registered"); setModalOpen(false); }
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => updateComplaint(id, { status: "resolved" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["complaints"] }); toast.success("Marked as resolved"); }
  });

  const handleTenantChange = (tenantId: string) => {
    const tenant = activeTenants.find(t => t._id === tenantId);
    setForm({
      ...form,
      tenantId,
      roomNumber: tenant && tenant.roomId && typeof tenant.roomId === 'object' ? tenant.roomId.roomNumber : (tenant?.roomNumber || "")
    });
  };

  const handleSubmit = () => {
    createMut.mutate(form);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">Complaints <span className="text-primary italic">&amp; Maintenance</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Manage tenant issues and maintenance requests</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> New Complaint
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-14 bg-card rounded-2xl border-none font-bold" />
      </div>

      {isLoading ? <TableLoader /> : (
        <div className="space-y-6">
          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {filtered.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[2rem] border p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {c.category}
                      </span>
                      {c.priority === "HIGH" && <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">🚨 HIGH</span>}
                      {c.priority === "MEDIUM" && <span className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">⚠️ MEDIUM</span>}
                      {c.priority === "LOW" && <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">🟡 LOW</span>}
                    </div>
                    <h3 className="text-lg font-black leading-tight">{c.title}</h3>
                  </div>
                  <StatusBadge status={c.status as any} />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {c.description}
                </p>

                <div className="flex items-center justify-between py-3 border-y border-dashed">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase">
                      {c.tenantId && typeof c.tenantId === 'object' ? c.tenantId?.name?.charAt(0) : 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{c.tenantId && typeof c.tenantId === 'object' ? c.tenantId?.name : 'Owner/Admin'}</p>
                      <p className="text-[10px] text-muted-foreground">Room {c.roomNumber || (c.tenantId && typeof c.tenantId === 'object' ? c.tenantId.roomNumber : "N/A")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Date</p>
                    <p className="text-xs font-bold">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {c.status !== "resolved" && (
                  <Button 
                    className="w-full h-12 rounded-2xl font-black gap-2 shadow-lg shadow-green-500/10 bg-green-500 hover:bg-green-600"
                    onClick={() => resolveMut.mutate(c._id)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> MARK RESOLVED
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-[2rem] border bg-card shadow-sm overflow-hidden border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead>Category & Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <div className="capitalize text-[10px] font-black uppercase text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">{c.category}</div>
                        {c.priority === "HIGH" && <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">🚨 HIGH</span>}
                        {c.priority === "MEDIUM" && <span className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">⚠️ MEDIUM</span>}
                        {c.priority === "LOW" && <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">🟡 LOW</span>}
                      </div>
                      <div className="font-bold">{c.title}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{c.description}</TableCell>
                    <TableCell>
                      <div className="font-bold">{c.tenantId && typeof c.tenantId === 'object' ? c.tenantId?.name : 'Owner/Admin'}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{c.tenantId && typeof c.tenantId === 'object' ? c.tenantId?.phone : ''}</div>
                    </TableCell>
                    <TableCell className="font-medium">{c.roomNumber || (c.tenantId && typeof c.tenantId === 'object' ? c.tenantId.roomNumber : "N/A")}</TableCell>
                    <TableCell><StatusBadge status={c.status as any} /></TableCell>
                    <TableCell className="font-medium">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right pr-6">
                      {c.status !== "resolved" && (
                        <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 border-green-500 text-green-600 hover:bg-green-50" onClick={() => resolveMut.mutate(c._id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <MessageSquareWarning className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tight">No Complaints Found</p>
                <p className="text-muted-foreground font-medium">Use the search box or register a new complaint.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Complaint Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tighter">Register <span className="text-primary">New Complaint</span></DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Title</Label>
              <Input 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                placeholder="Brief title of the issue" 
                className="h-12 rounded-2xl bg-muted/50 border-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={(v: any) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2">
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Room No.</Label>
                <Input 
                  value={form.roomNumber} 
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} 
                  className="h-12 rounded-2xl bg-muted/50 border-none font-bold"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Reporting Tenant</Label>
              <Select value={form.tenantId} onValueChange={handleTenantChange}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold text-left justify-start">
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  {activeTenants.map((t: any) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} (Room: {t.roomId && typeof t.roomId === 'object' ? t.roomId.roomNumber : t.roomNumber || "?"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Detailed Description</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="Explain the issue in detail..." 
                className="min-h-[120px] rounded-2xl bg-muted/50 border-none font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSubmit} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
              SUBMIT COMPLAINT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
