# DCloud Infra Dashboard

DCloud Infra Dashboard는 OpenStack 기반의 클라우드 인프라를 관리하기 위해 구축된 웹 대시보드입니다. Next.js와 shadcn/ui를 사용하여 현대적이고 반응성이 뛰어난 사용자 인터페이스를 제공합니다. 사용자는 이 대시보드를 통해 인스턴스, 네트워크, 디스크, 키페어 등 다양한 클라우드 리소스를 손쉽게 생성하고 관리할 수 있습니다.

## 주요 기능

- **인스턴스 관리**: 가상 머신 인스턴스 생성, 조회, 상태 변경 및 원격 접속(NoVNC)
- **네트워크 관리**: IP 주소 및 포트 포워딩 규칙 확인 및 관리
- **디스크 관리**: 스토리지 볼륨 및 스냅샷 조회
- **키페어 관리**: SSH 키페어 조회 및 관리
- **사용자 인증**: NextAuth.js를 이용한 안전한 사용자 로그인 및 세션 관리

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **UI**: React, shadcn/ui, Tailwind CSS
- **상태 관리**: React Hooks & Context API
- **인증**: NextAuth.js
- **API 통신**: openapi-fetch
- **언어**: TypeScript

## 시작하기

### 전제 조건

- Node.js (v20.x 이상 권장)
- yarn

### 설치 및 실행

1.  **저장소 복제:**

    ```bash
    git clone https://github.com/leehojun/Opnestack_Dloud-Dashboard.git
    cd Opnestack_Dloud-Dashboard
    ```

2.  **의존성 설치:**

    ```bash
    yarn install
    ```

3.  **환경 변수 설정:**

    프로젝트 루트에 `.env.local` 파일을 생성하고, 필요한 환경 변수를 설정합니다. OpenStack API 엔드포인트 및 NextAuth 관련 설정이 필요합니다.

    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET= # openssl rand -hex 32 명령어로 생성
    SKYLINE_API_URL= # OpenStack API 엔드포인트
    ```

4.  **개발 서버 실행:**

    ```bash
    yarn dev
    ```

    브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 대시보드를 확인할 수 있습니다.

## 사용 가능한 스크립트

- `yarn dev`: 개발 모드로 애플리케이션을 실행합니다. (Turbopack 사용)
- `yarn build`: 프로덕션용으로 애플리케이션을 빌드합니다.
- `yarn start`: 빌드된 프로덕션 서버를 시작합니다.
- `yarn lint`: ESLint를 사용하여 코드 스타일을 검사합니다.