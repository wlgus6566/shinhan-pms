# 문서 디렉토리

이 디렉토리는 이모션 PMS 프로젝트의 상세 개발 가이드를 포함합니다.

## 문서 구조

```
docs/
├── development/          # 개발 가이드
│   ├── naming-conventions.md   # 명명 규칙
│   ├── patterns.md             # 개발 패턴
│   ├── type-system.md          # 타입 시스템
│   └── commands.md             # 주요 명령어
├── agents/              # AI 에이전트 가이드
│   ├── workflow.md             # 워크플로우
│   └── roles.md                # 역할별 책임
├── setup/               # 설정 및 가이드
│   ├── checklist.md            # 체크리스트
│   └── best-practices.md       # Best Practices
└── README.md            # 이 파일
```

## 문서 사용 방법

### 빠른 시작
1. [CLAUDE.md](../CLAUDE.md) - 핵심 판단 기준 (Always-on)
2. 필요한 상세 문서를 참조

### 개발 시
- [명명 규칙](./development/naming-conventions.md)
- [개발 패턴](./development/patterns.md)
- [타입 시스템](./development/type-system.md)
- [주요 명령어](./development/commands.md)

### AI 에이전트 협업 시
- [워크플로우](./agents/workflow.md)
- [역할별 책임](./agents/roles.md)

### 품질 관리 시
- [체크리스트](./setup/checklist.md)
- [Best Practices](./setup/best-practices.md)

## 문서 업데이트 원칙

1. **CLAUDE.md**: 판단 기준만 (2~3k 토큰)
2. **docs/**: 상세 설명, 예시, 절차 (70%)
3. **artifacts/**: AI 에이전트 산출물 (기획서, 와이어프레임, DB 스키마)

## 관련 문서

- [환경 설정](../SETUP.md)
- [브랜딩](../BRANDING.md)
- [README](../README.md)
- [PRD](../artifacts/prd.md)
