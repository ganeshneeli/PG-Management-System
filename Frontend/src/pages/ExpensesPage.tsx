import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
  Expense,
} from "@/api/expense.api";
import { getBills, Bill } from "@/api/billing.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import {
  Wallet, Search, Plus, Trash2, Edit, IndianRupee,
  PieChart, Calendar, Tag, ChevronRight, X, Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
  "Electricity",
  "Water",
  "Food Supplies",
  "Staff Salary",
  "Maintenance",
  "Internet",
  "Cleaning",
  "Other"
];

const categoryColors: Record<string, string> = {
  "Electricity": "bg-yellow-500/10 text-yellow-600",
  "Water": "bg-blue-500/10 text-blue-600",
  "Food Supplies": "bg-green-500/10 text-green-600",
  "Staff Salary": "bg-purple-500/10 text-purple-600",
  "Maintenance": "bg-orange-500/10 text-orange-600",
  "Internet": "bg-cyan-500/10 text-cyan-600",
  "Cleaning": "bg-teal-500/10 text-teal-600",
  "Other": "bg-gray-500/10 text-gray-600",
};

const months = [
  { value: "1", label: "January" }, { value: "2", label: "February" }, 
  { value: "3", label: "March" }, { value: "4", label: "April" }, 
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" }, 
  { value: "9", label: "September" }, { value: "10", label: "October" }, 
  { value: "11", label: "November" }, { value: "12", label: "December" }
];

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Other",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", selectedYear, selectedMonth],
    queryFn: () => getExpenses({ 
        startDate: `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`,
        // Simple way to get end of month
        endDate: new Date(Number(selectedYear), Number(selectedMonth), 0).toISOString().split("T")[0]
    }),
    select: (data) => data.data as Expense[],
  });

  const { data: summaryData } = useQuery({
    queryKey: ["expense-summary", selectedYear, selectedMonth],
    queryFn: () => getExpenseSummary({ year: selectedYear, month: selectedMonth }),
    select: (data) => data.data,
  });

  const { data: billsData } = useQuery({
    queryKey: ["bills"],
    queryFn: getBills,
    select: (data) => data.data as Bill[],
  });

  const incomeThisMonth = useMemo(() => {
    if (!billsData) return 0;
    const monthName = months.find(m => m.value === selectedMonth)?.label || "";
    // Match bills based on selected month/year and "paid" status for actual collected income
    return billsData
      .filter(b => b.month.toLowerCase() === monthName.toLowerCase() && b.year.toString() === selectedYear && b.status === "paid")
      .reduce((sum, b) => sum + b.amount, 0);
  }, [billsData, selectedMonth, selectedYear]);

  const expenses = expensesData || [];
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [expenses, search]);

  const createMut = useMutation({
    mutationFn: createExpense,
    onMutate: async (newExpense) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previousExpenses = qc.getQueryData(["expenses"]);
      qc.setQueryData(["expenses"], (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newExpense, _id: "temp-id-" + Date.now() }]
      }));
      return { previousExpenses };
    },
    onSuccess: () => {
      toast.success("Expense added successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err, variables, context: any) => {
      qc.setQueryData(["expenses"], context.previousExpenses);
      toast.error("Failed to add expense");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateExpense(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previousExpenses = qc.getQueryData(["expenses"]);
      qc.setQueryData(["expenses"], (old: any) => ({
        ...old,
        data: old.data.map((e: any) => e._id === id ? { ...e, ...data } : e)
      }));
      return { previousExpenses };
    },
    onSuccess: () => {
      toast.success("Expense updated successfully");
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
    },
    onError: (err, variables, context: any) => {
      qc.setQueryData(["expenses"], context.previousExpenses);
      toast.error("Failed to update expense");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteExpense,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previousExpenses = qc.getQueryData(["expenses"]);
      qc.setQueryData(["expenses"], (old: any) => ({
        ...old,
        data: old.data.filter((e: any) => e._id !== id)
      }));
      return { previousExpenses };
    },
    onSuccess: () => {
      toast.success("Expense deleted successfully");
    },
    onError: (err, variables, context: any) => {
      qc.setQueryData(["expenses"], context.previousExpenses);
      toast.error("Failed to delete expense");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Other",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingId(null);
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description || "",
    });
    setEditingId(expense._id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
        return toast.error("Please fill in all required fields.");
    }
    
    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload as any);
    }
  };



  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between tracking-tight px-4 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">Expenses <span className="text-primary italic">&amp; Accounting</span></h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium mt-1">Track outgoing money and view your financial summaries.</p>
        </div>
        <Button
          className={cn(
            "rounded-2xl font-bold h-12 shadow-xl px-6 w-full lg:w-auto",
            "shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
          )}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        {/* Total Monthly Expenses */}
        <div className="rounded-[2rem] border bg-card/80 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Outflow</p>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-red-500 flex items-center"><IndianRupee className="mr-1 h-6 w-6"/> {summaryData?.total?.toLocaleString() || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-medium">Total expenses in selected period</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="rounded-[2rem] border bg-primary/5 dark:bg-primary/10 p-6 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Est. Net Profit</p>
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-primary flex items-center"><IndianRupee className="mr-1 h-6 w-6"/> {(incomeThisMonth - (summaryData?.total || 0)).toLocaleString()}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] sm:text-xs font-medium text-muted-foreground">
              <span className="text-green-500 font-bold">In: ₹{incomeThisMonth.toLocaleString()}</span>
              <span>-</span>
              <span className="text-red-500 font-bold">Out: ₹{(summaryData?.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Category Split */}
        <div className="rounded-[2rem] border bg-card/80 backdrop-blur-sm p-6 shadow-sm col-span-1 sm:col-span-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Top Spending Categories</p>
          <div className="flex flex-wrap gap-3 items-center h-full pb-2">
            {summaryData?.byCategory && summaryData.byCategory.length > 0 ? (
                summaryData.byCategory.slice(0, 3).map((cat: any) => (
                   <div key={cat.category} className="flex-1 min-w-[100px] bg-muted/30 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                        <p className="text-[10px] font-bold text-muted-foreground mb-1 truncate">{cat.category}</p>
                        <p className="text-lg sm:text-xl font-black">₹{cat.amount.toLocaleString()}</p>
                   </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground w-full py-4 font-medium h-fit">No category data for this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row items-center bg-card/50 p-4 rounded-[1.5rem] sm:rounded-[2rem] border backdrop-blur-sm mx-4 sm:mx-0">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 sm:h-14 bg-transparent border-none text-base sm:text-lg font-bold focus-visible:ring-0"
          />
        </div>
        <div className="h-8 w-[2px] bg-border hidden md:block" />

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="flex-1 md:w-36 lg:w-40 h-12 sm:h-14 border-none bg-muted/20 sm:bg-transparent text-sm sm:text-lg font-bold focus:ring-0 uppercase tracking-tighter rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="flex-1 md:w-24 lg:w-28 h-12 sm:h-14 border-none bg-muted/20 sm:bg-transparent text-sm sm:text-lg font-bold focus:ring-0 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expenses List */}
      <motion.div 
        layout
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="rounded-[2.5rem] border bg-card/50 shadow-sm overflow-hidden min-h-[400px] mx-4 sm:mx-0"
      >
        {expensesLoading ? (
            <TableLoader />
        ) : filteredExpenses.length > 0 ? (
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div className="divide-y">
                    {filteredExpenses.map((expense) => (
                        <motion.div 
                            layout
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 }
                            }}
                            exit={{ opacity: 0, x: -20 }}
                            key={expense._id} 
                            className="p-5 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", categoryColors[expense.category] || "bg-gray-100 text-gray-500 dark:bg-gray-800")}>
                                <PieChart className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 pr-4">
                                <h4 className="text-lg sm:text-xl font-black truncate">{expense.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-sm font-semibold text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1 shrink-0"><Tag className="w-3 h-3"/> {expense.category}</span>
                                    <span className="h-1 w-1 rounded-full bg-border shrink-0 hidden sm:block" />
                                    <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3"/> {new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                                <p className="text-xl sm:text-2xl font-black text-red-500 flex items-center"><IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> {expense.amount.toLocaleString()}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                                    onClick={() => handleEdit(expense)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this expense?")) {
                                            deleteMut.mutate(expense._id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        ) : (
            <div className="py-20 sm:py-32 px-6 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2">No Expenses Found</h3>
                <p className="text-muted-foreground text-sm font-medium max-w-sm">
                    No expense records match your current filters. Adjust your search or add a new expense.
                </p>
                <Button 
                    className="mt-6 rounded-xl font-bold px-6 shadow-xl shadow-primary/20"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add First Expense
                </Button>
            </div>
        )}
      </motion.div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b bg-muted/10 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black">{editingId ? "Edit" : "New"} <span className="text-primary italic">Expense</span></h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground font-semibold mt-1">Fill in the details below to record this expense.</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-muted/50 hover:bg-muted" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 sm:py-8 space-y-5 overflow-y-auto">
                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">Expense Title <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="e.g. November Electricity Bill" 
                    className="h-11 sm:h-12 rounded-xl bg-muted/30 border-none font-bold placeholder:font-medium focus-visible:ring-primary/20" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">Category <span className="text-red-500">*</span></label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger className="h-11 sm:h-12 rounded-xl bg-muted/30 border-none font-bold focus:ring-0">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                            {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">Amount (₹) <span className="text-red-500">*</span></label>
                    <Input 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        className="h-11 sm:h-12 rounded-xl bg-muted/30 border-none text-lg sm:text-xl font-black focus-visible:ring-primary/20" 
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">Date <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    className="h-11 sm:h-12 rounded-xl bg-muted/30 border-none font-bold text-muted-foreground focus-visible:ring-primary/20" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">Description (Optional)</label>
                  <Input 
                    placeholder="Additional details..." 
                    className="h-11 sm:h-12 rounded-xl bg-muted/30 border-none font-medium focus-visible:ring-primary/20" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 pb-4">
                  <Button type="button" variant="ghost" className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                    disabled={createMut.isPending || updateMut.isPending}
                  >
                    {(createMut.isPending || updateMut.isPending) ? "Saving..." : "Save Expense"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
