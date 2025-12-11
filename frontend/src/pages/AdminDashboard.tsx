import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Eye, Download, Check, X, CreditCard, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [quotations, setQuotations] = useState([]);
    const [filteredQuotations, setFilteredQuotations] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast(); // Assuming you have a toast hook or use console
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        fetchQuotations();
    }, []);

    useEffect(() => {
        if (statusFilter === "all") {
            setFilteredQuotations(quotations);
        } else {
            setFilteredQuotations(quotations.filter((q: any) => q.status === statusFilter));
        }
    }, [statusFilter, quotations]);

    const fetchQuotations = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/signin");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/admin/quotations/`, {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setQuotations(data.quotations);
            } else {
                if (response.status === 403) {
                    alert("Access Denied: Admin privileges required.");
                    navigate("/");
                }
                console.error("Failed to fetch quotations");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (!confirm(`Are you sure you want to mark this quotation as ${newStatus}?`)) return;

        try {
            const response = await fetch(`${backendUrl}/api/admin/quotations/${id}/status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Refresh list
                fetchQuotations();
                alert(`Status updated to ${newStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDownloadQuotation = async (quotationId: string) => {
        // ... (reuse download logic from Quotations.tsx)
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${backendUrl}/api/quotations/${quotationId}/download/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `quotation_${quotationId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("Failed to download PDF (Drafts might not have one)");
            }
        } catch (e) { console.error(e); }
    };


    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500';
            case 'paid': return 'bg-blue-500/20 text-blue-500';
            case 'in progress': return 'bg-cyan-500/20 text-cyan-500';
            case 'done': return 'bg-green-500/20 text-green-500';
            case 'rejected': return 'bg-red-500/20 text-red-500';
            case 'draft': return 'bg-gray-500/20 text-gray-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="container mx-auto px-4 pt-24 pb-16">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                    <CardContent className="pt-6">
                        {loading ? <p>Loading...</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/50 text-left">
                                            <th className="py-4 px-2">ID</th>
                                            <th className="py-4 px-2">User</th>
                                            <th className="py-4 px-2">Services</th>
                                            <th className="py-4 px-2">Price (₦)</th>
                                            <th className="py-4 px-2">Status</th>
                                            <th className="py-4 px-2">Date</th>
                                            <th className="py-4 px-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuotations.map((q: any) => (
                                            <tr key={q.quotation_id} className="border-b border-border/50 hover:bg-muted/30">
                                                <td className="py-4 px-2 font-medium">{q.quotation_id}</td>
                                                <td className="py-4 px-2">
                                                    <div className="flex flex-col">
                                                        <span>{q.user_name}</span>
                                                        <span className="text-xs text-muted-foreground">{q.user_email}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-sm max-w-[200px] truncate">
                                                    {q.selected_services.map((s: any) => s.name).join(", ")}
                                                </td>
                                                <td className="py-4 px-2 text-sm">
                                                    ₦{parseFloat(q.price_estimate_min_naira).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <Badge className={getStatusColor(q.status)}>{q.status}</Badge>
                                                </td>
                                                <td className="py-4 px-2 text-sm text-muted-foreground">
                                                    {new Date(q.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" title="Download PDF" onClick={() => handleDownloadQuotation(q.quotation_id)}>
                                                            <Download className="h-4 w-4" />
                                                        </Button>

                                                        {q.status === 'Pending' && (
                                                            <Button variant="outline" size="sm" onClick={() => updateStatus(q.quotation_id, 'Paid')} className="text-blue-500 border-blue-200 hover:bg-blue-100">
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                        {(q.status === 'Paid' || q.status === 'In Progress') && (
                                                            <Button variant="outline" size="sm" onClick={() => updateStatus(q.quotation_id, 'Done')} className="text-green-500 border-green-200 hover:bg-green-100">
                                                                Mark Done
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
            <DarkModeToggle />
        </div>
    );
};

export default AdminDashboard;
