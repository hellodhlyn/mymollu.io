# MolluLog

블루 아카이브 기록 관리 서비스  
<https://mollulog.net>


## 개발

### 준비 사항

- NodeJS (>= 20)

### 데이터베이스 스키마 동기화

```bash
pnpn run db:dev:migrate
```

### 에셋 서버 배포하기

- Terraform (or OpenTofu)

```bash
tofu -chdir=deploy/assets init
pnpm run assets:build
pnpm run assets:plan
pnpm run assets:deploy
```
