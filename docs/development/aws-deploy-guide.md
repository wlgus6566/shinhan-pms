# AWS 프리 티어 배포 가이드 (초보자용)

> 이모션 PMS를 AWS 프리 티어로 무료 배포하는 방법을 단계별로 설명합니다.

## 전체 구조

```
사용자 브라우저
    ↓
[EC2 t2.micro] ← Next.js (프론트엔드, 포트 3001)
    ↓            ← NestJS (백엔드 API, 포트 3000)
[RDS PostgreSQL] ← 데이터베이스
```

| 서비스 | 용도 | 프리 티어 제한 |
|--------|------|---------------|
| EC2 t2.micro | 프론트엔드 + 백엔드 서버 | 월 750시간 (1대 상시 가동 가능) |
| RDS db.t3.micro | PostgreSQL DB | 월 750시간, 20GB 스토리지 |

> **주의**: 프리 티어는 AWS 가입 후 **12개월**만 유효합니다.

> **S3 정적 배포를 사용하지 않는 이유**: Next.js의 `output: 'export'`는 동적 라우트(`[id]`)가 있는 CSR 앱과 호환이 안 됩니다. EC2 하나에서 프론트엔드와 백엔드를 함께 실행하는 것이 가장 간단합니다.

---

## 사전 준비

- [ ] AWS 계정 가입 완료 (프리 티어)
- [ ] 프로젝트 코드가 GitHub에 push 되어 있어야 함

---

## 0단계: 리전 확인 (중요!)

> **반드시 서울 리전에서 진행하세요.**

1. AWS 콘솔 우측 상단의 리전 표시 확인
2. **"아시아 태평양 (서울) ap-northeast-2"** 가 아니라면 클릭해서 변경

> **주의**: 미국(오하이오) 등 다른 리전에서 만들면 한국에서 접속 시 200ms+ 지연이 발생하고, EC2와 RDS가 서로 다른 리전에 있으면 통신이 안 됩니다. 모든 리소스(RDS, EC2)는 **같은 리전(서울)** 에 있어야 합니다.

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

## 2단계: EC2 (서버) 만들기

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

> **주의**: t3.micro가 아닌 **t2.micro**를 선택하세요. t3.micro는 프리 티어 제한이 다릅니다.

### 2-3. 키 페어 (SSH 접속용)

1. **"새 키 페어 생성"** 클릭
2. 키 페어 이름: `pms-key`
3. 유형: RSA
4. 형식: `.pem`
5. **"키 페어 생성"** → `.pem` 파일이 다운로드됨

> **중요**: 이 파일은 다시 다운로드 불가합니다. 안전한 곳에 보관하세요. 키 페어는 리전별로 다르므로, 반드시 서울 리전에서 생성하세요.

### 2-4. 네트워크 설정

**"편집"** 클릭 후:

| 항목 | 값 |
|------|-----|
| 보안 그룹 이름 | `pms-api-sg` |

**인바운드 보안 그룹 규칙** (3개 모두 추가!):

| 유형 | 포트 범위 | 소스 | 설명 |
|------|----------|------|------|
| SSH | 22 | 내 IP | SSH 접속용 |
| 사용자 지정 TCP | 3000 | 0.0.0.0/0 | API 서버 포트 |
| 사용자 지정 TCP | 3001 | 0.0.0.0/0 | 프론트엔드 포트 |

> **주의**: 3000 포트와 3001 포트를 **반드시 둘 다** 추가하세요. 나중에 보안 그룹에서 포트를 빠뜨리면 브라우저에서 접속이 안 됩니다 (무한 로딩).

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
2. 아래로 스크롤하여 **"보안 그룹 규칙"** 섹션 찾기
3. 파란색 보안 그룹 링크 (예: `default (sg-xxxxxxxxx)`) 클릭
4. 해당 보안 그룹의 **"인바운드 규칙"** 탭 → **"인바운드 규칙 편집"**
5. **"규칙 추가"**:

| 유형 | 포트 | 소스 |
|------|------|------|
| PostgreSQL | 5432 | `pms-api-sg` 검색해서 선택 |

6. **"규칙 저장"**

> **참고**: "연결된 컴퓨팅 리소스" 테이블의 "VPC 보안 그룹" 컬럼 헤더는 클릭해도 반응 없습니다. **"보안 그룹 규칙"** 섹션의 파란색 링크를 클릭하세요.

---

## 4단계: EC2에 백엔드 배포

### 4-1. EC2 접속

맥 터미널 (또는 Windows PowerShell)에서:

```bash
# 키 파일 권한 설정 (최초 1회) - ⚠️ chmod 오타 주의!
chmod 400 ~/Downloads/pms-key.pem

# EC2 접속
ssh -i ~/Downloads/pms-key.pem ec2-user@<EC2 퍼블릭 IP>
```

