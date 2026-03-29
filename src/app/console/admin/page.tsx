'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Bell, AlertTriangle, Calendar, Mail, ShieldCheck } from 'lucide-react';
import AnnouncementForm from '@/components/announcements/AnnouncementForm';

interface Announcement {
    id: number;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
}

interface AllowedEmail {
    id: number;
    email: string;
    description: string | null;
    added_by: string;
    created_at: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<'announcements' | 'allowed-emails'>('announcements');

    // 공지사항 상태
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // 허용 이메일 상태
    const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
    const [emailsLoading, setEmailsLoading] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailAdding, setEmailAdding] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            checkAdminStatus();
        }
    }, [status, router]);

    const checkAdminStatus = async () => {
        try {
            const res = await fetch('/api/v1/admin/check');
            const data = await res.json();
            setIsAdmin(data.isAdmin);

            if (data.isAdmin) {
                fetchAnnouncements();
                fetchAllowedEmails();
            }
        } catch (error) {
            console.error('Admin check failed:', error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/v1/announcements?limit=50');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    const fetchAllowedEmails = async () => {
        setEmailsLoading(true);
        try {
            const res = await fetch('/api/v1/admin/allowed-emails');
            if (res.ok) {
                const data = await res.json();
                setAllowedEmails(data.emails);
            }
        } catch (error) {
            console.error('Failed to fetch allowed emails:', error);
        } finally {
            setEmailsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const res = await fetch(`/api/v1/announcements/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAnnouncements();
            } else {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingAnnouncement(null);
        fetchAnnouncements();
    };

    const handleAddEmail = async () => {
        setEmailError('');
        if (!newEmail.trim()) {
            setEmailError('이메일을 입력해주세요.');
            return;
        }

        setEmailAdding(true);
        try {
            const res = await fetch('/api/v1/admin/allowed-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail.trim(), description: newDescription.trim() || undefined }),
            });

            const data = await res.json();

            if (res.ok) {
                setNewEmail('');
                setNewDescription('');
                fetchAllowedEmails();
            } else {
                setEmailError(data.error || '추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Add email failed:', error);
            setEmailError('추가 중 오류가 발생했습니다.');
        } finally {
            setEmailAdding(false);
        }
    };

    const handleDeleteEmail = async (id: number, email: string) => {
        if (!confirm(`"${email}" 이메일을 허용 목록에서 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/v1/admin/allowed-emails/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAllowedEmails();
            } else {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete email failed:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 로딩 중
    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    // 관리자가 아닌 경우
    if (isAdmin === false) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">접근 권한이 없습니다</h1>
                    <p className="text-slate-400 mb-6">이 페이지는 관리자만 접근할 수 있습니다.</p>
                    <button
                        onClick={() => router.push('/console')}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                        콘솔로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="container mx-auto px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        관리자 페이지
                    </h1>
                    <p className="text-slate-400 mt-2">공지사항 및 회원가입 허용 이메일을 관리합니다.</p>
                </div>

                {/* 탭 */}
                <div className="flex gap-1 mb-6 bg-[#0F1117] border border-slate-800 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                            activeTab === 'announcements'
                                ? 'bg-cyan-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Bell className="w-4 h-4" />
                        공지사항 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('allowed-emails')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                            activeTab === 'allowed-emails'
                                ? 'bg-cyan-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Mail className="w-4 h-4" />
                        허용 이메일 관리
                    </button>
                </div>

                {/* 공지사항 탭 */}
                {activeTab === 'announcements' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-400 text-sm">공지사항을 등록, 수정, 삭제할 수 있습니다.</p>
                            <button
                                onClick={() => {
                                    setEditingAnnouncement(null);
                                    setShowForm(true);
                                }}
                                className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500
                                         transition-colors flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                새 공지사항
                            </button>
                        </div>

                        {/* 작성/수정 폼 */}
                        {(showForm || editingAnnouncement) && (
                            <div className="mb-8 p-6 bg-[#0F1117] border border-slate-800 rounded-xl">
                                <h2 className="text-xl font-bold mb-4">
                                    {editingAnnouncement ? '공지사항 수정' : '새 공지사항 작성'}
                                </h2>
                                <AnnouncementForm
                                    onSuccess={handleFormSuccess}
                                    onCancel={() => {
                                        setShowForm(false);
                                        setEditingAnnouncement(null);
                                    }}
                                    initialData={editingAnnouncement ? {
                                        id: editingAnnouncement.id,
                                        title: editingAnnouncement.title,
                                        content: editingAnnouncement.content
                                    } : undefined}
                                />
                            </div>
                        )}

                        {/* 공지사항 목록 */}
                        <div className="bg-[#0F1117] border border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                <h2 className="font-semibold text-slate-200">등록된 공지사항 ({announcements.length})</h2>
                            </div>

                            {announcements.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>등록된 공지사항이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {announcements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="p-5 hover:bg-slate-900/30 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {announcement.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                                                        {announcement.content}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(announcement.created_at)}
                                                        </span>
                                                        <span>by {announcement.author_name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setShowForm(false);
                                                            setEditingAnnouncement(announcement);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800
                                                                 rounded-lg transition-colors"
                                                        title="수정"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(announcement.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800
                                                                 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* 허용 이메일 탭 */}
                {activeTab === 'allowed-emails' && (
                    <>
                        <div className="mb-6">
                            <p className="text-slate-400 text-sm">
                                학교 이메일(office.deu.ac.kr) 외에 회원가입을 허용할 이메일을 관리합니다.
                            </p>
                        </div>

                        {/* 이메일 추가 폼 */}
                        <div className="mb-6 p-6 bg-[#0F1117] border border-slate-800 rounded-xl">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-cyan-400" />
                                이메일 추가
                            </h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                                        placeholder="허용할 이메일 주소"
                                        className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg
                                                 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500
                                                 transition-colors text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                                        placeholder="허용 사유 (선택)"
                                        className="w-64 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg
                                                 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500
                                                 transition-colors text-sm"
                                    />
                                    <button
                                        onClick={handleAddEmail}
                                        disabled={emailAdding}
                                        className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500
                                                 transition-colors flex items-center gap-2 font-medium disabled:opacity-50
                                                 disabled:cursor-not-allowed shrink-0"
                                    >
                                        {emailAdding ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        추가
                                    </button>
                                </div>
                                {emailError && (
                                    <p className="text-red-400 text-sm">{emailError}</p>
                                )}
                            </div>
                        </div>

                        {/* 허용 이메일 목록 */}
                        <div className="bg-[#0F1117] border border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                <h2 className="font-semibold text-slate-200">
                                    허용된 이메일 목록 ({allowedEmails.length})
                                </h2>
                            </div>

                            {emailsLoading ? (
                                <div className="p-12 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
                                </div>
                            ) : allowedEmails.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>허용된 이메일이 없습니다.</p>
                                    <p className="text-xs mt-1">현재 학교 이메일(office.deu.ac.kr)만 가입 가능합니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {allowedEmails.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-5 hover:bg-slate-900/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white">{item.email}</p>
                                                    {item.description && (
                                                        <p className="mt-0.5 text-sm text-slate-400">{item.description}</p>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEmail(item.id, item.email)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800
                                                             rounded-lg transition-colors shrink-0"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
