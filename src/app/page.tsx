
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Bot, FileClock, Workflow } from "lucide-react";
import Link from "next/link";

const features = [
    {
        icon: <Workflow className="h-8 w-8 text-primary" />,
        title: "Onboarding Optimizado",
        description: "Guía a los candidatos a través de un flujo de trabajo claro y por fases, desde la aplicación hasta la contratación.",
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "Asistencia con IA",
        description: "Utiliza la inteligencia artificial para detectar automáticamente documentos faltantes y agilizar el proceso de cumplimiento.",
    },
    {
        icon: <FileClock className="h-8 w-8 text-primary" />,
        title: "Cumplimiento y Alertas",
        description: "Recibe notificaciones automáticas sobre documentos que están a punto de vencer, garantizando el cumplimiento normativo.",
    },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Check className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline">Clear Comply HR</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4">
              Revoluciona tu Proceso de Contratación
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Clear Comply HR es la plataforma todo en uno que simplifica, automatiza y asegura el cumplimiento en cada paso del onboarding de tu personal.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Comienza Ahora</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Todo lo que necesitas, en un solo lugar</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                Desde la primera solicitud hasta el seguimiento de documentos, nuestra plataforma lo tiene cubierto.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                    ¿Listo para optimizar tu flujo de RRHH?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                    Crea una cuenta de prueba y descubre cómo Clear Comply HR puede transformar tu empresa.
                </p>
                <Button asChild size="lg">
                    <Link href="/login">Solicita una Demo</Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between p-4 md:px-6">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Clear Comply HR. Todos los derechos reservados.</p>
            <div className="flex gap-4">
                <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
                 <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
