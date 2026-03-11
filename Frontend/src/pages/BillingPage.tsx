import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBills, generateBills, updatePaymentStatus,
  remindRoomUnpaid, resendBillReminder, remindAllUnpaid,
  cleanupDuplicates, Bill
} from "@/api/billing.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import {
  Receipt, Search, FileDown,
  Send, ChevronDown, ChevronRight, Users, IndianRupee,
  CheckCircle, MessageSquare, AlertTriangle, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RoomGroup {
  roomId: string;
  roomNumber: string;
  rentPerBed: number;
  bills: Bill[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  residentCount: number;
  status: "paid" | "pending" | "partial";
}

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [expandedRooms, setExpandedRooms] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: getBills,
    select: (data) => data.data
  });

  const bills: Bill[] = data || [];

  // ── Global summary (from unique bills only) ────────────────────
  const summary = useMemo(() => {
    const filtered = bills.filter(b =>
      b.month.toLowerCase() === selectedMonth.toLowerCase() &&
      b.year.toString() === selectedYear
    );
    const total = filtered.reduce((s, b) => s + b.amount, 0);
    const collected = filtered.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
    const pending = total - collected;
    return { total, collected, pending, billCount: filtered.length };
  }, [bills, selectedMonth, selectedYear]);

  // ── Safety Lock: Check if current month is already billed ────────
  const isAlreadyBilled = useMemo(() => {
    return bills.some(b =>
      b.month.toLowerCase() === selectedMonth.toLowerCase() &&
      b.year.toString() === selectedYear
    );
  }, [bills, selectedMonth, selectedYear]);

  // ── Group bills by room (unique residents per room) ────────────
  const groupedBills = useMemo(() => {
    const groups: Record<string, RoomGroup> = {};

    // Only process bills for the selected month/year
    const filteredByDate = bills.filter(b =>
      b.month.toLowerCase() === selectedMonth.toLowerCase() &&
      b.year.toString() === selectedYear
    );

    filteredByDate.forEach((bill) => {
      const roomId = (bill as any).roomId?._id || "unknown";
      const roomNumber = (bill as any).roomId?.roomNumber || "N/A";
      const rentPerBed = (bill as any).roomId?.rentPerBed || (bill as any).roomId?.rentAmount || 0;

      if (!groups[roomId]) {
        groups[roomId] = {
          roomId,
          roomNumber,
          rentPerBed,
          bills: [],
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          residentCount: 0,
          status: "paid"
        };
      }

      groups[roomId].bills.push(bill);
      groups[roomId].totalAmount += bill.amount;
      if (bill.status === "paid") {
        groups[roomId].paidAmount += bill.amount;
      } else {
        groups[roomId].pendingAmount += bill.amount;
      }
    });

    // Calculate unique residents and status
    Object.values(groups).forEach(group => {
      const uniqueTenants = new Set(group.bills.map(b => (b as any).tenantId?._id || b.tenantId));
      group.residentCount = uniqueTenants.size;
      const allPaid = group.bills.every(b => b.status === "paid");
      const somePaid = group.bills.some(b => b.status === "paid");
      group.status = allPaid ? "paid" : somePaid ? "partial" : "pending";
    });

    let result = Object.values(groups).filter(g => {
      const matchesRoom = g.roomNumber.toLowerCase().includes(search.toLowerCase());
      const matchesTenant = g.bills.some(b => ((b as any).tenantId?.name || "").toLowerCase().includes(search.toLowerCase()));
      return matchesRoom || matchesTenant;
    });

    if (filter !== "all") {
      result = result.filter(g => g.status === filter);
    }

    return result.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [bills, search, filter, selectedMonth, selectedYear]);

  const toggleRoom = (id: string) => {
    setExpandedRooms(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  // ── Mutations ──────────────────────────────────────────────────
  const generateMut = useMutation({
    mutationFn: generateBills,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(data.message || "Monthly bills generated successfully");
    },
    onError: () => toast.error("Failed to generate bills")
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: { id: string; status: string; paidAmount?: number }) => updatePaymentStatus(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment status updated");
    }
  });

  const roomRemindMut = useMutation({
    mutationFn: ({ roomId, month }: { roomId: string; month: string }) => remindRoomUnpaid(roomId, month),
    onSuccess: (data) => toast.success(data.message || "Reminders sent!"),
    onError: () => toast.error("Failed to send reminders")
  });

  const remindAllMut = useMutation({
    mutationFn: remindAllUnpaid,
    onSuccess: (data) => toast.success(data.message || "All reminders sent!"),
    onError: () => toast.error("Failed to send reminders")
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Billing <span className="text-primary italic">&amp; Payments</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Manage room revenues and resident dues in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-2 font-bold h-12"
            onClick={() => remindAllMut.mutate()}
            disabled={remindAllMut.isPending}
          >
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            {remindAllMut.isPending ? "Sending..." : "Remind All Unpaid"}
          </Button>
          <Button
            className={cn(
              "rounded-2xl font-bold h-12 shadow-xl",
              "shadow-primary/20 bg-primary hover:bg-primary/90"
            )}
            onClick={() => generateMut.mutate()}
            disabled={generateMut.isPending}
          >
            {isAlreadyBilled ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <Receipt className="mr-2 h-5 w-5" />}
            {generateMut.isPending ? "Generating..." : isAlreadyBilled ? `${selectedMonth.slice(0, 3)} (Update Cycle)` : "Run Monthly Billing Cycle"}
          </Button>
        </div>
      </div>

      {/* Revenue Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[2rem] border bg-card/80 backdrop-blur-sm p-6 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{selectedMonth} {selectedYear} Total Due</p>
          <p className="text-3xl font-black flex items-center justify-center gap-1">
            <IndianRupee className="h-6 w-6" />
            {summary.total.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{summary.billCount} bills</p>
        </div>
        <div className="rounded-[2rem] border bg-green-50 dark:bg-green-900/10 p-6 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-2">Collected</p>
          <p className="text-3xl font-black text-green-600 flex items-center justify-center gap-1">
            <IndianRupee className="h-6 w-6" />
            {summary.collected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[2rem] border bg-red-50 dark:bg-red-900/10 p-6 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">Not Paid</p>
          <p className="text-3xl font-black text-red-500 flex items-center justify-center gap-1">
            <IndianRupee className="h-6 w-6" />
            {summary.pending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row items-center bg-card/50 p-4 rounded-[2rem] border backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by room number or resident name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-transparent border-none text-lg font-bold focus-visible:ring-0"
          />
        </div>
        <div className="h-8 w-[2px] bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 h-14 border-none bg-transparent text-lg font-bold focus:ring-0 uppercase tracking-tighter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28 h-14 border-none bg-transparent text-lg font-bold focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-8 w-[2px] bg-border hidden sm:block" />

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-56 h-14 border-none bg-transparent text-lg font-bold focus:ring-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Status:</span>
              <SelectValue placeholder="All" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-2">
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="paid">Fully Paid</SelectItem>
            <SelectItem value="pending">Completely Unpaid</SelectItem>
            <SelectItem value="partial">Partially Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Room Cards */}
      {isLoading ? <TableLoader /> : (
        <div className="grid gap-6">
          <AnimatePresence>
            {groupedBills.map((group) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={group.roomId}
                className={cn(
                  "group rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                  expandedRooms.includes(group.roomId) ? "ring-2 ring-primary bg-card" : "bg-card/50 hover:bg-card hover:border-primary/50"
                )}
              >
                {/* Room Header */}
                <div
                  className="p-4 md:p-6 cursor-pointer"
                  onClick={() => toggleRoom(group.roomId)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1.25rem] bg-primary/10 flex items-center justify-center">
                        <span className="text-xl md:text-2xl font-black text-primary">{group.roomNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-black truncate">Room {group.roomNumber}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="flex items-center text-[10px] md:text-sm font-bold text-muted-foreground whitespace-nowrap">
                            <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" /> {group.residentCount} Res.
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border hidden sm:block" />
                          <StatusBadge status={group.status} type="bill" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-8 justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Due</p>
                        <p className="text-lg md:text-2xl font-black">₹{group.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-border hidden md:block" />
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Not Paid</p>
                        <p className="text-lg md:text-2xl font-black text-red-500">₹{group.pendingAmount.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 group-hover:bg-primary/10 transition-colors shrink-0">
                        {expandedRooms.includes(group.roomId) ? <ChevronDown className="h-5 w-5 md:h-6 md:w-6" /> : <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Resident Breakdown */}
                <AnimatePresence>
                  {expandedRooms.includes(group.roomId) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t bg-muted/30"
                    >
                      <div className="p-4 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm md:text-lg font-black flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            Residents
                          </h4>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl font-bold gap-2 text-[10px] md:text-sm h-8 md:h-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              roomRemindMut.mutate({ roomId: group.roomId, month: group.bills[0]?.month });
                            }}
                            disabled={roomRemindMut.isPending || group.status === "paid"}
                          >
                            <Send className="h-3 w-3 md:h-4 md:w-4" /> Remind Room
                          </Button>
                        </div>

                        <div className="grid gap-4">
                          {group.bills.map((bill) => {
                            const tenantName = (bill as any).tenantId?.name || "Unknown";
                            const tenantPhone = (bill as any).tenantId?.phone || "N/A";
                            return (
                              <div
                                key={bill._id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-[1.5rem] bg-card border shadow-sm group/row hover:border-primary/30 transition-all gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-base md:text-lg shrink-0">
                                    {tenantName.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-base md:text-lg truncate">{tenantName}</p>
                                    <p className="text-xs text-muted-foreground font-medium">📞 {tenantPhone}</p>
                                  </div>
                                  <div className="ml-auto md:hidden">
                                     <StatusBadge status={bill.status} type="bill" />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-12 w-full md:w-auto">
                                  <div className="grid md:text-right">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground">Amount</span>
                                    <span className="font-black text-primary text-sm md:text-base">₹{bill.amount.toLocaleString()}</span>
                                  </div>
                                  
                                  <div className="hidden md:block">
                                    <StatusBadge status={bill.status} type="bill" />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-blue-50 hover:text-blue-500"
                                      onClick={() => {
                                        toast.promise(resendBillReminder(bill._id), {
                                          loading: 'Sending...',
                                          success: 'WhatsApp sent!',
                                          error: 'Failed'
                                        });
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                    {bill.status !== "paid" ? (
                                      <Button
                                        size="sm"
                                        className="rounded-full font-bold px-4 md:px-6 h-8 md:h-10 text-[10px] md:text-xs shadow-lg shadow-green-500/20 bg-green-500 hover:bg-green-600"
                                        onClick={() => updateMut.mutate({ id: bill._id, status: "paid", paidAmount: bill.amount })}
                                      >
                                        Mark Paid
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full font-bold px-4 md:px-6 h-8 md:h-10 text-[10px] md:text-xs text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => updateMut.mutate({ id: bill._id, status: "pending" })}
                                      >
                                        Mark Not Paid
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="rounded-full h-8 w-8 md:h-10 md:w-10"
                                      onClick={() => window.open(`http://localhost:5000/bills/bill-${bill._id}.pdf`, '_blank')}
                                    >
                                      <FileDown className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {groupedBills.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <Receipt className="h-20 w-20 mx-auto text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tight">No Billing Data Found</p>
                <p className="text-muted-foreground font-medium">Try adjusting your filters or run a new billing cycle.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
