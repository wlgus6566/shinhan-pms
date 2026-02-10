# AWS 프리 티어 배포 가이드 (초보자용)

> 이모션 PMS를 AWS 프리 티어로 무료 배포하는 방법을 단계별로 설명합니다.

## 전체 구조

```
사용자 브라우저
    ↓
[S3] ← Next.js 정적 파일 (프론트엔드)
    ↓ API 호출
[EC2 t2.micro] ← NestJS 서버 (백엔드)
    ↓
[RDS PostgreSQL] ← 데이터베이스
```

| 서비스 | 용도 | 프리 티어 제한 |
|--------|------|---------------|
| S3 | 프론트엔드 정적 호스팅 | 5GB 저장, 월 2만 요청 |
| EC2 t2.micro | 백엔드 API 서버 | 월 750시간 (1대 상시 가동 가능) |
| RDS db.t3.micro | PostgreSQL DB | 월 750시간, 20GB 스토리지 |

> **주의**: 프리 티어는 AWS 가입 후 **12개월**만 유효합니다.

---

## 사전 준비

- [x] AWS 계정 가입 완료 (프리 티어)
- [ ] 프로젝트 코드가 GitHub에 push 되어 있어야 함
- [ ] 로컬에서 `pnpm build` 정상 작동 확인

---

## 1단계: RDS (데이터베이스) 만들기

### 1-1. RDS 콘솔 접속

