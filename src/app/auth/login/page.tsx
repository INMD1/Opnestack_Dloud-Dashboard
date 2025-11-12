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
      <div className="w-2/5 flex items-center justify-center">
        <div className="px-32 w-full">
          <p className="text-3xl font-bold">환영합니다!</p>

          <div className="grid pt-5 gap-y-3">
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

                <Button type="submit" className="w-full">
                  로그인
                </Button>
              </form>
            </Form>

            <hr className="my-4" />
            <div className="text-center">
              <p className="text-sm text-gray-400">아직 회원이 아니라면</p>
              <a href="/auth/register" className="text-sm font-bold">
                회원가입
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 배경 이미지 */}
      <div className="w-3/5">
        <img
          className="h-full w-full object-cover object-center"
          src="/image/auth/loginbackgorund.jpg"
          alt="배경"
        />
      </div>
    </div>
  );
}
