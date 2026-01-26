'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';

interface AnnouncementFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: {
        id?: number;
        title: string;
        content: string;
    };
}

export default function AnnouncementForm({ onSuccess, onCancel, initialData }: AnnouncementFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!initialData?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/v1/announcements/${initialData.id}`
                : '/api/v1/announcements';

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '공지사항 저장에 실패했습니다.');
            }

            setTitle('');
            setContent('');
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                    제목
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="공지사항 제목을 입력하세요"
                    required
                    className="w-full px-4 py-3 bg-[#0F1117] border border-slate-700 rounded-lg
                             text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500
                             transition-colors"
                />
            </div>

            {/* 내용 입력 */}
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                    내용
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="공지사항 내용을 입력하세요"
                    required
                    rows={8}
                    className="w-full px-4 py-3 bg-[#0F1117] border border-slate-700 rounded-lg
                             text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500
                             transition-colors resize-none"
                />
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700
                                 transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        취소
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500
                             transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            저장 중...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            {isEditing ? '수정' : '등록'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
