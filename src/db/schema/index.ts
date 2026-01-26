import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

//승인 현황
export const Student_accept = sqliteTable('Student_accept', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: text('user_id').notNull(),
    email: text('email').notNull(),
    acceptance: integer('acceptance').notNull(), // 0: false, 1: true
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

//인증 토큰 보관
export const verifiactionToken = sqliteTable('verificationToken', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: text('user_id').notNull(),
    email: text('email').notNull(),
    token: text('token').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull()
});

//임시 회원가입 정보 (이메일 인증 대기 중)
export const pendingUsers = sqliteTable('pending_users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('username').notNull(),
    password: text('password').notNull(), // 해시된 비밀번호
    name: text('name').notNull(),
    email: text('email').notNull(),
    student_id: text('student_id').notNull(),
    token: text('token').notNull().unique(), // 인증 토큰과 연결
    created_at: integer('created_at', { mode: 'timestamp' }).notNull()
});

// 관리자 목록
export const admins = sqliteTable('admins', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: text('user_id').notNull().unique(), // OpenStack user ID
    username: text('username').notNull(), // 관리자 이름
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 공지사항
export const announcements = sqliteTable('announcements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    author_id: text('author_id').notNull(), // 작성자 user_id
    author_name: text('author_name').notNull(), // 작성자 이름
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    is_active: integer('is_active').notNull().default(1), // 0: 삭제됨, 1: 활성
});