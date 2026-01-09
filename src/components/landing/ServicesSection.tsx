import {
  Droplet,
  Disc,
  Gauge,
  Battery,
  Wind,
  Car,
  Wrench,
  Zap,
} from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: Droplet,
      title: "Oil Change",
      description: "Quick and thorough oil change service with premium quality oils"
    },
    {
      icon: Disc,
      title: "Brake Repair",
      description: "Complete brake system inspection, repair, and replacement"
    },
    {
      icon: Gauge,
      title: "Engine Diagnostics",
      description: "Advanced computer diagnostics to identify engine issues"
    },
    {
      icon: Battery,
      title: "Battery Service",
      description: "Battery testing, replacement, and electrical system checks"
    },
    {
      icon: Wind,
      title: "AC Repair",
      description: "Air conditioning system repair and refrigerant recharge"
    },
    {
      icon: Car,
      title: "Tire Service",
      description: "Tire rotation, alignment, balancing, and replacement"
    },
    {
      icon: Wrench,
      title: "General Maintenance",
      description: "Scheduled maintenance and tune-ups for all vehicle types"
    },
    {
      icon: Zap,
      title: "Transmission Service",
      description: "Transmission fluid change, repair, and diagnostics"
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Our Services</p>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Comprehensive Auto Care
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From routine maintenance to complex repairs, we offer comprehensive
            automotive services to keep your vehicle running smoothly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <service.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
              
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see what you need?
            <a href="#contact" className="ml-1 text-primary font-medium hover:underline">
              Contact us for custom service requests
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
