"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const handleLogin = () => {
    // Para este prototipo, simplemente redirigimos al panel de control.
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">¡Bienvenido!</CardTitle>
        <CardDescription>Haz clic en el botón para acceder al panel de control.</CardDescription>
      </CardHeader>
        <CardContent>
            {/* El contenido está vacío ya que no se necesitan campos de entrada */}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Acceder al Panel de Control
          </Button>
        </CardFooter>
    </Card>
  );
}
