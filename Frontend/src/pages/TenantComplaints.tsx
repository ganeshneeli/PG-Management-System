import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyComplaints, createComplaint, Complaint } from "@/api/complaint.api";
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
import { MessageSquareWarning, PlusCircle } from "lucide-react";
import { getMyDetails } from "@/api/tenant.api";

export default function TenantComplaints() {
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "other" as const,
    });

    const qc = useQueryClient();

    const { data: tenant } = useQuery({
        queryKey: ["tenant-me"],
        queryFn: getMyDetails,
        select: (res: any) => res.data
    });

    const { data: complaints, isLoading } = useQuery({
        queryKey: ["my-complaints"],
        queryFn: getMyComplaints,
        select: (res: any) => res.data
    });

    const createMut = useMutation({
        mutationFn: (data: any) => createComplaint({
            ...data,
            tenantId: tenant?._id,
            roomNumber: tenant?.roomId?.roomNumber
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-complaints"] });
            toast.success("Complaint filed successfully");
            setModalOpen(false);
            setForm({ title: "", description: "", category: "other" });
        }
    });

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter sm:text-5xl italic">My <span className="text-primary not-italic">Complaints</span></h1>
                    <p className="text-muted-foreground font-medium text-lg">Report issues and track their resolution status</p>
                </div>
                <Button 
                    onClick={() => setModalOpen(true)}
                    className="h-14 rounded-2xl font-black text-lg px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                    <PlusCircle className="mr-2 h-6 w-6" /> NEW COMPLAINT
                </Button>
            </div>

            {isLoading ? <TableLoader /> : (
                <div className="space-y-6">
                    {/* Mobile Card View */}
                    <div className="grid gap-6 md:hidden">
                        {complaints?.map((c: any) => (
                            <motion.div
                                key={c._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card rounded-[2.5rem] border p-8 shadow-sm flex flex-col gap-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full tracking-widest">
                                                {c.category}
                                            </span>
                                            {c.priority === "HIGH" && <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-3 py-1 rounded-full tracking-widest">🚨 HIGH</span>}
                                            {c.priority === "MEDIUM" && <span className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full tracking-widest">⚠️ MEDIUM</span>}
                                            {c.priority === "LOW" && <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full tracking-widest">🟡 LOW</span>}
                                        </div>
                                        <h3 className="text-xl font-black leading-tight tracking-tight">{c.title}</h3>
                                    </div>
                                    <StatusBadge status={c.status as any} />
                                </div>

                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    {c.description}
                                </p>

                                <div className="pt-4 border-t border-dashed flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-border" />
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reported on</p>
                                    </div>
                                    <p className="font-bold text-sm tracking-tight">
                                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-[2.5rem] border bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden border-border/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="pl-8 py-6">Category & Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-8">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complaints?.map((c: any) => (
                                    <TableRow key={c._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <div className="capitalize text-[10px] font-black uppercase text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full tracking-widest">{c.category}</div>
                                                {c.priority === "HIGH" && <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full tracking-widest">🚨 HIGH</span>}
                                                {c.priority === "MEDIUM" && <span className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full tracking-widest">⚠️ MEDIUM</span>}
                                                {c.priority === "LOW" && <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full tracking-widest">🟡 LOW</span>}
                                            </div>
                                            <div className="font-black text-lg tracking-tight">{c.title}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground font-medium">{c.description}</TableCell>
                                        <TableCell><StatusBadge status={c.status as any} /></TableCell>
                                        <TableCell className="text-right pr-8 font-bold">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {(!complaints || complaints.length === 0) && (
                        <div className="py-24 text-center space-y-6 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
                            <MessageSquareWarning className="h-20 w-20 mx-auto text-muted-foreground/20" />
                            <div className="space-y-1">
                                <p className="text-3xl font-black tracking-tight">No Complaints Found</p>
                                <p className="text-muted-foreground font-medium text-lg">Reported issues will appear here tracking resolution.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="rounded-[2.5rem] p-8 max-w-xl">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-black tracking-tighter italic">
                            File a <span className="text-primary not-italic">Complaint</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Issue Title</Label>
                            <Input 
                                value={form.title} 
                                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                                placeholder="Briefly describe the issue" 
                                className="h-12 rounded-2xl bg-muted/50 border-none font-bold"
                            />
                        </div>
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
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Detailed Description</Label>
                            <Textarea 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                placeholder="Explain the problem in detail..." 
                                className="min-h-[150px] rounded-2xl bg-muted/50 border-none font-medium resize-none p-4"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button 
                            onClick={() => createMut.mutate(form)} 
                            disabled={createMut.isPending}
                            className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                        >
                           {createMut.isPending ? "SUBMITTING..." : "SUBMIT COMPLAINT"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
