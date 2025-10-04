import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What services does Boost Promotions offer?",
    answer: "We offer a comprehensive range of digital services including content marketing, graphic design, video editing, cloud hosting, market research, and virtual assistance to help your business grow."
  },
  {
    question: "How long does it take to complete a project?",
    answer: "Project timelines vary depending on scope and complexity. Typically, smaller projects take 1-2 weeks while larger initiatives may take 4-8 weeks. We'll provide a detailed timeline during our consultation."
  },
  {
    question: "Do you work with businesses of all sizes?",
    answer: "Yes! We work with startups, small businesses, and large enterprises. Our scalable solutions are designed to grow with your business needs."
  },
  {
    question: "What makes Boost Promotions different?",
    answer: "Our personalized approach, cutting-edge strategies, and commitment to delivering measurable results set us apart. We focus on building long-term partnerships with our clients."
  },
  {
    question: "How do you measure success?",
    answer: "We track key performance indicators relevant to your goals, including engagement rates, conversion metrics, brand awareness, and ROI. Regular reporting keeps you informed of progress."
  }
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            <span className="text-primary">Frequently Asked</span> Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our services and process
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-elegant transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-left hover:text-primary transition-colors duration-300 text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;