# AWS 프로덕션 배포 가이드

## 목차

1. [개요](#개요)
2. [이미 완료된 작업 (자동화)](#이미-완료된-작업-자동화)
3. [수동으로 해야 할 작업](#수동으로-해야-할-작업)
4. [배포 테스트](#배포-테스트)
5. [트러블슈팅](#트러블슈팅)
6. [참고 자료](#참고-자료)

---

## 개요

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Actions                        │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐             │
│  │  CI/CD    │  │ Deploy API │  │ Deploy Web │             │
│  │ (PR 검증) │  │            │  │            │             │
│  └───────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                          │                  │
                          ▼                  ▼
┌──────────────────────────────┐  ┌──────────────────────────┐
│       AWS ECR                │  │       AWS S3             │
│  (Docker Image Registry)     │  │  (Static Files)          │
└──────────────────────────────┘  └──────────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────┐  ┌──────────────────────────┐
│    AWS App Runner            │  │   AWS CloudFront         │
│  (API Server)                │  │  (CDN + HTTPS)           │
│  - Auto Scaling              │  │  - SPA Routing           │
│  - HTTPS Endpoint            │  │  - Cache Invalidation    │
└──────────────────────────────┘  └──────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│    AWS RDS PostgreSQL        │
│  (Database)                  │
│  - Multi-AZ (Optional)       │
│  - Automated Backups         │
└──────────────────────────────┘
```

### 자동화된 부분 vs 수동 설정 필요 부분

#### ✅ 이미 자동화된 부분

- **CI/CD 파이프라인**: PR 검증, API/Web 자동 배포
- **Docker 빌드**: 프로덕션 최적화된 이미지 생성
- **DB 마이그레이션**: 앱 시작 시 자동 실행
- **캐시 무효화**: CloudFront 자동 갱신
- **정적 파일 최적화**: Next.js Static Export

#### ⚠️ 수동으로 설정해야 하는 부분

- **AWS 리소스 생성**: RDS, ECR, App Runner, S3, CloudFront, IAM
- **보안 그룹 및 네트워크 설정**: VPC, Security Groups
- **GitHub Secrets 설정**: AWS 인증 정보, 서비스 ARN 등
- **도메인 및 SSL 인증서**: (선택사항) Route 53, ACM

### 예상 소요 시간 및 비용

| 항목 | 예상 시간 | 월 예상 비용 (USD) |
|------|----------|-------------------|
| RDS PostgreSQL (db.t3.micro) | 10분 | $15-20 |
| ECR | 5분 | $1-2 (스토리지 기준) |
| App Runner (0.25 vCPU, 0.5GB) | 15분 | $12-15 |
| S3 (정적 호스팅) | 5분 | $1-2 |
| CloudFront | 10분 | $1-2 |
| IAM 사용자 | 5분 | 무료 |
| **총계** | **약 50분** | **$30-40** |

> 💡 **비용 절감 팁**: 개발/테스트 환경은 RDS를 중지하고 필요할 때만 사용하세요.

---

## 이미 완료된 작업 (자동화)

다음 파일들이 이미 생성/수정되어 배포 자동화가 준비되었습니다.

### 1. GitHub Actions 워크플로우

#### `.github/workflows/ci.yml` - PR 검증 파이프라인

**역할**: Pull Request 생성 시 자동으로 코드 품질 검증

**수행 작업**:
- ESLint를 통한 코드 스타일 검사
- Jest를 통한 API 단위 테스트 실행
- Docker 이미지 빌드 테스트 (실제 푸시는 하지 않음)
- Next.js 프로덕션 빌드 검증

**트리거**: PR이 `main` 브랜치로 생성될 때

**특징**:
- PostgreSQL 테스트 DB 자동 생성
- 빌드 캐시 활용으로 빌드 시간 단축
- 동일한 PR의 여러 푸시 시 이전 작업 자동 취소 (concurrency)

---

#### `.github/workflows/deploy-api.yml` - API 자동 배포 파이프라인

**역할**: API 코드 변경 시 자동으로 프로덕션 배포

**수행 작업**:
1. Docker 이미지 빌드
2. AWS ECR에 이미지 푸시 (태그: `latest`, `{commit-sha}`)
3. App Runner 서비스 배포 트리거
4. 배포 완료 대기 및 상태 확인

**트리거**: `main` 브랜치에 다음 경로가 변경될 때
- `apps/api/**`
- `packages/**`
- `pnpm-lock.yaml`

**환경 변수**:
- `AWS_REGION`: `ap-northeast-2` (서울 리전)
- `ECR_REPOSITORY`: `emotion-pms-api`

**필요한 GitHub Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `APP_RUNNER_SERVICE_ARN`

---

#### `.github/workflows/deploy-web.yml` - Web 자동 배포 파이프라인

**역할**: 프론트엔드 코드 변경 시 자동으로 S3/CloudFront 배포

**수행 작업**:
1. Next.js Static Export 빌드
2. S3 버킷에 정적 파일 동기화
   - 정적 자산 (JS, CSS, 이미지): 1년 캐시 (`max-age=31536000`)
   - HTML 파일: 캐시 안 함 (`max-age=0, must-revalidate`)
3. CloudFront 캐시 무효화 (전체 경로 `/*`)

**트리거**: `main` 브랜치에 다음 경로가 변경될 때
- `apps/web/**`
- `packages/**`
- `pnpm-lock.yaml`

**환경 변수**:
- `AWS_REGION`: `ap-northeast-2`
- `S3_BUCKET`: `emotion-pms-web`

**필요한 GitHub Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `NEXT_PUBLIC_API_URL`

---

### 2. Next.js 설정 변경

#### `apps/web/next.config.js`

**변경 사항**:
```javascript
output: 'export',         // Static HTML export 활성화
trailingSlash: true,      // URL에 trailing slash 추가 (S3 호환성)
images: {
  unoptimized: true,      // Next.js Image Optimization 비활성화 (S3용)
}
```

**효과**:
- `pnpm build` 시 `apps/web/out/` 디렉토리에 정적 HTML/CSS/JS 생성
- S3에서 직접 서빙 가능한 순수 정적 사이트 생성
- CloudFront와 함께 사용 시 글로벌 CDN 제공

---

### 3. Dockerfile 최적화

#### `apps/api/Dockerfile`

**주요 개선 사항**:
- **Multi-stage 빌드**: 최종 이미지 크기 최소화
- **레이어 캐싱**: 의존성과 소스 코드 분리로 빌드 시간 단축
- **프로덕션 의존성만 설치**: `--prod` 플래그 사용

**빌드 단계**:
1. **dependencies**: `pnpm install --frozen-lockfile`
2. **builder**: Prisma Client 생성 및 TypeScript 컴파일
3. **production**: 프로덕션 의존성 + 빌드 결과물만 복사

**크기 비교**:
- 개발 이미지: ~1.2GB
- 프로덕션 이미지: ~400MB

---

### 4. Docker Entrypoint

#### `apps/api/docker-entrypoint.sh`

**역할**: 컨테이너 시작 시 DB 마이그레이션 자동 실행

**실행 순서**:
1. `npx prisma migrate deploy` - pending된 마이그레이션 적용
2. `node dist/main.js` - NestJS 앱 시작

**장점**:
- 배포 시 DB 스키마 자동 동기화
- 수동 마이그레이션 불필요
- 롤백 시 이전 이미지 사용 가능

**주의사항**:
- 마이그레이션 실패 시 컨테이너가 시작되지 않음
- 프로덕션 DB 백업 필수

---

### 5. 환경 변수 템플릿

#### `.env.production.example`

**제공 정보**:
- API용 환경 변수 (DATABASE_URL, JWT_SECRET 등)
- Web용 환경 변수 (NEXT_PUBLIC_API_URL)
- GitHub Actions Secrets 목록

**사용 방법**:
1. 로컬 프로덕션 테스트: 파일 복사 후 값 입력
2. AWS 배포: App Runner 환경 변수 설정 참고
3. GitHub Actions: Secrets 설정 참고

---

## 수동으로 해야 할 작업

> 💡 각 단계는 순서대로 진행하세요. 이전 단계에서 생성된 값이 다음 단계에 필요합니다.

### Step 1: AWS RDS PostgreSQL 생성

#### 1.1 RDS 콘솔 접속

1. [AWS Management Console](https://console.aws.amazon.com/) 로그인
2. 리전을 **서울 (ap-northeast-2)** 로 변경
3. **Services** → **RDS** 검색 → **RDS** 선택
4. **데이터베이스 생성** 클릭

#### 1.2 데이터베이스 설정

**기본 설정**:
- 엔진 옵션: **PostgreSQL**
- 엔진 버전: **PostgreSQL 16.x** (최신 안정 버전)
- 템플릿: **프리 티어** (또는 **개발/테스트**)

**DB 인스턴스 식별자**:
- DB 인스턴스 식별자: `emotion-pms-db`

**자격 증명 설정**:
- 마스터 사용자 이름: `postgres` (기본값)
- 마스터 암호: **강력한 암호 입력** (예: `YourSecurePassword123!`)
- 암호 확인: 동일하게 입력

> ⚠️ **중요**: 암호는 안전한 곳에 저장하세요. DATABASE_URL에 사용됩니다.

**인스턴스 구성**:
- DB 인스턴스 클래스: **db.t3.micro** (프리 티어 적용 가능)
- 스토리지 유형: **범용 SSD (gp2)**
- 할당된 스토리지: **20 GiB**
- 스토리지 자동 조정: **활성화** (최대 50 GiB)

**연결**:
- Virtual Private Cloud (VPC): **기본 VPC**
- 퍼블릭 액세스: **예** (App Runner에서 접근 가능하도록)
- VPC 보안 그룹: **새로 생성**
  - 이름: `emotion-pms-db-sg`

**데이터베이스 인증**:
- 데이터베이스 인증 옵션: **암호 인증**

**추가 구성**:
- 초기 데이터베이스 이름: `pms_prod`
- 백업 보존 기간: **7일**
- 백업 기간: **적절한 시간대 선택** (예: 새벽 3시)
- 모니터링: **기본 모니터링**
- 로그 내보내기: **PostgreSQL 로그** 체크
- 삭제 방지: **활성화** (실수로 삭제 방지)

#### 1.3 보안 그룹 설정

데이터베이스 생성 후:

1. RDS 콘솔에서 생성한 DB 인스턴스 클릭
2. **연결 및 보안** 탭에서 **VPC 보안 그룹** 클릭
3. **인바운드 규칙 편집** 클릭
4. 규칙 추가:
   - 유형: **PostgreSQL**
   - 프로토콜: **TCP**
   - 포트 범위: **5432**
   - 소스: **0.0.0.0/0** (프로덕션에서는 App Runner IP만 허용 권장)
5. **규칙 저장**

#### 1.4 엔드포인트 확인

1. RDS 콘솔에서 DB 인스턴스 클릭
2. **연결 및 보안** 탭에서 **엔드포인트** 복사
   - 예: `emotion-pms-db.c1a2b3c4d5e6.ap-northeast-2.rds.amazonaws.com`

#### 1.5 DATABASE_URL 생성

```
postgresql://postgres:YourSecurePassword123!@emotion-pms-db.c1a2b3c4d5e6.ap-northeast-2.rds.amazonaws.com:5432/pms_prod
```

형식:
```
postgresql://[사용자명]:[암호]@[엔드포인트]:5432/pms_prod
```

> 💾 **저장**: DATABASE_URL을 메모장에 저장하세요. Step 3에서 사용합니다.

---

### Step 2: AWS ECR 리포지토리 생성

#### 2.1 ECR 콘솔 접속

1. AWS 콘솔 → **Services** → **ECR** (Elastic Container Registry)
2. **프라이빗 리포지토리 생성** 클릭

#### 2.2 리포지토리 설정

**일반 설정**:
- 표시 여부 설정: **프라이빗**
- 리포지토리 이름: `emotion-pms-api`
- 태그 불변성: **활성화** (선택사항)

**이미지 스캔 설정**:
- 푸시 시 스캔: **활성화** (보안 취약점 자동 스캔)

**암호화 설정**:
- 암호화 구성: **AES-256** (기본값)

**리포지토리 생성** 클릭

#### 2.3 리포지토리 URI 확인

생성 후 리포지토리 목록에서 `emotion-pms-api` 클릭하여 URI 확인:
- 예: `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/emotion-pms-api`

> 💾 **저장**: ECR URI는 GitHub Actions가 자동으로 사용합니다.

---

### Step 3: AWS App Runner 서비스 생성

#### 3.1 App Runner 콘솔 접속

1. AWS 콘솔 → **Services** → **App Runner**
2. **서비스 생성** 클릭

#### 3.2 소스 설정

**리포지토리 유형**: **컨테이너 레지스트리**

**공급자**: **Amazon ECR**

**컨테이너 이미지 URI**:
1. **찾아보기** 클릭
2. `emotion-pms-api` 리포지토리 선택
3. 이미지 태그: `latest`

**배포 설정**:
- 배포 트리거: **자동** (ECR 푸시 시 자동 배포)
- ECR 액세스 역할: **새 서비스 역할 생성**

**다음** 클릭

#### 3.3 서비스 설정

**서비스 이름**: `emotion-pms-api`

**가상 CPU 및 메모리**:
- CPU: **0.25 vCPU**
- 메모리: **0.5 GB**

**환경 변수**:

다음 환경 변수를 추가하세요 (Add environment variable):

| 키 | 값 | 설명 |
|----|-----|------|
| `NODE_ENV` | `production` | 프로덕션 모드 |
| `PORT` | `3000` | 앱 포트 |
| `DATABASE_URL` | Step 1.5에서 생성한 URL | RDS 연결 문자열 |
| `JWT_SECRET` | 안전한 랜덤 문자열 (32자 이상) | JWT 서명 키 |
| `JWT_EXPIRES_IN` | `7d` | JWT 만료 시간 |

> 🔑 **JWT_SECRET 생성 방법**:
> ```bash
> # Linux/Mac
> openssl rand -base64 32
>
> # 또는 온라인 생성기 사용
> # https://www.random.org/strings/
> ```

**포트**: `3000`

**다음** 클릭

#### 3.4 네트워킹 설정

**아웃바운드 네트워크 트래픽**:
- **사용자 지정 VPC**
- VPC: **기본 VPC**
- VPC 커넥터: **새로 생성**
  - VPC 커넥터 이름: `emotion-pms-vpc-connector`
  - 서브넷: **모든 서브넷 선택**
  - 보안 그룹: **기본 보안 그룹 선택**

> ⚠️ **중요**: VPC 커넥터가 있어야 RDS에 접근할 수 있습니다.

**다음** 클릭

#### 3.5 상태 확인 설정

**상태 확인**:
- 프로토콜: **HTTP**
- 경로: `/` (NestJS 기본 경로)
- 간격: **10초**
- 시간 초과: **5초**
- 비정상 임계값: **3**
- 정상 임계값: **1**

**자동 조정**:
- 최소 인스턴스 수: **1**
- 최대 인스턴스 수: **3** (트래픽에 따라 조정)

**다음** → **서비스 생성** 클릭

#### 3.6 배포 대기

서비스 상태가 **Running**이 될 때까지 약 5-10분 소요됩니다.

#### 3.7 서비스 ARN 및 URL 확인

1. App Runner 콘솔에서 `emotion-pms-api` 서비스 클릭
2. **서비스 ARN** 복사
   - 예: `arn:aws:apprunner:ap-northeast-2:123456789012:service/emotion-pms-api/abc123def456`
3. **기본 도메인** 확인
   - 예: `https://abc123def.ap-northeast-2.awsapprunner.com`

> 💾 **저장**:
> - `APP_RUNNER_SERVICE_ARN`: GitHub Secrets에 사용
> - `NEXT_PUBLIC_API_URL`: GitHub Secrets 및 Step 5에서 사용

#### 3.8 API 동작 확인

브라우저에서 App Runner URL 접속:
```
https://your-api.ap-northeast-2.awsapprunner.com
```

정상 응답:
```json
{"code":"SUC001","message":"Emotion PMS API is running","data":null}
```

---

### Step 4: AWS S3 버킷 생성

#### 4.1 S3 콘솔 접속

1. AWS 콘솔 → **Services** → **S3**
2. **버킷 만들기** 클릭

#### 4.2 버킷 설정

**버킷 이름**: `emotion-pms-web` (전역적으로 고유해야 함)

> 💡 이미 사용 중이면 `emotion-pms-web-your-company` 등으로 수정

**리전**: **아시아 태평양(서울) ap-northeast-2**

**객체 소유권**: **ACL 비활성화됨** (권장)

**퍼블릭 액세스 차단 설정**:
- 모든 체크박스 **해제** (CloudFront를 통해 퍼블릭 액세스)

> ⚠️ **경고 확인**: "퍼블릭으로 설정될 수 있음" 경고 무시 (CloudFront 정책으로 보호됨)

**버킷 버전 관리**: **비활성화**

**기본 암호화**: **SSE-S3** (기본값)

**버킷 만들기** 클릭

#### 4.3 정적 웹사이트 호스팅 활성화

1. 생성한 버킷(`emotion-pms-web`) 클릭
2. **속성** 탭 → 맨 아래로 스크롤
3. **정적 웹 사이트 호스팅** → **편집** 클릭
4. 설정:
   - 정적 웹 사이트 호스팅: **활성화**
   - 호스팅 유형: **정적 웹 사이트 호스팅**
   - 인덱스 문서: `index.html`
   - 오류 문서: `index.html` (SPA 라우팅용)
5. **변경 사항 저장**

#### 4.4 버킷 정책 설정

1. **권한** 탭 → **버킷 정책** → **편집** 클릭
2. 다음 정책 입력 (버킷 이름 수정):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::emotion-pms-web/*"
    }
  ]
}
```

3. **변경 사항 저장**

> 💡 **설명**: 모든 사용자가 버킷의 객체를 읽을 수 있도록 허용 (CloudFront를 통해 접근)

#### 4.5 버킷 URL 확인

**속성** 탭 → **정적 웹 사이트 호스팅**에서 엔드포인트 확인:
- 예: `http://emotion-pms-web.s3-website.ap-northeast-2.amazonaws.com`

---

### Step 5: AWS CloudFront 배포 생성

#### 5.1 CloudFront 콘솔 접속

1. AWS 콘솔 → **Services** → **CloudFront**
2. **배포 생성** 클릭

#### 5.2 Origin 설정

**원본 도메인**:
- 드롭다운에서 S3 버킷 선택: `emotion-pms-web.s3.ap-northeast-2.amazonaws.com`

> ⚠️ **주의**: S3 웹사이트 엔드포인트가 아닌 **S3 REST API 엔드포인트** 사용

**원본 경로**: 비워둠

**이름**: 자동 생성된 이름 사용

**원본 액세스**:
- **Public** (버킷 정책 사용)

#### 5.3 기본 캐시 동작 설정

**뷰어 프로토콜 정책**: **Redirect HTTP to HTTPS**

**허용된 HTTP 메서드**: **GET, HEAD, OPTIONS**

**캐시 키 및 원본 요청**:
- **Cache policy**: **CachingOptimized**
- **Origin request policy**: **CORS-S3Origin**

#### 5.4 함수 연결 (SPA 라우팅 지원)

**CloudFront Functions**:
- Viewer request: 없음
- Viewer response: 없음

> 💡 **SPA 라우팅**은 사용자 지정 오류 응답으로 처리 (Step 5.6)

#### 5.5 설정

**가격 등급**: **Use only North America and Europe** (또는 **Use all edge locations**)

**대체 도메인 이름(CNAME)**: 비워둠 (나중에 도메인 추가 가능)

**SSL 인증서**: **Default CloudFront Certificate**

> 💡 사용자 지정 도메인 사용 시 ACM에서 인증서 발급 필요

**기본 루트 객체**: `index.html`

**설명**: `Emotion PMS Web Frontend`

**로깅**: 비활성화 (또는 활성화하여 S3 로그 버킷 지정)

#### 5.6 사용자 지정 오류 응답 (SPA 라우팅)

배포 생성 후 설정:

1. 생성한 CloudFront 배포 클릭
2. **오류 페이지** 탭 → **사용자 지정 오류 응답 생성** 클릭
3. 두 개의 규칙 추가:

**규칙 1 (403 오류)**:
- HTTP 오류 코드: **403: Forbidden**
- 오류 응답 사용자 지정: **예**
- 응답 페이지 경로: `/index.html`
- HTTP 응답 코드: **200: OK**
- 생성

**규칙 2 (404 오류)**:
- HTTP 오류 코드: **404: Not Found**
- 오류 응답 사용자 지정: **예**
- 응답 페이지 경로: `/index.html`
- HTTP 응답 코드: **200: OK**
- 생성

> 💡 **설명**: S3에 없는 경로(`/projects`, `/tasks` 등)로 접근 시 `index.html`을 반환하여 React Router가 처리하도록 함

#### 5.7 배포 완료 대기

배포 상태가 **Enabled**가 될 때까지 약 5-10분 소요됩니다.

#### 5.8 Distribution ID 및 도메인 확인

1. CloudFront 배포 목록에서 생성한 배포 클릭
2. **배포 ID** 복사
   - 예: `E1A2B3C4D5E6F7`
3. **배포 도메인 이름** 확인
   - 예: `d1a2b3c4d5e6f7.cloudfront.net`

> 💾 **저장**:
> - `CLOUDFRONT_DISTRIBUTION_ID`: GitHub Secrets에 사용
> - CloudFront 도메인: 웹사이트 접속 주소

---

### Step 6: IAM 사용자 생성 (GitHub Actions용)

#### 6.1 IAM 콘솔 접속

1. AWS 콘솔 → **Services** → **IAM**
2. **사용자** → **사용자 생성** 클릭

#### 6.2 사용자 세부 정보

**사용자 이름**: `github-actions-emotion-pms`

**AWS 액세스 유형**: **액세스 키 - 프로그래밍 방식 액세스**

**다음** 클릭

#### 6.3 권한 설정

**권한 옵션**: **직접 정책 연결**

다음 AWS 관리형 정책을 검색하여 선택:
- ✅ **AmazonEC2ContainerRegistryPowerUser** (ECR 푸시)
- ✅ **AWSAppRunnerFullAccess** (App Runner 배포)
- ✅ **AmazonS3FullAccess** (S3 업로드)
- ✅ **CloudFrontFullAccess** (캐시 무효화)

> 💡 **보안 강화**: 프로덕션에서는 최소 권한 정책 사용 권장 (아래 커스텀 정책 참고)

**다음** → **사용자 생성** 클릭

#### 6.4 Access Key 생성

1. 생성한 사용자(`github-actions-emotion-pms`) 클릭
2. **보안 자격 증명** 탭 → **액세스 키 만들기** 클릭
3. 사용 사례: **타사 서비스**
4. 확인 체크박스 선택 → **다음**
5. 설명 태그: `GitHub Actions for Emotion PMS`
6. **액세스 키 만들기** 클릭

#### 6.5 Access Key 저장

**액세스 키 ID**와 **비밀 액세스 키**를 안전한 곳에 저장하세요.

> ⚠️ **중요**: 비밀 액세스 키는 이 화면을 벗어나면 다시 볼 수 없습니다!

```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

> 💾 **저장**: GitHub Secrets에 사용됩니다.

#### 6.6 최소 권한 정책 (선택사항)

보안을 강화하려면 관리형 정책 대신 다음 커스텀 정책을 사용하세요:

<details>
<summary>커스텀 IAM 정책 보기</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPushAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:ap-northeast-2:*:repository/emotion-pms-api"
    },
    {
      "Sid": "ECRTokenAccess",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "AppRunnerDeployAccess",
      "Effect": "Allow",
      "Action": [
        "apprunner:StartDeployment",
        "apprunner:DescribeService"
      ],
      "Resource": "arn:aws:apprunner:ap-northeast-2:*:service/emotion-pms-api/*"
    },
    {
      "Sid": "S3UploadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::emotion-pms-web",
        "arn:aws:s3:::emotion-pms-web/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidateAccess",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::*:distribution/*"
    }
  ]
}
```

</details>

---

### Step 7: GitHub Secrets 설정

#### 7.1 GitHub Repository 설정 페이지 접속

1. GitHub 리포지토리 페이지 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 클릭

#### 7.2 Secrets 추가

다음 5개의 Secret을 추가하세요:

| Secret 이름 | 값 | 가져올 위치 |
|-------------|-----|-----------|
| **AWS_ACCESS_KEY_ID** | `AKIAIOSFODNN7EXAMPLE` | Step 6.5에서 생성한 Access Key ID |
| **AWS_SECRET_ACCESS_KEY** | `wJalrXUtnFEMI/K7MDENG...` | Step 6.5에서 생성한 Secret Access Key |
| **APP_RUNNER_SERVICE_ARN** | `arn:aws:apprunner:ap-northeast-2:...` | Step 3.7에서 복사한 App Runner ARN |
| **CLOUDFRONT_DISTRIBUTION_ID** | `E1A2B3C4D5E6F7` | Step 5.8에서 복사한 Distribution ID |
| **NEXT_PUBLIC_API_URL** | `https://your-api.ap-northeast-2.awsapprunner.com` | Step 3.7에서 확인한 App Runner URL |

각 Secret 추가 방법:
1. **Name**: 위 표의 Secret 이름 입력
2. **Value**: 해당 값 붙여넣기
3. **Add secret** 클릭

#### 7.3 Secrets 확인

모든 Secret이 추가되었는지 확인:

```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ APP_RUNNER_SERVICE_ARN
✅ CLOUDFRONT_DISTRIBUTION_ID
✅ NEXT_PUBLIC_API_URL
```

> ⚠️ **주의**: Secret 값은 한 번 저장하면 다시 볼 수 없습니다 (수정만 가능).

---

## 배포 테스트

### 1. PR 생성으로 CI 검증

#### 1.1 새 브랜치 생성

```bash
git checkout -b test/deployment
```

#### 1.2 간단한 변경 사항 추가

```bash
# README 수정 등
echo "\n## Deployment Test" >> README.md
git add README.md
git commit -m "test: 배포 테스트"
git push origin test/deployment
```

#### 1.3 Pull Request 생성

1. GitHub 리포지토리 → **Pull requests** → **New pull request**
2. base: `main` ← compare: `test/deployment`
3. **Create pull request** 클릭

#### 1.4 CI 워크플로우 확인

**Actions** 탭에서 **CI** 워크플로우가 실행되는지 확인:

- ✅ Lint & Test (ESLint, Jest)
- ✅ Build Docker Image

**예상 소요 시간**: 약 5분

**성공 조건**: 모든 체크가 ✅ 녹색으로 표시

---

### 2. main 브랜치 푸시로 자동 배포 확인

#### 2.1 PR 병합

1. PR이 통과하면 **Merge pull request** 클릭
2. **Confirm merge** 클릭

#### 2.2 배포 워크플로우 확인

**Actions** 탭에서 다음 워크플로우가 자동 실행되는지 확인:

**Deploy API** (apps/api 변경 시):
1. ✅ Build and push Docker image to ECR
2. ✅ Deploy to App Runner
3. ✅ Wait for deployment

**Deploy Web** (apps/web 변경 시):
1. ✅ Build Web (Next.js Static Export)
2. ✅ Deploy to S3
3. ✅ Invalidate CloudFront cache

**예상 소요 시간**:
- API 배포: 약 10분
- Web 배포: 약 5분

---

### 3. API 엔드포인트 테스트

#### 3.1 Health Check

```bash
curl https://your-api.ap-northeast-2.awsapprunner.com
```

**예상 응답**:
```json
{
  "code": "SUC001",
  "message": "Emotion PMS API is running",
  "data": null
}
```

#### 3.2 Swagger 문서 확인

브라우저에서 접속:
```
https://your-api.ap-northeast-2.awsapprunner.com/docs
```

Swagger UI가 정상적으로 표시되는지 확인.

#### 3.3 로그인 테스트

```bash
curl -X POST https://your-api.ap-northeast-2.awsapprunner.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kim@emotion.co.kr",
    "password": "password123"
  }'
```

**예상 응답**:
```json
{
  "code": "SUC001",
  "message": "로그인에 성공하였습니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

### 4. 웹사이트 접속 테스트

#### 4.1 CloudFront 도메인 접속

브라우저에서 접속:
```
https://d1a2b3c4d5e6f7.cloudfront.net
```

#### 4.2 기능 테스트

1. **로그인 페이지**: 정상 렌더링 확인
2. **로그인 시도**: `kim@emotion.co.kr` / `password123`
3. **대시보드**: 로그인 후 리다이렉트 확인
4. **SPA 라우팅**: `/projects`, `/tasks` 등 직접 접속 시 404 없이 정상 동작
5. **브라우저 새로고침**: 현재 페이지 유지 확인

#### 4.3 네트워크 확인

브라우저 개발자 도구 → **Network** 탭:
- API 호출이 `NEXT_PUBLIC_API_URL`로 정상적으로 전송되는지 확인
- CORS 오류가 없는지 확인

---

### 5. 로그 확인

#### 5.1 App Runner 로그

1. AWS 콘솔 → **App Runner** → `emotion-pms-api`
2. **Logs** 탭 → **Application logs**
3. 최근 로그에서 에러 확인

#### 5.2 CloudFront 로그 (활성화한 경우)

1. AWS 콘솔 → **S3** → 로그 버킷
2. CloudFront 로그 파일 다운로드하여 분석

---

## 트러블슈팅

### 1. API 배포 실패

#### 증상
GitHub Actions에서 "Deploy to App Runner" 단계 실패

#### 원인 및 해결

**1.1 ECR 이미지 푸시 실패**

```
Error: Unable to locate credentials
```

**해결**:
- GitHub Secrets의 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 확인
- IAM 사용자의 ECR 권한 확인

---

**1.2 App Runner 배포 타임아웃**

```
Service status: OPERATION_IN_PROGRESS
```

**해결**:
1. AWS 콘솔 → App Runner → 서비스 클릭
2. **Event log** 탭에서 오류 확인
3. 일반적인 원인:
   - DB 마이그레이션 실패: RDS 보안 그룹 확인
   - 환경 변수 오류: `DATABASE_URL`, `JWT_SECRET` 재확인
   - 메모리 부족: 인스턴스 크기 증가 (0.5GB → 1GB)

---

**1.3 Health Check 실패**

```
Health check failed
```

**해결**:
1. App Runner 로그에서 애플리케이션 에러 확인
2. 로컬에서 프로덕션 환경 변수로 Docker 실행:
   ```bash
   docker build -t emotion-pms-api -f apps/api/Dockerfile .
   docker run -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e JWT_SECRET="..." \
     emotion-pms-api
   ```
3. `curl http://localhost:3000` 테스트

---

### 2. Web 배포 실패

#### 증상
GitHub Actions에서 "Deploy to S3" 또는 "Invalidate CloudFront cache" 실패

#### 원인 및 해결

**2.1 S3 업로드 권한 오류**

```
Error: Access Denied
```

**해결**:
- IAM 사용자의 S3 권한 확인 (PutObject, DeleteObject)
- S3 버킷 정책이 올바른지 확인

---

**2.2 CloudFront 무효화 실패**

```
Error: InvalidDistributionId
```

**해결**:
- GitHub Secrets의 `CLOUDFRONT_DISTRIBUTION_ID` 확인 (E로 시작)
- IAM 사용자의 CloudFront 권한 확인

---

**2.3 빌드 실패**

```
Error: NEXT_PUBLIC_API_URL is not defined
```

**해결**:
- GitHub Secrets에 `NEXT_PUBLIC_API_URL` 추가 확인
- 값이 `https://`로 시작하는지 확인 (trailing slash 없음)

---

### 3. API 연결 오류

#### 증상
웹에서 로그인 시도 시 네트워크 오류

#### 원인 및 해결

**3.1 CORS 오류**

```
Access to fetch at 'https://api...' from origin 'https://d1a2b3c4d5e6f7.cloudfront.net' has been blocked by CORS policy
```

**해결**:
API의 CORS 설정 확인 (`apps/api/src/main.ts`):
```typescript
app.enableCors({
  origin: [
    'https://d1a2b3c4d5e6f7.cloudfront.net',
    'http://localhost:3001', // 개발 환경
  ],
  credentials: true,
});
```

변경 후 재배포 필요.

---

**3.2 API URL 불일치**

**해결**:
1. 브라우저 개발자 도구 → Network 탭에서 실제 호출되는 URL 확인
2. `NEXT_PUBLIC_API_URL`과 일치하는지 확인
3. 불일치 시 GitHub Secrets 수정 후 재배포

---

### 4. DB 연결 오류

#### 증상
App Runner 로그에 DB 연결 에러

```
Error: connect ETIMEDOUT
Error: getaddrinfo ENOTFOUND
```

#### 원인 및 해결

**4.1 VPC 설정 오류**

**해결**:
1. App Runner → 서비스 → **Networking** 탭 확인
2. VPC 커넥터가 설정되어 있는지 확인
3. 없으면:
   - **Configuration** → **Edit**
   - **Networking** → Custom VPC 선택
   - VPC 커넥터 추가

---

**4.2 RDS 보안 그룹**

**해결**:
1. RDS → DB 인스턴스 → 보안 그룹 클릭
2. 인바운드 규칙에 PostgreSQL (5432) 포트 허용 확인
3. 소스를 `0.0.0.0/0` 또는 App Runner VPC의 보안 그룹으로 설정

---

**4.3 DATABASE_URL 오류**

**해결**:
1. App Runner → **Configuration** → **Environment variables**
2. `DATABASE_URL` 형식 확인:
   ```
   postgresql://username:password@endpoint:5432/database
   ```
3. 특수문자가 포함된 암호는 URL 인코딩 필요:
   ```bash
   # Python
   python3 -c "import urllib.parse; print(urllib.parse.quote('password@123'))"
   # 결과: password%40123
   ```

---

### 5. SPA 라우팅 문제

#### 증상
CloudFront 도메인에서 `/projects` 직접 접속 시 404 또는 AccessDenied

#### 해결

1. CloudFront → 배포 클릭 → **Error pages** 탭
2. 다음 사용자 지정 오류 응답이 있는지 확인:
   - 403 → `/index.html` (200)
   - 404 → `/index.html` (200)
3. 없으면 Step 5.6 참고하여 추가
4. 추가 후 배포 완료 대기 (5-10분)
5. CloudFront 캐시 무효화:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E1A2B3C4D5E6F7 \
     --paths "/*"
   ```

---

### 6. 롤백 방법

#### API 롤백

**6.1 이전 이미지로 롤백**

1. ECR → `emotion-pms-api` → **Images** 탭
2. 이전 commit SHA 태그 확인 (예: `abc1234`)
3. App Runner 서비스 업데이트:
   ```bash
   aws apprunner update-service \
     --service-arn arn:aws:apprunner:... \
     --source-configuration '{"ImageRepository":{"ImageIdentifier":"123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/emotion-pms-api:abc1234"}}'
   ```

**6.2 GitHub Actions로 롤백**

1. GitHub → **Actions** → **Deploy API**
2. 정상 동작했던 워크플로우 실행 선택
3. **Re-run all jobs** 클릭

---

#### Web 롤백

**6.3 Git 커밋으로 롤백**

```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# GitHub Actions가 자동으로 이전 버전 배포
```

**6.4 S3에서 직접 롤백** (긴급 상황)

1. 이전 빌드 결과물을 로컬에 보관
2. AWS CLI로 수동 업로드:
   ```bash
   aws s3 sync ./backup-build s3://emotion-pms-web --delete
   aws cloudfront create-invalidation \
     --distribution-id E1A2B3C4D5E6F7 \
     --paths "/*"
   ```

---

### 7. 로그 확인 방법

#### App Runner 로그

**AWS 콘솔**:
1. App Runner → 서비스 → **Logs** 탭
2. **Application logs** 또는 **Service logs** 선택

**AWS CLI**:
```bash
# 최근 10분간 로그
aws logs tail /aws/apprunner/emotion-pms-api/application \
  --since 10m --follow
```

---

#### CloudWatch 로그

```bash
# 로그 그룹 목록
aws logs describe-log-groups --log-group-name-prefix /aws/apprunner

# 로그 스트림 확인
aws logs describe-log-streams \
  --log-group-name /aws/apprunner/emotion-pms-api/application \
  --order-by LastEventTime --descending

# 로그 이벤트 조회
aws logs get-log-events \
  --log-group-name /aws/apprunner/emotion-pms-api/application \
  --log-stream-name [스트림명]
```

---

## 참고 자료

### AWS 콘솔 링크

- [RDS 콘솔](https://console.aws.amazon.com/rds/)
- [ECR 콘솔](https://console.aws.amazon.com/ecr/)
- [App Runner 콘솔](https://console.aws.amazon.com/apprunner/)
- [S3 콘솔](https://console.aws.amazon.com/s3/)
- [CloudFront 콘솔](https://console.aws.amazon.com/cloudfront/)
- [IAM 콘솔](https://console.aws.amazon.com/iam/)
- [CloudWatch 로그](https://console.aws.amazon.com/cloudwatch/home?region=ap-northeast-2#logsV2:log-groups)

### AWS 비용 계산기

- [AWS Pricing Calculator](https://calculator.aws/)
- [RDS 요금](https://aws.amazon.com/rds/postgresql/pricing/)
- [App Runner 요금](https://aws.amazon.com/apprunner/pricing/)
- [S3 요금](https://aws.amazon.com/s3/pricing/)
- [CloudFront 요금](https://aws.amazon.com/cloudfront/pricing/)

### AWS 공식 문서

- [App Runner 개발자 가이드](https://docs.aws.amazon.com/apprunner/)
- [ECR 사용자 가이드](https://docs.aws.amazon.com/ecr/)
- [RDS PostgreSQL 가이드](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [CloudFront 개발자 가이드](https://docs.aws.amazon.com/cloudfront/)

### 추가 최적화 방안

#### 성능 최적화

1. **CloudFront 캐시 정책 커스터마이징**
   - 정적 자산: `max-age=31536000` (1년)
   - API 응답: `max-age=0` (캐시 안 함)

2. **RDS 읽기 전용 복제본**
   - 읽기 성능 향상
   - 비용: 기본 인스턴스와 동일

3. **App Runner Auto Scaling 조정**
   - 트래픽 패턴 분석 후 최소/최대 인스턴스 수 조정

#### 비용 최적화

1. **RDS Reserved Instance**
   - 1년 또는 3년 예약으로 최대 60% 절감

2. **S3 Intelligent-Tiering**
   - 자주 사용하지 않는 파일 자동 이동

3. **CloudFront 가격 등급**
   - 북미/유럽만 사용: 비용 절감

#### 보안 강화

1. **WAF (Web Application Firewall)**
   - CloudFront에 WAF 연결
   - DDoS 방어, SQL Injection 차단

2. **Secrets Manager**
   - 환경 변수(DB 암호, JWT Secret)를 Secrets Manager로 이동
   - 자동 rotation 설정

3. **VPC Private Subnet**
   - RDS를 Private Subnet으로 이동
   - Bastion Host를 통해서만 접근

4. **사용자 지정 도메인 + HTTPS**
   - Route 53 도메인 등록
   - ACM SSL 인증서 발급
   - CloudFront CNAME 설정

#### 모니터링 & 알림

1. **CloudWatch Alarms**
   - RDS CPU/메모리 사용률 알림
   - App Runner 오류율 알림
   - CloudFront 4xx/5xx 오류 알림

2. **AWS X-Ray**
   - API 요청 추적
   - 병목 지점 분석

3. **로그 집계**
   - CloudWatch Logs Insights
   - 에러 패턴 분석

---

## 문의 및 지원

- **GitHub Issues**: 프로젝트 리포지토리에 이슈 등록
- **AWS Support**: [AWS Support Center](https://console.aws.amazon.com/support/)
- **커뮤니티**: [AWS 한국 사용자 모임](https://www.facebook.com/groups/awskrug/)

---

**작성일**: 2026-01-27
**버전**: 1.0.0
**작성자**: Claude (AI Assistant)
