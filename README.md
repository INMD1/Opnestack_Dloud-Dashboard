# 🚀 DCloud Infra Dashboard

OpenStack 기반의 클라우드 인프라를 관리하기 위한 현대적인 웹 대시보드입니다. Next.js 15와 React 19를 기반으로 구축되었으며, 직관적이고 반응성이 뛰어난 사용자 경험을 제공합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## ✨ 주요 기능

### 📊 대시보드
- **실시간 리소스 모니터링**: CPU, 메모리, 디스크 사용량 실시간 추적
- **할당량(Quota) 관리**: 프로젝트별 리소스 한도 및 사용량 시각화
- **활동 로그**: 프로젝트 내 모든 활동 기록 및 타임라인 표시
- **통계 차트**: 인터랙티브한 차트로 리소스 사용 추이 확인

### 💻 인스턴스 관리
- **생성 및 삭제**: 다양한 flavor와 이미지로 VM 인스턴스 생성
- **상태 관리**: 시작, 중지, 재시작, 일시정지 등 인스턴스 라이프사이클 제어
- **원격 접속**: NoVNC를 통한 웹 기반 콘솔 접속
- **상세 정보**: CPU, 메모리, 네트워크, 디스크 사용량 실시간 모니터링
- **삭제 워크플로**: 확인 → 삭제 중 → 완료의 3단계 삭제 프로세스

### 🌐 네트워크 관리
- **포트 포워딩**: 외부에서 인스턴스로의 포트 포워딩 규칙 생성 및 관리
- **자동 SSH 포워딩**: VM 생성 시 SSH 포트(22번) 자동 포워딩
- **Sticky IP 할당**: 여러 Floating IP 중 자동으로 최적 IP 선택
- **IP 주소 관리**: 공인 IP 및 사설 IP 주소 현황 확인
- **통계 정보**: 포트 포워딩 사용량 및 제한 확인

### 💾 스토리지 관리
- **볼륨 관리**: 추가 디스크 볼륨 생성, 연결, 분리, 삭제
- **스냅샷**: 볼륨 스냅샷 생성 및 복원
- **삭제 워크플로**: 확인 → 삭제 중 → 완료의 3단계 삭제 프로세스
- **용량 관리**: 볼륨 크기 조정 및 타입 변경

### 🔐 보안 관리
- **키페어 관리**: SSH 키페어 생성, 조회, 다운로드, 삭제
- **사용자 인증**: NextAuth.js 기반의 안전한 세션 관리
- **권한 제어**: 프로젝트별 리소스 접근 권한 관리

## 🛠️ 기술 스택

