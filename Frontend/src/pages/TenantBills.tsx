import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getMyBills, downloadBill } from "@/api/billing.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { TableLoader } from "@/components/Loader";
import { Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TenantBills() {
    const { data: bills, isLoading } = useQuery({
        queryKey: ["my-bills"],
        queryFn: getMyBills,
        select: (res: any) => res.data
    });

    const downloadPDF = async (billId: string) => {
        try {
            const blob = await downloadBill(billId);

            // Check if Blob is actually a JSON error (happens with responseType: 'blob')
            if (blob.type === "application/json") {
                const text = await blob.text();
                const error = JSON.parse(text);
                toast.error(error.message || "Failed to download PDF bill");
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `bill-${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("PDF Download error:", error);
            toast.error("Failed to download PDF bill. Please try again.");
        }
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">My <span className="text-primary italic">Rent Bills</span></h1>
                <p className="text-muted-foreground font-medium text-lg">View and download your monthly rent invoices</p>
            </div>

            {isLoading ? <TableLoader /> : (
                <div className="space-y-6">
                    {/* Mobile Card View */}
                    <div className="grid gap-6 md:hidden">
                        {bills?.map((bill: any) => (
                            <motion.div
                                key={bill._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card rounded-[2.5rem] border p-8 shadow-sm flex flex-col gap-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Receipt className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{bill.month}</h3>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{bill.year || new Date().getFullYear()}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={bill.status as any} type="bill" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-dashed">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Rent</p>
                                        <p className="text-lg font-bold">₹{(bill.amount - (bill.electricity || 0) - (bill.extraCharges || 0)).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Electricity</p>
                                        <p className="text-lg font-bold">₹{(bill.electricity || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Extra Charges</p>
                                        <p className="text-lg font-bold">₹{(bill.extraCharges || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Total Amount</p>
                                        <p className="text-2xl font-black text-primary">₹{bill.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/10 text-lg" 
                                    onClick={() => downloadPDF(bill._id)}
                                >
                                    <Download className="h-5 w-5" /> DOWNLOAD RECEIPT
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-[2.5rem] border bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden border-border/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="pl-8 py-6">Month</TableHead>
                                    <TableHead>Rent</TableHead>
                                    <TableHead>Electricity</TableHead>
                                    <TableHead>Extra</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-8">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills?.map((bill: any) => (
                                    <TableRow key={bill._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-black pl-8 py-6 text-lg">{bill.month}</TableCell>
                                        <TableCell className="font-medium text-muted-foreground">₹{(bill.amount - (bill.electricity || 0) - (bill.extraCharges || 0)).toLocaleString()}</TableCell>
                                        <TableCell className="font-medium text-muted-foreground">₹{(bill.electricity || 0).toLocaleString()}</TableCell>
                                        <TableCell className="font-medium text-muted-foreground">₹{(bill.extraCharges || 0).toLocaleString()}</TableCell>
                                        <TableCell className="font-black text-xl text-primary font-heading">₹{bill.amount.toLocaleString()}</TableCell>
                                        <TableCell><StatusBadge status={bill.status as any} type="bill" /></TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button variant="ghost" size="sm" className="font-black rounded-xl h-10 px-4 hover:bg-primary/10 text-primary transition-all" onClick={() => downloadPDF(bill._id)}>
                                                <Download className="mr-2 h-4 w-4" /> RECEIPT ⬇️
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {(!bills || bills.length === 0) && (
                        <div className="py-24 text-center space-y-6 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
                            <Receipt className="h-20 w-20 mx-auto text-muted-foreground/20" />
                            <div className="space-y-1">
                                <p className="text-3xl font-black tracking-tight">No Bills Found</p>
                                <p className="text-muted-foreground font-medium text-lg">Your monthly invoices will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
