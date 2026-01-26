'use client';

import { useState, useEffect } from 'react';
import { Bell, ChevronRight, Calendar } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
}

export default function AnnouncementList() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/v1/announcements?limit=5');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* 공지사항 목록 */}
            {announcements.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>등록된 공지사항이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            onClick={() => setSelectedAnnouncement(announcement)}
                            className="group p-5 bg-[#0F1117] border border-slate-800 rounded-xl cursor-pointer
                                     hover:border-cyan-500/50 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                                        {announcement.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                                        {announcement.content}
                                    </p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(announcement.created_at)}
                                        </span>
                                        <span>by {announcement.author_name}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 상세 모달 */}
            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[80vh] bg-[#0F1117] border border-slate-700 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div className="p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white pr-8">
                                {selectedAnnouncement.title}
                            </h2>
                            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(selectedAnnouncement.created_at)}
                                </span>
                                <span>by {selectedAnnouncement.author_name}</span>
                            </div>
                        </div>

                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setSelectedAnnouncement(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center 
                                     text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            ✕
                        </button>

                        {/* 모달 내용 */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedAnnouncement.content}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
