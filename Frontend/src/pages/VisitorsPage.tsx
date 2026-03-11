import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVisitorLogs, logVisitor, checkOutVisitor, updateVisitorStatus, VisitorLog } from "@/api/visitorLog.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { getTenants } from "@/api/tenant.api";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { Search, UserPlus, LogOut, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function VisitorsPage() {
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        tenantId: "",
        visitorName: "",
        relation: "",
        phone: "",
        purpose: ""
    });

    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["visitorLogs"],
        queryFn: getVisitorLogs,
        select: (data) => data.data
    });

    const { data: tenantsData } = useQuery({
        queryKey: ["tenants"],
        queryFn: getTenants,
        select: (data) => data.data
    });

    const activeTenants = (tenantsData || []).filter((t: any) => t.status === 'active');
    const logs: any[] = data || [];
    const filtered = logs.filter((l) =>
        l.visitorName.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search)
    );

    const pendingRequests = logs.filter(l => l.status === "pending");
    const otherLogs = filtered.filter(l => l.status !== "pending");

    const logMut = useMutation({
        mutationFn: logVisitor,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["visitorLogs"] });
            toast.success("Visitor logged");
            setModalOpen(false);
        }
    });

    const checkoutMut = useMutation({
        mutationFn: checkOutVisitor,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["visitorLogs"] });
            toast.success("Visitor checked out");
        }
    });

    const statusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateVisitorStatus(id, status),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["visitorLogs"] });
            toast.success(`Visitor request ${variables.status}`);
        }
    });

    const handleSubmit = () => {
        logMut.mutate({ ...form, status: "approved" }); // Admin logs are approved by default
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Visitor Management</h1>
                    <p className="text-sm text-muted-foreground">Track entries and exits of PG visitors</p>
                </div>
                <Button onClick={() => setModalOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Log New Visitor</Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search visitors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>

            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 text-warning">
                        <Clock className="h-4 w-4" /> Pending Entry Requests
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingRequests.map((log) => (
                            <div key={log._id} className="bg-warning/5 border border-warning/20 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <UserPlus className="h-12 w-12" />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <div>
                                        <p className="font-bold text-lg">{log.visitorName}</p>
                                        <p className="text-xs text-muted-foreground">{log.phone} • {log.relation}</p>
                                    </div>
                                    <div className="text-sm border-t border-warning/20 pt-2">
                                        <p className="text-muted-foreground font-medium mb-1 capitalize">Purpose: {log.purpose}</p>
                                        <p className="text-xs opacity-70">Visiting: <span className="font-semibold">{typeof log.tenantId === 'object' ? log.tenantId.name : 'Unknown'}</span></p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full" onClick={() => statusMut.mutate({ id: log._id, status: "approved" })}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full" onClick={() => statusMut.mutate({ id: log._id, status: "rejected" })}>
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? <TableLoader /> : (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" /> Visitor Logs & History
                    </h2>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Visitor Name</TableHead>
                                    <TableHead>Visiting Tenant</TableHead>
                                    <TableHead>Entry/Request Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {otherLogs.map((log) => {
                                    const tenantName = typeof log.tenantId === 'object' ? log.tenantId.name : "N/A";
                                    return (
                                        <TableRow key={log._id}>
                                            <TableCell>
                                                <div className="font-medium">{log.visitorName}</div>
                                                <div className="text-xs text-muted-foreground">{log.phone} ({log.relation})</div>
                                            </TableCell>
                                            <TableCell>{tenantName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {new Date(log.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                                {log.checkOutTime && (
                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        Out: {new Date(log.checkOutTime).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={log.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {log.status === "approved" && (
                                                        <Button variant="outline" size="sm" onClick={() => checkoutMut.mutate(log._id)}>
                                                            <LogOut className="mr-2 h-3 w-3" /> Check-out
                                                        </Button>
                                                    )}
                                                    {log.status === "rejected" && (
                                                        <span className="text-xs text-muted-foreground italic">Entry Denied</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {otherLogs.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No visitor logs found</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Log Visitor Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log New Visitor</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Visitor Name</Label><Input value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Relation</Label><Input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Visiting Tenant</Label>
                            <Select value={form.tenantId} onValueChange={(v) => setForm({ ...form, tenantId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select a tenant" /></SelectTrigger>
                                <SelectContent>
                                    {activeTenants.map((t: any) => (
                                        <SelectItem key={t._id} value={t._id}>{t.name} (Room: {t.roomId && typeof t.roomId === 'object' ? t.roomId.roomNumber : '?'})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label>Purpose of Visit</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSubmit}>Log Entry</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