### Frontend
- **프레임워크**: [Next.js 15.5.0](https://nextjs.org/) (App Router, Turbopack)
- **UI 라이브러리**: 
  - [React 19.1.0](https://react.dev/)
  - [shadcn/ui](https://ui.shadcn.com/) - Radix UI 기반 컴포넌트
  - [Chakra UI 3.25.0](https://chakra-ui.com/)
- **스타일링**: 
  - [Tailwind CSS 4.1.12](https://tailwindcss.com/)
  - CSS Modules
- **차트**: 
  - [Recharts](https://recharts.org/)
  - [Chart.js](https://www.chartjs.org/)
  - [ApexCharts](https://apexcharts.com/)

### Backend & API
- **인증**: [NextAuth.js 4.24.11](https://next-auth.js.org/)
- **API 통신**: [openapi-fetch 0.14.0](https://github.com/drwpow/openapi-typescript)
- **폼 유효성 검사**: 
  - [React Hook Form 7.62.0](https://react-hook-form.com/)
  - [Zod 4.1.3](https://zod.dev/)

### Development Tools
- **언어**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **패키지 매니저**: Yarn
- **린팅**: ESLint 9
- **타입 생성**: openapi-typescript

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: v20.x 이상
- **Yarn**: 최신 버전
- **OpenStack API**: Skyline API 엔드포인트 접근 권한

### 설치 및 실행

1. **저장소 클론**

```bash
git clone https://github.com/leehojun/Opnestack_Dloud-Dashboard.git
cd Opnestack_Dloud-Dashboard
```

2. **의존성 설치**

```bash
yarn install
```

3. **환경 변수 설정**

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 설정합니다:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # openssl rand -hex 32 명령어로 생성

# OpenStack API 엔드포인트
SKYLINE_API_URL=https://your-openstack-api.com
```

4. **개발 서버 실행**

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 대시보드를 확인할 수 있습니다.

## 📜 사용 가능한 스크립트

```bash
# 개발 모드 (Turbopack 사용)
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 서버 시작
yarn start

# 코드 린팅
yarn lint
```

## 📁 프로젝트 구조

```
Opnestack_Dloud-Dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── v1/           # API v1 엔드포인트
│   │   │       ├── instances/        # 인스턴스 관리
│   │   │       ├── volumes/          # 볼륨 관리
│   │   │       ├── port_forwardings/ # 포트 포워딩
│   │   │       ├── projectlogs/      # 프로젝트 로그
│   │   │       └── ...
│   │   ├── auth/              # 인증 페이지
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── console/           # 대시보드 페이지
│   │   │   ├── instance/     # 인스턴스 관리
│   │   │   ├── disk/         # 디스크 관리
│   │   │   ├── network/      # 네트워크 관리
│   │   │   └── keypair/      # 키페어 관리
│   │   └── exten/            # 확장 컴포넌트
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   └── ui/               # shadcn/ui 컴포넌트
│   └── lib/                  # 유틸리티 및 설정
│       ├── auth.ts           # NextAuth 설정
│       ├── skyline.ts        # API 클라이언트
│       └── skyline-api.ts    # API 타입 정의
├── public/                    # 정적 파일
├── .env.local                # 환경 변수 (git에 포함되지 않음)
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🎨 주요 UI 컴포넌트

### shadcn/ui 컴포넌트
- **Dialog**: 모달 및 대화상자
- **Dropdown Menu**: 드롭다운 메뉴
- **Tabs**: 탭 네비게이션
- **Tooltip**: 툴팁
- **Accordion**: 아코디언
- **Label, Checkbox**: 폼 요소

### 커스텀 컴포넌트
- **StatCard**: 통계 카드
- **InstanceTable**: 인스턴스 목록 테이블
- **DiskTable**: 디스크 목록 테이블
- **NetworkView**: 네트워크 정보 표시

## 🔌 API 구조

### 인증
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃
- `POST /api/v1/signup` - 회원가입

### 인스턴스
- `GET /api/v1/instances?instance_id={id}` - 인스턴스 상세 조회
- `POST /api/v1/instances` - 인스턴스 생성
- `DELETE /api/v1/instances?instance_id={id}` - 인스턴스 삭제
- `POST /api/v1/instances/action` - 인스턴스 상태 변경

### 볼륨
- `GET /api/v1/volumes` - 볼륨 목록 조회
- `POST /api/v1/volumes` - 볼륨 생성
- `DELETE /api/v1/volumes?volume_id={id}` - 볼륨 삭제

### 네트워크
- `GET /api/v1/port_forwardings` - 포트 포워딩 목록
- `POST /api/v1/port_forwardings` - 포트 포워딩 생성
- `DELETE /api/v1/port_forwardings/{id}` - 포트 포워딩 삭제
- `GET /api/v1/port_forwardings/stats` - 포트 포워딩 통계

### 프로젝트
- `GET /api/v1/projectlogs` - 프로젝트 활동 로그
- `GET /api/v1/quotas` - 할당량 조회

## 🔐 인증 흐름

1. 사용자가 로그인 페이지에서 자격 증명 입력
2. NextAuth.js가 OpenStack Keystone API로 인증 요청
3. 성공 시 Keystone 토큰을 세션에 저장
4. 모든 API 요청에 토큰을 Authorization 헤더에 포함
5. 세션 만료 시 자동으로 로그아웃

## 🎯 주요 기능 상세

### 인스턴스 생성 프로세스
1. Flavor 선택 (CPU, 메모리, 디스크 사양)
2. OS 이미지 선택
3. 키페어 선택 또는 생성
4. 네트워크 설정
5. SSH 포트 포워딩 자동 설정 옵션
6. 추가 포트 포워딩 규칙 설정
7. 인스턴스 생성 및 상태 모니터링

### 포트 포워딩 관리
- **자동 IP 할당**: 여러 Floating IP 중 자동으로 사용 가능한 IP 선택
- **포트 자동 선택**: 사용 가능한 외부 포트 자동 할당
- **할당량 체크**: 생성 전 할당량 초과 여부 확인
- **인스턴스 연동**: VM 생성 시 자동으로 포트 포워딩 규칙 생성

### 삭제 워크플로
1. **확인 단계**: 삭제할 리소스 정보 표시 및 확인
2. **진행 중 단계**: 삭제 요청 처리 중 로딩 표시
3. **완료 단계**: 삭제 완료 메시지 및 목록 자동 새로고침

## 🐛 문제 해결

### TypeScript 타입 에러
API 경로가 타입 정의에 없는 경우, 파일 상단에 다음을 추가:
```typescript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
```

### API 연결 문제
- `.env.local` 파일의 `SKYLINE_API_URL` 확인
- CORS 설정 확인
- 네트워크 방화벽 설정 확인

### 세션 만료
- `NEXTAUTH_SECRET` 값 확인
- Keystone 토큰 유효기간 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m '새로운 기능 추가'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👥 개발자

- **이호준** - [GitHub](https://github.com/leehojun)

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

Made with ❤️ using Next.js and OpenStack