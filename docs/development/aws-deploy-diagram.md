# AWS 배포 아키텍처 다이어그램

> EC2 프리 티어 기반 배포 구조를 Mermaid 다이어그램으로 정리한 문서입니다.
> [Mermaid Live Editor](https://mermaid.live)에서 미리보기 가능합니다.

---

## 1. 전체 인프라 구성도

```mermaid
graph TB
    subgraph Internet["🌐 인터넷"]
        User[👤 사용자 브라우저]
    end

    subgraph EC2["EC2 t2.micro (Amazon Linux 2023)"]
        PM2[PM2 프로세스 매니저]
        PM2 --> Web["Next.js<br/>프론트엔드<br/>:3001"]
        PM2 --> API["NestJS<br/>백엔드 API<br/>:3000"]
    end

    subgraph RDS["RDS (프리 티어)"]
        DB[(PostgreSQL<br/>db.t3.micro<br/>pms_dev<br/>20GB)]
    end

    User -->|"http://IP:3001"| Web
    User -->|"http://IP:3000"| API
    Web -->|API 호출| API
    API -->|SQL 쿼리| DB

    style Internet fill:#e0f2f1
    style EC2 fill:#fff3e0
    style RDS fill:#f3e5f5
```

---

## 2. EC2 보안 그룹 설정

```mermaid
graph LR
    subgraph 외부["🌐 외부 트래픽"]
        Dev[👨‍💻 개발자]
        User[👤 사용자]
    end

    subgraph SG_EC2["보안 그룹: pms-api-sg"]
        SSH["SSH :22<br/>내 IP만"]
        P3000[":3000<br/>0.0.0.0/0"]
        P3001[":3001<br/>0.0.0.0/0"]
    end

    subgraph SG_RDS["보안 그룹: default"]
        P5432[":5432<br/>pms-api-sg만"]
    end

    Dev -->|SSH 접속| SSH
    User -->|API| P3000
    User -->|웹| P3001
    P3000 -.->|EC2 → RDS| P5432

    style 외부 fill:#e0f2f1
    style SG_EC2 fill:#fff3e0
    style SG_RDS fill:#fce4ec
```

---

## 3. 초기 배포 과정 (Step by Step)

```mermaid
flowchart TD
    A["0단계<br/>리전 확인<br/>서울 ap-northeast-2"] --> B

    subgraph Step1["1단계: RDS 생성"]
        B["RDS 콘솔 접속"] --> C["PostgreSQL 16.x<br/>프리 티어 선택"]
        C --> D["DB 인스턴스: pms-db<br/>사용자: postgres<br/>DB명: pms_dev"]
        D --> E["엔드포인트 복사<br/>→ DATABASE_URL에 사용"]
    end

    E --> F

    subgraph Step2["2단계: EC2 생성"]
        F["EC2 콘솔 접속"] --> G["Amazon Linux 2023<br/>t2.micro 선택"]
        G --> H["키 페어 생성<br/>pms-key.pem 다운로드"]
        H --> I["보안 그룹 설정<br/>:22, :3000, :3001 오픈"]
        I --> J["인스턴스 시작<br/>퍼블릭 IP 복사"]
    end

    J --> K

    subgraph Step3["3단계: RDS 보안 그룹"]
        K["RDS 보안 그룹 편집"] --> L["인바운드 규칙 추가<br/>PostgreSQL :5432<br/>소스: pms-api-sg"]
    end

    L --> M

    subgraph Step4["4단계: 백엔드 배포"]
        M["SSH 접속"] --> N["스왑 메모리 추가<br/>2GB (필수!)"]
        N --> O["Node.js, pnpm,<br/>PM2, git 설치"]
        O --> P["git clone → pnpm install"]
        P --> Q[".env 파일 작성<br/>DATABASE_URL, JWT_SECRET"]
        Q --> R["스키마 빌드 → Prisma 생성<br/>→ migrate → API 빌드"]
        R --> S["pm2 start dist/src/main.js"]
    end

    S --> T

    subgraph Step5["5단계: 프론트엔드 배포"]
        T["apps/web에서 빌드<br/>NODE_OPTIONS=512MB"]
        T --> U["pm2 start next :3001"]
        U --> V["pm2 save<br/>자동 재시작 설정"]
    end

    V --> W

    subgraph Step6["6단계: 요금 방지"]
        W["Budgets 알림 설정<br/>월 $1 초과 시 이메일"]
    end

    style Step1 fill:#e8f5e9
    style Step2 fill:#e3f2fd
    style Step3 fill:#fce4ec
    style Step4 fill:#fff3e0
    style Step5 fill:#f3e5f5
    style Step6 fill:#ffebee
```

---

## 4. 업데이트 배포 흐름

```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 개발자 (로컬)
    participant GH as GitHub
    participant EC2 as EC2 (SSH)
    participant PM2 as PM2
    participant RDS as RDS

    Dev->>GH: git push (코드 변경)
    Dev->>EC2: ssh -i pms-key.pem ec2-user@IP

    rect rgb(232, 245, 233)
        Note over EC2: 코드 업데이트
        EC2->>GH: git pull
        EC2->>EC2: pnpm install
        EC2->>EC2: cd packages/schema && npx tsc -b
    end

    rect rgb(255, 243, 224)
        Note over EC2,RDS: 백엔드 재배포
        EC2->>EC2: pnpm prisma:generate
        EC2->>RDS: npx prisma migrate deploy
        EC2->>EC2: pnpm build (apps/api)
        EC2->>PM2: pm2 restart pms-api
    end

    rect rgb(243, 229, 245)
        Note over EC2: 프론트엔드 재배포
        EC2->>EC2: pnpm build (apps/web)<br/>NODE_OPTIONS=512MB
        EC2->>PM2: pm2 restart pms-web
    end

    PM2-->>Dev: 배포 완료 ✅
```

---

## 5. EC2 내부 프로세스 구조

```mermaid
graph TB
    subgraph EC2["EC2 t2.micro (1GB RAM + 2GB Swap)"]
        subgraph PM2_Process["PM2 프로세스 매니저"]
            API["pms-api<br/>dist/src/main.js<br/>:3000"]
            WEB["pms-web<br/>next start<br/>:3001"]
        end

        subgraph FileSystem["파일 시스템"]
            Code["~/pms/<br/>├── apps/api/.env<br/>├── apps/web/.env.production<br/>└── packages/schema/"]
            Swap["/swapfile (2GB)"]
            Key["~/.pem (SSH 키)"]
        end
    end

    subgraph External["외부 연결"]
        RDS[(RDS PostgreSQL<br/>:5432)]
        Browser[👤 브라우저]
    end

    API -->|DATABASE_URL| RDS
    Browser -->|:3001| WEB
    Browser -->|:3000| API
    WEB -.->|내부 호출| API

    style EC2 fill:#fff8e1
    style PM2_Process fill:#fff3e0
    style FileSystem fill:#f5f5f5
    style External fill:#e0f2f1
```
