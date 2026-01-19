import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, Heart, Shield, Layers, TrendingUp, Users, ArrowRight, Lightbulb, Globe, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden bg-gradient-hero">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-1 text-sm">Our Story</Badge>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
                            Redefining the <span className="text-primary">Digital Frontier</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up">
                            Omni Digitals is not just a company; it's a movement bridging the gap between innovative digital strategies and reliable operational excellence. We empower those who build the future.
                        </p>
                    </div>
                </section>

                {/* Extended Brand Story */}
                <section className="py-24 bg-background px-4">
                    <div className="container mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 animate-slide-right">
                                <h2 className="text-4xl font-bold leading-tight">Where Excellence Meets Reliability.</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Founded on the principle that digital growth should be accessible, structured, and dependable, Omni Digitals has evolved into a comprehensive ecosystem. We recognized a recurring problem: many businesses and creators struggle not because they lack ideas, but because they lack the consistency and structure to execute them globally.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Our approach is multi-dimensional. We combine top-tier creative talent with rigorous operational standards. Whether it's crafting a high-conversion digital campaign or deploying field operations through our "Omni Man" division, we apply the same commitment to excellence.
                                </p>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-sm">Industry Experts</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-sm">Global Reach</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative animate-scale-in">
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl rounded-3xl"></div>
                                <div className="relative bg-card border border-border/50 rounded-3xl p-10 shadow-elegant overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Target className="w-32 h-32" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-6">Our DNA</h3>
                                    <div className="space-y-6">
                                        {[
                                            { title: "Excellence", desc: "We don't just deliver; we exceed norms and set new benchmarks in quality and design." },
                                            { title: "Reliability", desc: "When we commit, we deliver. Consistency is our strongest asset and your greatest gain." },
                                            { title: "Sovereignty", desc: "Empowering our clients and community to have total control over their digital assets." }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="mt-1 w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission Gird */}
                <section className="py-24 bg-secondary/30 relative">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12">
                            <Card className="bg-background border-none shadow-glow p-8 space-y-6 transform hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">Our Vision</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    To become a leading African-rooted, globally relevant digital brand that empowers businesses, creatives, and communities through innovation, structure, and dependable digital systems.
                                </p>
                                <div className="space-y-4 pt-4">
                                    {["Empowering 1000+ African brands globally", "Setting the standard for digital reliability", "Building a merit-based reward ecosystem"].map((point, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                            <span className="text-sm font-medium">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="bg-background border-none shadow-glow p-8 space-y-6 transform hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Heart className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">Our Mission</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    To simplify digital growth by delivering reliable, transparent, and high-quality digital services while building a structured community where participation is rewarded.
                                </p>
                                <div className="space-y-4 pt-4">
                                    {["Delivering results without bureaucracy", "Incentivizing community skill development", "Proving that African excellence is world-class"].map((point, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                            <span className="text-sm font-medium">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why We Exist */}
                <section className="py-24 bg-background relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <div className="inline-block p-1 mb-8 bg-gradient-to-r from-primary to-primary/50 rounded-full">
                            <div className="bg-background rounded-full px-6 py-2">
                                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">The Problem We Solve</span>
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-10 leading-tight">
                            The gap between <span className="italic text-primary">ideation</span> and <span className="italic text-primary">realization</span> is structure.
                        </h2>
                        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                            Many talented individuals and ambitious companies fail to reach their full potential because they are overwhelmed by the technicalities of the digital age. Omni Digitals exists to remove that friction. We provide the structure so you can focus on the vision.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 text-left py-10">
                            {[
                                { icon: Lightbulb, title: "Creative Ideation", text: "We help you refine your core digital identity and narrative." },
                                { icon: Layers, title: "Structured Execution", text: "We build the systems and campaigns to bring ideas to life." },
                                { icon: Shield, title: "Reliable Support", text: "We stand by you as your long-term digital maintenance partner." }
                            ].map((box, i) => (
                                <div key={i} className="space-y-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                                    <box.icon className="w-10 h-10 text-primary" />
                                    <h4 className="text-xl font-bold">{box.title}</h4>
                                    <p className="text-muted-foreground text-sm">{box.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Community ecosystem teasers */}
                <section className="py-24 bg-primary text-primary-foreground relative">
                    <div className="container mx-auto px-4 text-center">
                        <Users className="w-16 h-16 mx-auto mb-8 opacity-50" />
                        <h2 className="text-4xl font-bold mb-6">More Than a Service Provider</h2>
                        <p className="text-xl max-w-2xl mx-auto mb-10 opacity-90">
                            Our community-first ecosystem rewards engagement and contribution. Users earn points, unlock leadership roles, and access exclusive growth opportunities.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/community">
                                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8">
                                    Explore Community
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                    Join Our Movement
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
