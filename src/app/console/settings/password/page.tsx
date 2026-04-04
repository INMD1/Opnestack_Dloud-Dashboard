"use client";

import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    current_password: z.string().min(1, { message: "현재 비밀번호를 입력해주세요." }),
    new_password: z.string().min(8, { message: "새 비밀번호는 최소 8자 이상이어야 합니다." }),
    confirm_password: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "새 비밀번호가 일치하지 않습니다.",
    path: ["confirm_password"],
}).refine((data) => data.current_password !== data.new_password, {
    message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    path: ["new_password"],
});

export default function ChangePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch("/api/v1/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_password: data.current_password,
                    new_password: data.new_password,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.message || "비밀번호 변경에 실패했습니다.");
                return;
            }

            setSuccess(true);
            form.reset();
        } catch {
            setError("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto px-14 py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    <span className="gradient-text">비밀번호 변경</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                   DCloud 통합 계정 비밀번호를 변경합니다.
                </p>
            </div>

            <Card className="hover-lift">
                <CardHeader>
                    <CardTitle>비밀번호 설정</CardTitle>
                    <CardDescription>
                        현재 비밀번호를 입력한 후 새 비밀번호를 설정하세요. 변경 사항은 서버에 즉시 반영됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="current_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>현재 비밀번호</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="현재 비밀번호를 입력하세요"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>새 비밀번호</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="새 비밀번호 (최소 8자)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>새 비밀번호 확인</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="새 비밀번호를 다시 입력하세요"
                                                {...field}
                                            />
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

                            {success && (
                                <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800">
                                    비밀번호가 성공적으로 변경되었습니다. 다음 로그인 시 새 비밀번호를 사용하세요.
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full gradient-primary text-white hover-lift"
                                disabled={isLoading}
                            >
                                {isLoading ? "변경 중..." : "비밀번호 변경"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
