# DCloud Dashboard — CLAUDE.md

## 프로젝트 개요
OpenStack 기반 클라우드 인프라의 사용자 대시보드.  
Next.js 15 (App Router) + TypeScript + Tailwind + Chakra UI  
백엔드: Skyline API (OpenStack 래퍼) — `src/lib/skyline.ts` / `src/lib/skyline-api.ts`

---

## 기술 스택 요약

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 15, App Router |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS, Chakra UI v3, Radix UI |
| 인증 | NextAuth.js (`src/lib/auth.ts`) — keystone_token 기반 |
| DB | Drizzle ORM + libSQL |
| API 클라이언트 | `getSkylineClient(token)` — `src/lib/skyline.ts` |

---

## 디렉토리 구조

```
src/
├── app/
│   ├── api/v1/          # Next.js API Routes (BFF 계층)
│   │   ├── portforward/ # 포트포워딩 CRUD
│   │   ├── instances/   # 인스턴스 CRUD + 생명주기
│   │   ├── extension/   # servers, ports, volumes, quotasets 등
│   │   ├── floating-ips/
│   │   ├── limits/
│   │   └── ...
│   └── console/         # 사용자 UI 페이지
│       ├── instance/    # 인스턴스 목록/상세/생성
│       ├── network/     # 포트포워딩 관리 (network/view)
│       ├── disk/        # 볼륨 관리
│       └── keypair/     # SSH 키페어
├── components/
│   ├── ui/              # Radix/Chakra 기반 공통 컴포넌트
│   └── instance/        # 인스턴스 전용 컴포넌트
│       ├── lifecycle-badge.tsx
│       └── extend-button.tsx
└── lib/
    ├── auth.ts          # NextAuth authOptions
    ├── skyline.ts       # getSkylineClient(token) 팩토리
    ├── skyline-api.ts   # OpenAPI 자동 생성 타입
    ├── logger.ts        # devError 등 로거
    └── crypto-utils.ts  # 이메일 인증용 암호화
```

---

## 핵심 패턴

### API Route (BFF) 작성 규칙
- 항상 `getServerSession(authOptions)` → `session.keystone_token` 확인
- `getSkylineClient(session.keystone_token)` 로 백엔드 호출
- 에러 시 빈 배열/객체 반환하여 프론트 크래시 방지
- 보안 검증이 필요하면 **소유권 확인 후** 작업 수행 (예: portforward 삭제)

```ts
// 표준 패턴
const session = await getServerSession(authOptions);
if (!session?.keystone_token) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
}
const skylineClient = getSkylineClient(session.keystone_token);
// 타입에 정의된 경로는 직접 호출
const { data, error } = await skylineClient.GET("/api/v1/extension/servers", {});
// 타입에 없는 커스텀 엔드포인트는 asUntypedClient 어댑터 사용 (portforward GET 등)
```

### Skyline 커스텀 엔드포인트 타입 처리
`skyline-api.ts`에 정의되지 않은 Skyline 커스텀 엔드포인트 호출 시 `asUntypedClient` 어댑터를 사용:
```ts
function asUntypedClient(client: ReturnType<typeof getSkylineClient>) {
    return client as unknown as {
        GET: (path: string, opts?: { params?: { query?: Record<string, string | undefined> } }) => Promise<{ data?: unknown; error?: unknown }>;
        POST: (path: string, opts?: { body?: unknown }) => Promise<{ data?: unknown; error?: unknown }>;
    };
}
// 사용 예: /api/v1/portforward (GET), /api/v1/instances/{id} (GET)
```
- `any` 대신 `unknown` 경유 캐스팅(`as unknown as ...`)으로 타입 안전성 향상
- 커스텀 엔드포인트 결과는 로컬 인터페이스로 별도 정의

### 인스턴스 목록 조회
- **전체 목록**: `GET /api/v1/extension/servers` → `data.servers[]`
  - `server.id` — VM UUID
  - `server.fixed_addresses[]` — 내부망 IP 배열
  - `server.name` — VM 이름
- **단건 조회**: `GET /api/v1/instances?instance_id=<id>` → 단일 인스턴스 객체
  - `instance.addresses["private-net"][0].addr` — 내부 IP

### 포트포워딩 보안 필터링 (중요)
- `GET /api/v1/portforward` 는 BFF에서 **현재 사용자 VM 목록을 먼저 조회** 후
  `user_vm_id` 또는 `user_vm_internal_ip` 기준으로 필터링 후 반환
- **보안 원칙**: VM 목록 조회 실패 시 빈 배열 반환 (fail-closed) — 전체 노출 없음
- 프론트엔드는 BFF 응답을 그대로 표시 (클라이언트 측 재필터링 금지)
- `DELETE /api/v1/portforward/[rule_id]` 는 VM 소유권 + 규칙 소유권 이중 검증 수행
- `GET /api/v1/portforward/vm/[vm_id]` 는 VM 소유권 확인 후 조회

### 인증 모드
```
develop=no_api  → 개발 모드 (DEV_USERNAME / DEV_PASSWORD 환경변수)
그 외           → Skyline 운영 모드
```

---

## 자주 사용하는 명령어

```bash
# 개발 서버 (Turbopack)
npm run dev

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# DB 마이그레이션
npm run db:migrate

# DB 스튜디오
npm run db:studio
```

---

## 주요 타입 참고
- OpenStack API 타입: `src/lib/skyline-api.ts` (자동 생성, 직접 수정 금지)
- `components["schemas"]["ServersResponseBase"]` — 서버 목록 타입
- `components["schemas"]["PortsResponseBase"]` — 포트 목록 타입
- `LifecycleStatus` — `src/types/lifecycle.ts`

---

## 알려진 설계 결정

1. **포트포워딩 소유권 필터**: Skyline이 전체 규칙을 반환하므로, BFF(`/api/v1/portforward/route.ts`)에서 `extension/servers`로 현재 사용자 VM ID·IP를 추출해 필터링. VM 조회 실패 시 빈 배열 반환(fail-closed). 프론트는 BFF 결과를 그대로 렌더링.
2. **Skyline 커스텀 엔드포인트**: `/api/v1/portforward` GET·POST, `/api/v1/instances/{id}` GET 등은 자동 생성 타입에 없음. `asUntypedClient` 어댑터(`as unknown as {...}`)로 `any` 없이 호출.
3. **인스턴스 addresses 타입**: `Record<string, Array<{ addr: string; "OS-EXT-IPS:type"?: string }>>` 로 정의.
4. **GlobalAuthGuard**: 401 응답을 인터셉트해 로그인 페이지로 리다이렉트.
5. **라이프사이클 관리**: 인스턴스 만료일 관리 + 이메일 연장 인증.
6. **테마**: 라이트/다크 모드 완전 지원.
