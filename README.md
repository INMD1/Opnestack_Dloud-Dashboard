# 🚀 DCloud Infra Dashboard

OpenStack 기반의 클라우드 인프라를 관리하기 위한 현대적인 웹 대시보드입니다. Next.js 16과 React 19를 기반으로 구축되었으며, 직관적이고 반응성이 뛰어난 사용자 경험을 제공합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19.2.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## ✨ 주요 기능

### 📊 대시보드 및 공지사항
- **실시간 리소스 모니터링**: CPU, 메모리, 디스크 사용량 실시간 추적
- **할당량(Quota) 관리**: 프로젝트별 리소스 한도 및 사용량 시각화
- **활동 로그**: 프로젝트 내 모든 활동 기록 및 타임라인 표시
- **공지사항(Announcements)**: 시스템 중요 공지 및 업데이트 내역 확인

### 💻 인스턴스 관리
- **생성 및 관리**: 다양한 flavor와 이미지로 VM 인스턴스 생성 및 상태(시작, 중지, 재시작 등) 제어
- **메타데이터 정보 제공**: 생성된 인스턴스의 OS 등 메타데이터 정보를 보존 및 상세 화면에 표시
- **원격 접속**: NoVNC를 통한 웹 기반 콘솔 접속
- **안전한 생성/삭제 프로세스**: 인스턴스 이름 중복 방지 로직과 확인 → 작업 중 → 완료의 3단계 워크플로 제공

### 🌐 네트워크 및 보안 관리
- **자동 SSH 포워딩**: VM 생성 시 SSH 포트(22번)를 위한 포워딩 규칙 자동 설정 지원
- **동적 포트 포워딩**: 외부망에서 인스턴스 내부의 지정된 포트로 접근할 수 있는 동적 규칙 제공
- **VM 네트워크 격리**: 포트포워딩 VM 위주로 보안 그룹 제어를 통한 통신 분리 및 격리 기능 강화
- **Sticky IP 스케줄링**: 최적의 Floating IP 자동 선택 및 연결
- **공인 IP 의존성 제거**: 일부 Floating IP 공유(Config)에 의존하던 로직을 분리하여 안정성 개선

### 💾 스토리지 관리
- **볼륨 관리**: 추가 데이터 디스크 생성 및 인스턴스 핫플러그(연결/분리) 지원
- **스냅샷 기능**: 데이터 안전을 위한 볼륨 스냅샷 생성 기능
- **용량 최적화**: 볼륨 크기 조정 기능 제공

### 🔐 보안 및 인증
- **SSO 통합 로그인 (Single Sign-On)**: 간편하고 강력한 사용자 인증 연동 기능
- **자동 세션 관리**: 만료로 인한 인증/토큰 오류 시, 자동으로 사용자 세션 리디렉트
- **자원 접근 롤(Role) 및 키페어 보장**: 프로젝트별 자원 접근 권한 검사 및 개인용 SSH 키 파일 지원

## 🛠️ 기술 스택

### Frontend
- **프레임워크**: [Next.js 16.1.6](https://nextjs.org/) (App Router, Turbopack)
- **UI 라이브러리 및 스타일링**: 
  - [React 19.2.4](https://react.dev/)
  - [shadcn/ui](https://ui.shadcn.com/) (Radix UI 기반)
  - [Chakra UI 3.33.0](https://chakra-ui.com/)
  - [Tailwind CSS 4.2.1](https://tailwindcss.com/)
- **차트 컴포넌트**: Recharts, Chart.js, ApexCharts

### Backend & Database
- **관계형 데이터베이스(ORM)**: [Drizzle ORM 0.45.1](https://orm.drizzle.team/) & [libSQL Client](https://turso.tech/libsql)
- **사용자 인증 시스템**: [NextAuth.js 4.24.13](https://next-auth.js.org/)
- **API 통신 규격**: openapi-fetch 0.17.0 (OpenAPI 기반 타입스크립트 적용 완료)

### Development Tools
- **언어**: TypeScript 5.x
- **패키지 매니저**: Yarn
- **린팅**: ESLint 10

## 🚀 시작하기

### 필수 요구사항
- **Node.js**: v20.x 이상
- **Yarn**: 패키지 설치용 최신 버전
- **OpenStack API**: Skyline API 엔드포인트 접근 권한

### 환경 변수 설정
프로젝트 루트 경로에 `.env.local` 파일을 생성하고, 다음 항목들을 추가합니다:

```env
# NextAuth 및 SSO 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # openssl rand -hex 32

# OpenStack Skyline API
SKYLINE_API_URL=https://your-openstack-api.com
> https://github.com/INMD1/skyline-apiserver-extenstion

# Drizzle ORM DB 연동 (SQLite/libSQL 기반)
DATABASE_URL=file:local.db
```

### 설치 및 활성화

```bash
# 1. 저장소 클론 및 패키지 다운로드
git clone https://github.com/leehojun/Opnestack_Dloud-Dashboard.git
cd Opnestack_Dloud-Dashboard
yarn install

# 2. Drizzle ORM 데이터베이스 초기화
yarn db:generate
yarn db:migrate

# 3. 개발용 서버 실행 (Turbopack)
yarn dev
```
웹 브라우저를 통해 `http://localhost:3000` 환경에서 대시보드 접근이 가능합니다.

## 📜 사용 가능한 스크립트

```bash
# 프론트엔드 환경
yarn dev          # Turbopack을 활용한 로컬 개발 서버 실행
yarn build        # 프로덕션 번들링
yarn start        # 최적화된 프로덕션 서버 시작
yarn lint         # 정적 코드 린팅

# 데이터베이스 (Drizzle) 환경
yarn db:generate  # 스키마(Schema) 생성 및 적용
yarn db:migrate   # DB 구조 변경분(Migration) 반영
yarn db:studio    # 브라우저 UI로 DB 스키마/데이터 조회하는 Drizzle Studio 접속
```

## 📁 주요 프로젝트 구조

```text
Opnestack_Dloud-Dashboard/
├── drizzle/                   # DB 마이그레이션 변경 내역 폴더
├── src/
│   ├── app/                   # Next.js App Router (페이지 및 라우트)
│   │   ├── api/               # 백엔드 API Routes (v1 릴리즈)
│   │   ├── auth/              # 로그인 인증 페이지 (SSO 포함)
│   │   └── console/           # 대시보드/공지사항/인스턴스 등 화면
│   ├── components/            # shadcn/ui 등 재사용 공통 UI 모음
│   └── lib/                   # API, DB 설정, NextAuth 로직
├── public/                    # 이미지 등 정적 자원
├── package.json
└── tailwind.config.js
```

## 📝 라이선스
해당 레포지토리는 MIT 라이선스가 적용되어 있습니다.

## 👥 참여자 목록
- **이호준** - [GitHub Profile](https://github.com/leehojun)

---