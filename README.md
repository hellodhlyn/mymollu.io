# MolluLog

블루 아카이브 기록 관리 서비스  
<https://mollulog.net>


## 개발

### 웹 서버 배포하기

- NodeJS (>= 18)
- Wrangler CLI

### 에셋 서버 배포하기

- Terraform (or OpenTofu)

```bash
tofu -chdir=deploy/assets init
npm run assets:build
npm run assets:plan
npm run assets:deploy
```
