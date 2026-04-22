# Number Snake - AI Agent Instructions

## TWA 빌드 (Android .aab 생성)

### 사전 조건
- `bubblewrap-cli` 설치 필요
- 빌드 디렉토리: 프로젝트 루트 (`/Users/oto/Workspace/game-number_snake`)
- `dist/` 폴더에 최신 웹 빌드 결과물이 있어야 한다 (아이콘, manifest 등 포함)

### 빌드 절차

1. 사용자에게 versionName을 물어본다.
2. `twa-manifest.json`의 `appVersionCode`를 현재 값보다 1 올린다 (bubblewrap이 자동으로 +1 하므로 수동으로 올리지 않아도 됨. 단, 확인 필요).
3. GitHub Pages에 아이콘/manifest가 배포되어 있지 않으면(404), 로컬 서버 우회 방식으로 빌드한다 (아래 참조).
4. `expect`를 사용하여 `bubblewrap build`를 자동 실행한다.

```bash
# dist/ 폴더에서 로컬 서버 시작
python3 -m http.server 8888 --directory ./dist &>/dev/null &

# twa-manifest.json의 URL을 임시로 localhost로 변경
# - iconUrl → http://localhost:8888/icon-512.png
# - maskableIconUrl → http://localhost:8888/icon-512.png
# - webManifestUrl → http://localhost:8888/manifest.webmanifest

# expect로 빌드 실행
expect -c '
set timeout 120
spawn bubblewrap build
expect "Would you like to apply them"
send "Y\r"
expect "versionName"
send "<사용자가 지정한 버전>\r"
expect "Password for the Key Store:"
send "numsnake123\r"
expect "Password for the Key:"
send "numsnake123\r"
expect eof
'

# 빌드 완료 후 정리
# 1. twa-manifest.json의 URL을 원래 GitHub Pages URL로 복원
#    - iconUrl → https://yellyB.github.io/game-number_snake/icon-512.png
#    - maskableIconUrl → https://yellyB.github.io/game-number_snake/icon-512.png
#    - webManifestUrl → https://yellyb.github.io/game-number_snake/manifest.webmanifest
# 2. 로컬 서버 종료: kill $(lsof -ti:8888)
```

5. 빌드 완료 후 `app-release-bundle.aab` 파일이 프로젝트 루트에 생성된다.
6. 생성된 `.aab` 파일을 Google Play Console에 업로드한다.

### 키스토어 정보
- 파일: `./android.keystore`
- Alias: `numsnake`
- Key Store password: `numsnake123`
- Key password: `numsnake123`
- 키스토어 파일은 git에 포함되어 있다. 분실 시 Play Console에 동일 앱을 업데이트할 수 없으므로 절대 삭제하지 않는다.

### 주의사항
- `appVersionCode`는 Play Console에 업로드할 때마다 이전보다 높아야 한다. 절대 같거나 낮추지 않는다.
- `twa-manifest.json`의 URL을 로컬로 변경한 뒤 빌드 후 반드시 원래 GitHub Pages URL로 복원할 것.
- 로컬 서버(port 8888)는 빌드 완료 후 반드시 종료할 것.
