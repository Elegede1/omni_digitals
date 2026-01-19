import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Works = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        fetchWorks();
    }, []);

    const fetchWorks = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/works/`);
            if (response.ok) {
                const data = await response.json();
                setWorks(data.works);
            }
        } catch (error) {
            console.error("Error fetching works:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseModel = (id: string) => {
        navigate(`/request-quotation?template=${id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="container mx-auto px-4 pt-24 pb-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Our Works</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explore our completed projects and use them as templates for your own success.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center">Loading works...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {works.map((work: any) => (
                            <Card key={work.quotation_id} className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 mb-2">
                                            Completed Project
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{work.duration}</span>
                                    </div>
                                    <CardTitle>Project {work.quotation_id.slice(0, 8)}...</CardTitle>
                                    <CardDescription>
                                        Budget Range: ₦{parseFloat(work.price_estimate_min_naira).toLocaleString()} - ₦{parseFloat(work.price_estimate_max_naira).toLocaleString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold mb-2">Services Delivered:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {work.selected_services.map((s: any, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {s.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => handleUseModel(work.quotation_id)} className="w-full group">
                                        Use as Model
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {works.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground mt-12">
                        No completed works to display yet. Check back soon!
                    </div>
                )}
            </div>
            <Footer />
                    </div>
    );
};

export default Works;
