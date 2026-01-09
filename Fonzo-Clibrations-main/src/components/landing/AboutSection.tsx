import { Wrench, Award, Clock, Users, CheckCircle2 } from "lucide-react";
import aboutImg from "../../assets/about.png";

export function AboutSection() {
  const features = [
    {
      icon: Wrench,
      title: "Expert Service",
      description: "Certified mechanics with years of experience",
    },
    {
      icon: Award,
      title: "Quality Parts",
      description: "Using only premium quality parts and materials",
    },
    {
      icon: Clock,
      title: "Quick Turnaround",
      description: "Fast and efficient service without compromising quality",
    },
    {
      icon: Users,
      title: "Customer First",
      description: "100% customer satisfaction guarantee",
    },
  ];

  const stats = [
    { value: "15+", label: "Years Experience" },
    { value: "5000+", label: "Happy Customers" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                About Us
              </p>
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                Trusted Car Repair Excellence
              </h2>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed">
              With over 15 years of experience in automotive repair and
              maintenance, Fonzo Clibration has become the trusted choice for
              vehicle owners in the area.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              Our team of certified mechanics uses state-of-the-art diagnostic
              equipment and quality parts to ensure your vehicle receives the
              best care possible. From routine maintenance to complex repairs,
              we handle it all with expertise and professionalism.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="relative group">
            <div className="aspect-square rounded-xl bg-card border border-border overflow-hidden shadow-lg relative">
              {/* Background Image with Parallax-like effect */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${aboutImg})` }}
              />

              {/* Gradient Overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/30 backdrop-blur-[2px]" />

              {/* Content Overlay with Glass Effect */}
              <div className="relative h-full w-full flex flex-col items-center justify-center p-8">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl p-8 border border-border/50 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-primary/20">
                  {/* Icon with Animation */}
                  <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto border-2 border-primary/30 group-hover:border-primary transition-all duration-500 group-hover:rotate-12">
                    <Wrench className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-foreground mb-3 text-center">
                    Professional Workshop
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                    Equipped with the latest diagnostic tools and equipment
                  </p>

                  {/* Feature List with Staggered Animation */}
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className="flex items-center gap-3 text-sm text-foreground bg-primary/5 rounded-lg p-2 transition-all duration-300 hover:bg-primary/10 hover:translate-x-1">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span>State-of-the-art equipment</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground bg-primary/5 rounded-lg p-2 transition-all duration-300 hover:bg-primary/10 hover:translate-x-1 delay-75">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span>Certified technicians</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground bg-primary/5 rounded-lg p-2 transition-all duration-300 hover:bg-primary/10 hover:translate-x-1 delay-150">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span>Quality guarantee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
