param([string]$EnvironmentFile = '.env.production')
$cfg=@{}; Get-Content $EnvironmentFile | ForEach-Object { if($_ -match '^([A-Z0-9_]+)=(.*)$'){$cfg[$matches[1]]=$matches[2]} }
if(!$cfg.DEPLOY_HOST -or !$cfg.DEPLOY_USER -or !$cfg.DEPLOY_PATH){throw 'DEPLOY_HOST, DEPLOY_USER and DEPLOY_PATH are required.'}
$sshArgs=@(); if($cfg.SSH_KEY_PATH){$sshArgs+=@('-i',$cfg.SSH_KEY_PATH)}
$target="$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST):$($cfg.DEPLOY_PATH)";
& ssh @sshArgs "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "mkdir -p '$($cfg.DEPLOY_PATH)/secrets'"
tar --exclude=.git --exclude=node_modules --exclude=.next --exclude=.env.production --exclude=test-results -czf - . | & ssh @sshArgs "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "tar -xzf - -C '$($cfg.DEPLOY_PATH)'"
& scp @sshArgs $EnvironmentFile "$target/.env.production"
if($cfg.THINKAI_CONTENT_PATH -and (Test-Path $cfg.THINKAI_CONTENT_PATH)){& scp @sshArgs $cfg.THINKAI_CONTENT_PATH "$target/secrets/approved-content.json"}else{& ssh @sshArgs "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "sed -i 's|^THINKAI_CONTENT_PATH=.*|THINKAI_CONTENT_PATH=|' '$($cfg.DEPLOY_PATH)/.env.production'"}
if($cfg.THINKAI_DEMO_SEED_PATH -and (Test-Path $cfg.THINKAI_DEMO_SEED_PATH)){& scp @sshArgs $cfg.THINKAI_DEMO_SEED_PATH "$target/secrets/demo-seed.json"}else{& ssh @sshArgs "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "sed -i -e 's|^THINKAI_DEMO_SEED_PATH=.*|THINKAI_DEMO_SEED_PATH=|' -e 's|^THINKAI_DEMO_SEED_SHA256=.*|THINKAI_DEMO_SEED_SHA256=|' -e 's|^THINKAI_DEMO_SEED_VERSION=.*|THINKAI_DEMO_SEED_VERSION=|' '$($cfg.DEPLOY_PATH)/.env.production'"}
& ssh @sshArgs "$($cfg.DEPLOY_USER)@$($cfg.DEPLOY_HOST)" "cd '$($cfg.DEPLOY_PATH)' && docker compose --env-file .env.production up -d --build"
