"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBellExclamation, IconClock, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface Announcement {
    id: number;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
    is_active: number;
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const res = await fetch("/api/v1/announcements?limit=50&offset=0");
                const data = await res.json();

                if (res.ok) {
                    setAnnouncements(data.announcements || []);
                } else {
                    setError(data.error || "공지사항을 불러오지 못했습니다.");
                }
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
                setError("공지사항을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnnouncements();
    }, []);

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
        <div className="mx-auto px-14 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="gradient-primary p-3 rounded-xl">
                    <IconBellExclamation className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold gradient-text">공지사항</h1>
                    <p className="text-lg text-muted-foreground mt-1">
                        시스템 공지사항 및 업데이트 내역입니다.
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="hover-lift">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">오류 발생</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && announcements.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <IconBellExclamation className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-xl font-semibold text-muted-foreground">
                            등록된 공지사항이 없습니다.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            새로운 공지사항이 등록되면 여기에 표시됩니다.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Announcements List */}
            {!isLoading && !error && announcements.length > 0 && (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            className="hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg"
                            onClick={() => router.push(`/console/announcements/${announcement.id}`)}
                        >
                            <CardHeader>
                                <CardTitle className="text-2xl gradient-text-cyan">
                                    {announcement.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1">
                                        <IconUser className="h-4 w-4" />
                                        {announcement.author_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <IconClock className="h-4 w-4" />
                                        {formatDate(announcement.created_at)}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-2">
                                    {announcement.content.substring(0, 200)}
                                    {announcement.content.length > 200 && "..."}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