> **주의**: `chmod`를 `cdmod`로 잘못 치지 않도록 주의하세요.

최초 접속 시 `Are you sure you want to continue connecting?` 물음에 `yes` 입력.

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

### 4-2. 스왑 메모리 추가 (필수! 빌드 전에 반드시 실행)

> t2.micro는 메모리가 1GB뿐이라 빌드 시 메모리 부족이 발생합니다. **반드시 먼저 스왑을 추가하세요.**

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 4-3. 필수 프로그램 설치

```bash
# git 설치 (Amazon Linux 2023에 기본 설치 안 되어 있음!)
sudo yum install -y git

# Node.js 20 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 설치 확인
node --version    # v20.x.x 나오면 성공
npm --version
git --version

# pnpm 설치
sudo npm install -g pnpm@8.15.5

# PM2 설치 (서버 프로세스 관리)
sudo npm install -g pm2
```

### 4-4. 프로젝트 코드 가져오기

```bash
cd ~
git clone https://github.com/<너의계정>/<레포이름>.git pms
cd pms
```

> GitHub에 코드를 아직 push 하지 않았다면, 로컬에서 먼저 push 해야 합니다.

### 4-5. 환경 변수 설정

**백엔드 환경 변수:**

```bash
nano ~/pms/apps/api/.env
```

아래 내용을 입력합니다 (자신의 값으로 수정):

```env
# 데이터베이스 (1단계에서 복사한 엔드포인트 사용)
DATABASE_URL="postgresql://postgres:너의비밀번호@pms-db.xxxxx.ap-northeast-2.rds.amazonaws.com:5432/pms_dev"

# JWT (아무 긴 문자열 입력, 기억할 필요 없음 - 서버에 저장됨)
JWT_SECRET="여기에-아무-긴-문자열-넣기-abc123xyz"
JWT_EXPIRES_IN="7d"

# JWT Refresh Token (이것도 아무 긴 문자열)
JWT_REFRESH_SECRET="여기에-다른-긴-문자열-넣기-refresh-xyz789"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS (프론트엔드 URL - EC2 퍼블릭 IP 사용)
FRONTEND_URL="http://<EC2 퍼블릭 IP>:3001"
```

저장: `Ctrl + X` → `Y` → `Enter`

**프론트엔드 환경 변수:**

```bash
nano ~/pms/apps/web/.env.production
```

```env
NEXT_PUBLIC_API_URL=http://<EC2 퍼블릭 IP>:3000
```

저장: `Ctrl + X` → `Y` → `Enter`

### 4-6. 빌드 및 실행

```bash
cd ~/pms

# 1. 의존성 설치
pnpm install

# 2. 공유 스키마 패키지 빌드 (⚠️ 반드시 -b 플래그 사용!)
cd packages/schema
npx tsc -b
cd ~/pms

# 3. Prisma 클라이언트 생성
cd apps/api
pnpm prisma:generate

# 4. DB 마이그레이션 (테이블 생성)
npx prisma migrate deploy

# 5. API 빌드 (⚠️ 루트에서 pnpm build 하면 안 됨! 메모리 부족으로 멈춤)
pnpm build

# 6. PM2로 백엔드 서버 실행 (⚠️ 경로에 src/ 포함!)
pm2 start dist/src/main.js --name pms-api

# 7. 서버 재부팅 시에도 자동 실행 설정
pm2 startup
# 출력되는 sudo 명령어를 복사해서 실행!
pm2 save
```

> **중요 - 빌드 경로**: NestJS 빌드 결과물은 `dist/src/main.js`에 생성됩니다 (`dist/main.js`가 아님!).

> **중요 - 스키마 빌드**: `@repo/schema` 패키지는 `npx tsc -b` (build 모드)로 빌드해야 합니다. 일반 `npx tsc`로는 `composite: true` 설정 때문에 파일이 생성되지 않습니다.

### 4-7. 백엔드 확인

브라우저에서 접속:

```
http://<EC2 퍼블릭 IP>:3000/docs
```

Swagger 문서가 뜨면 백엔드 배포 성공!

> **접속 안 되는 경우 체크리스트:**
> 1. EC2 보안 그룹에 3000 포트가 열려 있는지 확인
> 2. `pm2 logs pms-api` 로 에러 로그 확인
> 3. NestJS의 `main.ts`에서 `app.listen(port, '0.0.0.0')`으로 되어 있는지 확인 (기본 `localhost`만 리슨하면 외부 접속 불가)

### 4-8. PM2 유용한 명령어

```bash
pm2 status         # 서버 상태 확인
pm2 logs pms-api   # 로그 보기
pm2 restart pms-api  # 재시작
```

---

## 5단계: EC2에 프론트엔드 배포

### 5-1. 프론트엔드 빌드

