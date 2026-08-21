param([string]$EnvironmentFile = '.env.production')
$cfg=@{}; Get-Content $EnvironmentFile | ForEach-Object { if($_ -match '^([A-Z0-9_]+)=(.*)$'){$cfg[$matches[1]]=$matches[2]} }
if(!$cfg.DEPLOY_HOST -or !$cfg.DEPLOY_USER -or !$cfg.DEPLOY_PATH){throw 'DEPLOY_HOST, DEPLOY_USER and DEPLOY_PATH are required.'}
if(!(Test-Path $cfg.THINKAI_CONTENT_PATH) -or !(Test-Path $cfg.THINKAI_DEMO_SEED_PATH)){throw 'Approved content and demo seed files must exist before deployment.'}
$target="$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST):$($cfg.DEPLOY_PATH)";
ssh "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "mkdir -p '$($cfg.DEPLOY_PATH)/secrets'"
scp docker-compose.yml Dockerfile package.json package-lock.json $target
scp $EnvironmentFile "$target/.env.production"
scp $cfg.THINKAI_CONTENT_PATH "$target/secrets/approved-content.json"
scp $cfg.THINKAI_DEMO_SEED_PATH "$target/secrets/demo-seed.json"
ssh "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "cd '$($cfg.DEPLOY_PATH)' && docker compose --env-file .env.production up -d --build"
