"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import api from "@/src/api/api";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value, // O 'id' do input deve ser igual ao nome da chave no objeto
    }));
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);

      if (response.status === 200 || response.status === 201) {
        // O login funcionou! Agora sim redirecionamos:
        router.push("/dashboard");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Realize o login da conta</CardTitle>
          <CardDescription>
            Use seu e-mail abaixo para realizar login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-900"
                >
                  Login
                </Button>
                <FieldDescription className="text-center">
                  Não tem uma conta? <Link href="/signup">Inscreva-se</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
