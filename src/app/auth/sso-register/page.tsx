"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

type SSOProfile = {
    keystone_token: string;
    user: { id: string; name: string; email: string };
};

const formSchema = z.object({
    student_id: z.string().min(1, { message: "학번을 입력해주세요." }),
});

export default function SSORegisterPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<SSOProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { student_id: "" },
    });

    useEffect(() => {
        const stored = sessionStorage.getItem("sso_register_profile");
        if (!stored) {
            router.push("/auth/login");
            return;
        }
        try {
            setProfile(JSON.parse(stored));
        } catch {
            router.push("/auth/login");
        }
    }, [router]);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (!profile) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/sso-register-complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    keystone_token: profile.keystone_token,
                    user_id: profile.user.id,
                    email: profile.user.email,
                    student_id: data.student_id,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || "회원가입에 실패했습니다.");
                setIsLoading(false);
                return;
            }

            sessionStorage.removeItem("sso_register_profile");

            const signInRes = await signIn("sso-token", {
                keystone_token: profile.keystone_token,
                redirect: false,
            });

            if (signInRes?.ok) {
                router.push("/console");
            } else {
                setError("세션 생성에 실패했습니다. 다시 시도해주세요.");
                setIsLoading(false);
            }
        } catch {
            setError("오류가 발생했습니다. 다시 시도해주세요.");
            setIsLoading(false);
        }
    }

    if (!profile) return null;

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md px-8 py-10 glass rounded-2xl">
                <h1 className="text-3xl font-bold mb-2">
                    <span className="gradient-text">회원가입 완료</span>
                </h1>
                <p className="text-muted-foreground mb-6 text-sm">
                    학교 계정 인증이 완료되었습니다. 학번을 입력하여 가입을 마무리하세요.
                </p>

                <div className="mb-6 p-4 bg-muted/40 rounded-lg space-y-1 text-sm">
                    <p>
                        <span className="text-muted-foreground">이름: </span>
                        {profile.user.name}
                    </p>
                    <p>
                        <span className="text-muted-foreground">이메일: </span>
                        {profile.user.email}
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>학번</FormLabel>
                                    <FormControl>
                                        <Input placeholder="202412345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full gradient-primary text-white hover-lift"
                            disabled={isLoading}
                        >
                            {isLoading ? "처리 중..." : "회원가입 완료"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
