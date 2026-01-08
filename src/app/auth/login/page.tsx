"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const res = await signIn("credentials", {
      redirect: true,
      username: data.username,
      password: data.password,
      callbackUrl: "/console",
    });

    console.log("signIn result:", res);
  }

  return (
    <div className="flex h-screen overscroll-contain">
      {/* 로그인 폼 */}
      <div className="w-2/5 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="px-32 w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              <span className="gradient-text">환영합니다!</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              DCloud Infra 계정으로 로그인하세요
            </p>
          </div>

          <div className="grid gap-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gradient-primary text-white hover-lift">
                  로그인
                </Button>
              </form>
            </Form>

            <hr className="my-4" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">아직 회원이 아니라면</p>
              <Link href="/auth/register" className="text-sm font-bold gradient-text-cyan">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 배경 이미지 */}
      <div className="w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <img
          className="h-full w-full object-cover object-center mix-blend-overlay"
          src="/image/auth/loginbackgorund.jpg"
          alt="배경"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-12 glass rounded-2xl max-w-md">
            <h2 className="text-3xl font-bold mb-4">클라우드 인프라 관리</h2>
            <p className="text-lg opacity-90">
              OpenStack 기반의 강력한 클라우드 플랫폼으로
              <br />
              인스턴스, 네트워크, 스토리지를 쉽게 관리하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
