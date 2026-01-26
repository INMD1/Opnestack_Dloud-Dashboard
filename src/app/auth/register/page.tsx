"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    username: z.string().min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." }),
    password: z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
    confirmPassword: z.string().min(6, { message: "비밀번호 확인을 입력해주세요." }),
    name: z.string().min(2, { message: "이름은 최소 2자 이상이어야 합니다." }),
    email: z.string().email({ message: "올바른 이메일 주소를 입력해주세요." }),
    student_id: z.string().min(1, { message: "학번을 입력해주세요." }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            name: "",
            email: "",
            student_id: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/verfi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                    name: data.name,
                    email: data.email,
                    student_id: data.student_id,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || "회원가입에 실패했습니다.");
                setIsLoading(false);
                return;
            }

            // 이메일 전송 성공
            alert(`인증 이메일이 ${data.email}로 전송되었습니다.\n\n이메일을 확인하여 인증을 완료해주세요.`);
            router.push("/auth/login");
        } catch (err) {
            console.error("Signup error:", err);
            setError("회원가입 중 오류가 발생했습니다.");
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen overscroll-contain">
            {/* 회원가입 폼 */}
            <div className="w-[53vw] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <div className="px-24 w-full max-h-screen overflow-y-auto py-8">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold">
                            <span className="gradient-text">회원가입</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            DCloud Infra에 오신 것을 환영합니다!
                        </p>
                    </div>

                    <div className="grid gap-y-3">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                {/* Username */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>사용자 이름</FormLabel>
                                            <FormControl>
                                                <Input placeholder="사용자 이름을 입력하세요" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이름</FormLabel>
                                            <FormControl>
                                                <Input placeholder="홍길동" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Student ID */}
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

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이메일</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="your@email.com" {...field} />
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
                                            <FormLabel>비밀번호</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="비밀번호 (최소 6자)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Confirm Password */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>비밀번호 확인</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="비밀번호를 다시 입력하세요" {...field} />
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
                                    {isLoading ? "처리 중..." : "회원가입"}
                                </Button>
                                <p className="text-xs text-muted-foreground">*회원가입이 되면 자동으로 <a href="/privacy-policy" className="text-primary">개인정보처리방침</a>과 <a href="/TermsofUse" className="text-primary">서비스 이용약관</a>에 동의한걸로 처리됩니다.</p>
                            </form>
                        </Form>

                        <hr className="my-3" />

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">이미 계정이 있으신가요?</p>
                            <Link href="/auth/login" className="text-sm font-bold gradient-text-cyan">
                                로그인하기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오른쪽 배경 이미지 */}
            <div className="w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <Image
                    className="h-full w-full object-cover object-center mix-blend-overlay"
                    src="/image/auth/loginbackgorund.jpg"
                    alt="배경"
                    fill
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-left text-white p-12 glass rounded-2xl max-w-md">
                        <h2 className="text-3xl font-bold mb-4">클라우드 인프라 관리</h2>
                        <p className="text-lg opacity-90">
                            OpenStack 기반의 강력한 클라우드 플랫폼으로
                            인스턴스, 네트워크, 스토리지를 쉽게 관리하세요
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
