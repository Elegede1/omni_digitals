import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, Heart, Shield, Layers, TrendingUp, Users } from "lucide-react";

const AboutSection = () => {
    return (
        <section id="about" className="py-20 bg-background relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
                    <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Who We Are</Badge>
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-6">
                        About Omni Digitals
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Omni Digitals is a modern digital solutions, operations, and community‑driven brand built to help individuals, creators, startups, and businesses thrive in an increasingly digital world.
                    </p>
                </div>

                {/* Philosophy */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="space-y-6 animate-slide-right">
                        <h3 className="text-3xl font-bold">Where Excellence Meets Reliability.</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            At Omni Digitals, we believe that true digital success comes from combining high standards (excellence) with consistency, trust, and dependability (reliability). We do not chase trends or shortcuts — we build systems, brands, and solutions that last.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Omni Digitals is more than a service provider. We are a digital partner, a support system, and a growing ecosystem designed to create long‑term value.
                        </p>
                    </div>
                    <div className="relative animate-scale-in">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-card border-none shadow-elegant transform hover:-translate-y-2 transition-transform duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-semibold">Excellence</h4>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-elegant transform translate-y-8 hover:translate-y-6 transition-transform duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-semibold">Reliability</h4>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-elegant transform hover:-translate-y-2 transition-transform duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Layers className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-semibold">Structure</h4>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-elegant transform translate-y-8 hover:translate-y-6 transition-transform duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-semibold">Growth</h4>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-8 mb-24">
                    <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <Target className="w-8 h-8 text-primary" />
                                Our Vision
                            </h3>
                            <p className="text-muted-foreground">
                                Our vision is to become a leading African‑rooted, globally relevant digital brand that empowers businesses, creatives, and communities through innovation, structure, and dependable digital systems.
                            </p>
                            <ul className="space-y-3">
                                {['African brands confident on global stage', 'Digital tools creating economic ops', 'Creativity supported by structure'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <Heart className="w-8 h-8 text-primary" />
                                Our Mission
                            </h3>
                            <p className="text-muted-foreground">
                                Our mission is to simplify digital growth by delivering reliable, transparent, and high‑quality digital services while building a structured community where participation is rewarded.
                            </p>
                            <ul className="space-y-3">
                                {['Professional digital solutions', 'Support beyond delivery', 'Integrity & Clarity'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Services & Values Grid */}
                <div className="grid lg:grid-cols-2 gap-16 mb-24">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-bold">What We Do</h3>
                        <p className="text-muted-foreground">
                            Omni Digitals provides a wide range of digital and operational services designed to meet real‑world needs. We also operate Omni Man, our offline and field‑based services division.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                'Digital marketing & Strategy', 'Graphic Design & Identity',
                                'Website Design & Dev', 'Content Creation',
                                'Business Support', 'Community Solutions'
                            ].map((service, i) => (
                                <div key={i} className="p-4 bg-secondary/30 rounded-lg text-sm font-medium border border-border/50 hover:border-primary/50 transition-colors">
                                    {service}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-3xl font-bold">Our Core Values</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Excellence', desc: 'Quality, skill, and professionalism in every interaction.' },
                                { title: 'Reliability', desc: 'We show up, deliver consistently, and build trust.' },
                                { title: 'Integrity', desc: 'Transparency, honesty, and ethical operations.' },
                                { title: 'Structure', desc: 'Clear systems, roles, and processes create freedom.' }
                            ].map((value, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-2 h-full min-h-[50px] bg-primary/20 rounded-full relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-primary"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{value.title}</h4>
                                        <p className="text-muted-foreground text-sm">{value.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Community Section */}
                <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 text-center animate-fade-in">
                    <Badge className="mb-4 bg-secondary text-secondary-foreground">Community First</Badge>
                    <h3 className="text-3xl font-bold mb-6">Our Community‑First Ecosystem</h3>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                        A major pillar of Omni Digitals is our website‑based community ecosystem. Built on structure, contribution, and merit, members earn points to unlock rewards, gift cards, and leadership roles.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Engagement Points', 'Gift Card Levels', 'Leadership Roles', 'Exclusive Access'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Exists */}
                <div className="mt-24 text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold mb-6">Why Omni Digitals Exists</h3>
                    <p className="text-lg text-muted-foreground mb-8">
                        Many businesses and creatives struggle not because they lack ideas, but because they lack structure, consistency, and reliable digital support. We exist to solve that problem.
                    </p>
                    <p className="text-xl font-semibold text-primary">
                        "Where Excellence Meets Reliability"
                    </p>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
