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