```bash
cd ~/pms/apps/web

# 메모리 부족 방지를 위해 옵션 추가
NODE_OPTIONS="--max-old-space-size=512" pnpm build
```

### 5-2. PM2로 프론트엔드 실행

```bash
cd ~/pms/apps/web
PORT=3001 pm2 start node --name pms-web -- node_modules/next/dist/bin/next start -p 3001
```

### 5-3. PM2 상태 저장

```bash
pm2 save
```

### 5-4. 확인

브라우저에서 접속:

```
http://<EC2 퍼블릭 IP>:3001
```

로그인 페이지가 뜨면 프론트엔드 배포 성공!

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

### 전체 업데이트

```bash
# EC2 접속
ssh -i ~/Downloads/pms-key.pem ec2-user@<EC2 IP>

# 코드 업데이트
cd ~/pms
git pull

# 의존성 및 스키마
pnpm install
cd packages/schema && npx tsc -b && cd ~/pms

# 백엔드 빌드 + 재시작
cd apps/api
pnpm prisma:generate
npx prisma migrate deploy
pnpm build
pm2 restart pms-api

# 프론트엔드 빌드 + 재시작
cd ~/pms/apps/web
NODE_OPTIONS="--max-old-space-size=512" pnpm build
pm2 restart pms-web
```

---

## 트러블슈팅

### EC2 접속 안 됨

```
Permission denied (publickey)
```

→ `.pem` 파일 경로 확인, `chmod 400` 적용했는지 확인 (`cdmod` 오타 주의!)

```
UNPROTECTED PRIVATE KEY FILE
```

→ `chmod 400 ~/Downloads/pms-key.pem` 을 실행하지 않았을 때 발생. 반드시 권한 변경 필요.

### git 명령어를 찾을 수 없음

```
-bash: git: command not found
```

→ Amazon Linux 2023에는 git이 기본 설치되어 있지 않음:

```bash
sudo yum install -y git
```

### @repo/schema 모듈을 찾을 수 없음

```
Cannot find module '@repo/schema'
```

→ 공유 스키마 패키지를 먼저 빌드해야 함. **반드시 `-b` 플래그 사용**:

```bash
cd ~/pms/packages/schema
npx tsc -b
```

> 일반 `npx tsc`로는 `composite: true` 설정 때문에 파일이 생성되지 않습니다.

### JwtStrategy requires a secret or key

```
TypeError: JwtStrategy requires a secret or key
```

→ `.env` 파일에 `JWT_REFRESH_SECRET`과 `JWT_REFRESH_EXPIRES_IN`이 누락됨. 추가 필요:

```env
JWT_REFRESH_SECRET="아무-긴-문자열"
JWT_REFRESH_EXPIRES_IN="30d"
```

### PM2 start 시 Script not found

```
Script not found: /home/ec2-user/pms/apps/api/dist/main.js
```

→ 빌드 결과물 경로가 `dist/main.js`가 아니라 `dist/src/main.js`임:

```bash
pm2 start dist/src/main.js --name pms-api
```

### 브라우저에서 접속 안 됨 (무한 로딩)

원인 1: **보안 그룹에 포트가 안 열림**
→ EC2 보안 그룹의 인바운드 규칙에 3000, 3001 포트가 있는지 확인

원인 2: **NestJS가 localhost만 리슨**
→ `apps/api/src/main.ts`에서 `app.listen(port, '0.0.0.0')` 으로 되어 있는지 확인. `app.listen(port)`만 있으면 외부 접속 불가.

### 루트에서 pnpm build 시 멈춤

→ t2.micro (1GB 메모리)에서 Next.js + NestJS를 동시에 빌드하면 메모리 부족으로 멈춤. **각 앱을 개별 빌드**하세요:

```bash
# API만 빌드
cd ~/pms/apps/api && pnpm build

# Web만 빌드
cd ~/pms/apps/web && NODE_OPTIONS="--max-old-space-size=512" pnpm build
```

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

→ NestJS `.env`의 `FRONTEND_URL`이 프론트엔드 주소와 일치하는지 확인
→ `NEXT_PUBLIC_API_URL`이 EC2 퍼블릭 IP와 일치하는지 확인

### EC2 메모리 부족

```
JavaScript heap out of memory
```

→ 스왑 메모리 추가 (4-2단계 참고). 이미 추가했다면 에러가 나는 것이 정상:

```
dd: failed to open '/swapfile': Text file busy
```

이 경우 이미 스왑이 설정되어 있으므로 무시하면 됩니다.

### 서버 재부팅 후 API/Web 안 됨

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
| 프론트엔드 | `http://EC2퍼블릭IP:3001` |
| 백엔드 API | `http://EC2퍼블릭IP:3000` |
| Swagger 문서 | `http://EC2퍼블릭IP:3000/docs` |

---

*마지막 업데이트: 2026-02-10*
