"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconUser, IconClock } from "@tabler/icons-react";

interface Announcement {
    id: number;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
    updated_at?: string;
    is_active: number;
}

export default function AnnouncementDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnnouncement() {
            try {
                const res = await fetch(`/api/v1/announcements/${params.id}`);
                const data = await res.json();

                if (res.ok) {
                    setAnnouncement(data.announcement);
                } else {
                    setError(data.error || "공지사항을 불러오지 못했습니다.");
                }
            } catch (err) {
                console.error("Failed to fetch announcement:", err);
                setError("공지사항을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        }

        if (params.id) {
            fetchAnnouncement();
        }
    }, [params.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="mx-auto px-14 py-8 space-y-6 max-w-5xl">
            {/* Back Button */}
            <Button
                variant="outline"
                onClick={() => router.push("/console/announcements")}
                className="flex items-center gap-2 hover-lift"
            >
                <IconArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
            </Button>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">오류 발생</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/console/announcements")}>
                            목록으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Announcement Detail */}
            {!isLoading && !error && announcement && (
                <Card className="hover-lift">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-3xl gradient-text-cyan">
                            {announcement.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                            <span className="flex items-center gap-2">
                                <IconUser className="h-5 w-5" />
                                <span className="font-medium">{announcement.author_name}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <IconClock className="h-5 w-5" />
                                <span>{formatDate(announcement.created_at)}</span>
                            </span>
                            {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                                <span className="text-sm text-muted-foreground">
                                    (수정됨: {formatDate(announcement.updated_at)})
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-base leading-relaxed">
                                {announcement.content}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Back Button (Bottom) */}
            {!isLoading && !error && announcement && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/console/announcements")}
                        className="flex items-center gap-2 hover-lift"
                    >
                        <IconArrowLeft className="h-4 w-4" />
                        목록으로 돌아가기
                    </Button>
                </div>
            )}
        </div>
    );
}