1. [AWS 콘솔](https://console.aws.amazon.com) 접속
2. 상단 검색창에 **"RDS"** 입력 → 클릭
3. 왼쪽 메뉴에서 **"데이터베이스"** 클릭
4. **"데이터베이스 생성"** 버튼 클릭

### 1-2. 설정값 입력

| 항목 | 선택 / 입력 |
|------|------------|
| 데이터베이스 생성 방식 | 표준 생성 |
| 엔진 유형 | **PostgreSQL** |
| 엔진 버전 | 16.x (최신) |
| 템플릿 | **프리 티어** ← 반드시 이것! |
| DB 인스턴스 식별자 | `pms-db` |
| 마스터 사용자 이름 | `postgres` |
| 마스터 암호 | 원하는 비밀번호 입력 (**반드시 메모!**) |
| DB 인스턴스 클래스 | db.t3.micro (프리 티어 선택 시 자동) |
| 할당된 스토리지 | 20 (GiB) |
| 스토리지 자동 조정 | **비활성화** (체크 해제) ← 요금 방지 |
| 퍼블릭 액세스 | **예** |
| 초기 데이터베이스 이름 | `pms_dev` |

나머지는 기본값 유지.

### 1-3. 생성 완료

1. **"데이터베이스 생성"** 클릭
2. 상태가 **"사용 가능"** 이 될 때까지 5~10분 대기
3. 생성된 DB 클릭 → **"엔드포인트"** 복사

```
예시: pms-db.abcdefg12345.ap-northeast-2.rds.amazonaws.com
```

> 이 엔드포인트를 나중에 `DATABASE_URL`에 사용합니다.

---

## 2단계: EC2 (백엔드 서버) 만들기

### 2-1. EC2 콘솔 접속

1. 상단 검색창에 **"EC2"** 입력 → 클릭
2. **"인스턴스 시작"** 버튼 클릭

### 2-2. 설정값 입력

| 항목 | 선택 / 입력 |
|------|------------|
| 이름 | `pms-api` |
| OS 이미지 (AMI) | **Amazon Linux 2023** (기본 선택됨) |
| 아키텍처 | 64비트 (x86) |
| 인스턴스 유형 | **t2.micro** (프리 티어 사용 가능 표시 확인) |

### 2-3. 키 페어 (SSH 접속용)

1. **"새 키 페어 생성"** 클릭
2. 키 페어 이름: `pms-key`
3. 유형: RSA
4. 형식: `.pem`
5. **"키 페어 생성"** → `.pem` 파일이 다운로드됨

> **중요**: 이 파일은 다시 다운로드 불가합니다. 안전한 곳에 보관하세요.

### 2-4. 네트워크 설정

**"편집"** 클릭 후:

| 항목 | 값 |
|------|-----|
| 보안 그룹 이름 | `pms-api-sg` |

**인바운드 보안 그룹 규칙**:

| 유형 | 포트 범위 | 소스 | 설명 |
|------|----------|------|------|
| ssh | 22 | 내 IP | SSH 접속용 |
| 사용자 지정 TCP | 3000 | 0.0.0.0/0 | API 서버 포트 |

### 2-5. 스토리지

- 기본 8 GiB → **변경 없이** 그대로 진행

### 2-6. 생성

**"인스턴스 시작"** 클릭 → 1~2분 대기

인스턴스 목록에서 `pms-api` 클릭 → **퍼블릭 IPv4 주소** 복사

```
예시: 3.35.xxx.xxx
```

---

## 3단계: RDS 보안 그룹 설정

> EC2에서 RDS로 접근할 수 있도록 허용해야 합니다.

1. **RDS 콘솔** → 만든 DB (`pms-db`) 클릭
2. **"연결 & 보안"** 탭 → **VPC 보안 그룹** 링크 클릭
3. 해당 보안 그룹의 **"인바운드 규칙"** 탭 → **"인바운드 규칙 편집"**
4. **"규칙 추가"**:

| 유형 | 포트 | 소스 |
|------|------|------|
| PostgreSQL | 5432 | `pms-api-sg` 검색해서 선택 |

5. **"규칙 저장"**

---

## 4단계: EC2에 백엔드 배포

### 4-1. EC2 접속

맥 터미널 (또는 Windows PowerShell)에서:

```bash
# 키 파일 권한 설정 (최초 1회)
chmod 400 ~/Downloads/pms-key.pem

# EC2 접속
ssh -i ~/Downloads/pms-key.pem ec2-user@<EC2 퍼블릭 IP>
```

접속 성공하면 아래처럼 보입니다:

```
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'
[ec2-user@ip-xxx-xxx ~]$
```

### 4-2. 필수 프로그램 설치

```bash
# Node.js 20 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 설치 확인
node --version    # v20.x.x 나오면 성공
npm --version

# pnpm 설치
sudo npm install -g pnpm@8.15.5

# PM2 설치 (서버 프로세스 관리)
sudo npm install -g pm2

# git 설치 확인 (보통 이미 설치됨)
git --version
```

### 4-3. 프로젝트 코드 가져오기

```bash
cd ~
git clone https://github.com/<너의계정>/<레포이름>.git pms
cd pms
```

> GitHub에 코드를 아직 push 하지 않았다면, 로컬에서 먼저 push 해야 합니다.

### 4-4. 환경 변수 설정

```bash
nano ~/pms/apps/api/.env
```

아래 내용을 입력합니다 (자신의 값으로 수정):

```env
# 데이터베이스 (1단계에서 복사한 엔드포인트 사용)
DATABASE_URL="postgresql://postgres:너의비밀번호@pms-db.xxxxx.ap-northeast-2.rds.amazonaws.com:5432/pms_dev"

# JWT
JWT_SECRET="여기에-아무-긴-문자열-넣기-abc123xyz"
JWT_EXPIRES_IN="7d"
```

저장: `Ctrl + X` → `Y` → `Enter`

### 4-5. 빌드 및 실행

```bash
cd ~/pms

# 1. 의존성 설치
pnpm install

# 2. Prisma 클라이언트 생성
cd apps/api
pnpm prisma:generate

# 3. DB 마이그레이션 (테이블 생성)
npx prisma migrate deploy

# 4. 전체 빌드
cd ~/pms
pnpm build

# 5. PM2로 백엔드 서버 실행
cd apps/api
pm2 start dist/main.js --name pms-api

# 6. 서버 재부팅 시에도 자동 실행 설정
pm2 startup
# 출력되는 sudo 명령어를 복사해서 실행!
pm2 save
```

### 4-6. 확인

브라우저에서 접속:

```
http://<EC2 퍼블릭 IP>:3000/api
```

응답이 오면 백엔드 배포 성공!

### 4-7. PM2 유용한 명령어

```bash
pm2 status         # 서버 상태 확인
pm2 logs pms-api   # 로그 보기
pm2 restart pms-api  # 재시작
```

---

## 5단계: S3 (프론트엔드) 배포

### 5-1. Next.js 정적 빌드 설정

**로컬 PC**에서 `apps/web/next.config.js` 수정:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // ← 추가: 정적 파일 빌드
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

`apps/web/.env.production` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://<EC2 퍼블릭 IP>:3000
```

빌드:

```bash
cd apps/web
pnpm build
```

성공하면 `apps/web/out/` 폴더가 생깁니다. 이 폴더의 내용물을 S3에 업로드합니다.

### 5-2. S3 버킷 만들기

1. AWS 콘솔 → 검색창에 **"S3"** 입력 → 클릭
2. **"버킷 만들기"** 클릭

| 항목 | 값 |
|------|-----|
| 버킷 이름 | `pms-web-아무숫자` (전세계에서 고유해야 함) |
| AWS 리전 | 아시아 태평양(서울) ap-northeast-2 |

3. **"이 버킷의 퍼블릭 액세스 차단 설정"**:
   - **모든 퍼블릭 액세스 차단** → **체크 해제** (모두!)
   - "현재 설정으로 인해~" 경고 확인 체크

4. 나머지 기본값 → **"버킷 만들기"**

### 5-3. 정적 웹 호스팅 활성화

1. 만든 버킷 클릭 → **"속성"** 탭
2. 맨 아래로 스크롤 → **"정적 웹 사이트 호스팅"** → **"편집"**

| 항목 | 값 |
|------|-----|
| 정적 웹 사이트 호스팅 | **활성화** |
| 인덱스 문서 | `index.html` |
| 오류 문서 | `index.html` |

3. **"변경 사항 저장"**

### 5-4. 버킷 정책 설정

1. **"권한"** 탭 → **"버킷 정책"** → **"편집"**
2. 아래 JSON 붙여넣기 (`너의버킷이름` 부분 수정):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::너의버킷이름/*"
    }
  ]
}
```

3. **"변경 사항 저장"**

### 5-5. 파일 업로드

1. **"객체"** 탭 → **"업로드"**
2. `apps/web/out/` 폴더 안의 **모든 파일과 폴더**를 드래그 앤 드롭
   - `out/` 폴더 자체가 아니라, **안에 있는 내용물** 전체!
3. **"업로드"** 클릭

### 5-6. 확인

**"속성"** 탭 → 맨 아래 **"정적 웹 사이트 호스팅"** → **버킷 웹 사이트 엔드포인트** URL 클릭

```
예시: http://pms-web-12345.s3-website.ap-northeast-2.amazonaws.com
```

사이트가 뜨면 프론트엔드 배포 성공!

---

## 6단계: 요금 폭탄 방지 (필수!)

### 6-1. 결제 알림 설정

1. AWS 콘솔 → 검색창에 **"Budgets"** 입력 → 클릭
2. **"예산 생성"** 클릭
3. 설정:

| 항목 | 값 |
|------|-----|
| 예산 유형 | 비용 예산 |
| 예산 이름 | `monthly-budget` |
| 예산 금액 | `1` (USD) |
| 알림 임계값 | 80% |
| 이메일 | 본인 이메일 |

4. **"예산 생성"**

> 월 $1 넘으면 이메일이 옵니다. 프리 티어라면 $0이어야 정상입니다.

### 6-2. 프리 티어 사용량 확인

1. AWS 콘솔 → 검색창에 **"Billing"** → **"프리 티어"** 탭
2. 각 서비스별 사용량이 표시됩니다.
3. **매주 한 번은 확인**하는 습관을 들이세요.

---

## 업데이트 배포 방법

### 백엔드 업데이트 (EC2)

```bash
# EC2 접속
ssh -i ~/Downloads/pms-key.pem ec2-user@<EC2 IP>

# 코드 업데이트
cd ~/pms
git pull

# 다시 빌드 + 재시작
pnpm install
cd apps/api
pnpm prisma:generate
npx prisma migrate deploy
cd ~/pms
pnpm build
cd apps/api
pm2 restart pms-api
```

### 프론트엔드 업데이트 (S3)

로컬에서:

```bash
cd apps/web
pnpm build
```

1. AWS 콘솔 → S3 → 버킷 → 기존 파일 전체 삭제
2. `out/` 폴더 내용물 다시 업로드

---

## 트러블슈팅

### EC2 접속 안 됨

```
Permission denied (publickey)
```

→ `.pem` 파일 경로 확인, `chmod 400` 적용했는지 확인

### DB 연결 안 됨

```
Connection refused / timeout
```

→ RDS 보안 그룹에 EC2 보안 그룹(`pms-api-sg`)이 추가되었는지 확인
→ RDS **퍼블릭 액세스**가 "예"인지 확인

### 프론트엔드에서 API 호출 실패

```
CORS error / Network error
```

→ NestJS에 CORS 설정이 되어있는지 확인
→ `NEXT_PUBLIC_API_URL`이 EC2 퍼블릭 IP와 일치하는지 확인

### EC2 메모리 부족

```
JavaScript heap out of memory
```

→ 스왑 메모리 추가:

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 서버 재부팅 후 API 안 됨

→ `pm2 startup` 명령 재실행:

```bash
pm2 startup
# 출력된 sudo 명령어 복사해서 실행
pm2 save
```

---

## 참고: 전체 URL 정리

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | `http://버킷이름.s3-website.ap-northeast-2.amazonaws.com` |
| 백엔드 API | `http://EC2퍼블릭IP:3000` |
| Swagger 문서 | `http://EC2퍼블릭IP:3000/api` |

---

*마지막 업데이트: 2026-02-10*
