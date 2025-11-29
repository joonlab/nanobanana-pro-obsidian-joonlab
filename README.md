# NanoBanana PRO (JoonLab Edition)

> AI를 활용하여 Obsidian 노트를 멋진 Knowledge Poster(인포그래픽)로 변환하세요

![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?logo=obsidian&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.1.0-blue)

---

## Disclaimer

이 프로젝트는 [reallygood83/nanobanana-pro-obsidian](https://github.com/reallygood83/nanobanana-pro-obsidian)을 기반으로 **JoonLab**이 [Claude Code](https://claude.ai/claude-code)를 활용하여 커스터마이징한 버전입니다.

**주요 변경 사항:**
- 최신 AI 모델 지원 (GPT-5, Gemini 3 Pro, Claude 4.5 Opus, Grok 4.1 등)
- 드롭다운 기반 모델 선택 UI 개선
- 이미지 품질 설정 추가 (1K/2K/4K 해상도)
- Gemini 이미지 생성 API 최적화 (aspectRatio, imageSize 설정)
- 프롬프트 생성 로직 품질 향상

원본 프로젝트 제작자: [@reallygood83](https://x.com/reallygood83)

---

## 주요 기능

- **AI 기반 인포그래픽 생성**: 노트 내용을 아름다운 시각적 포스터로 변환
- **다양한 AI 제공자 지원**: OpenAI, Google Gemini, Anthropic Claude, xAI Grok 중 선택
- **최신 모델 지원**: GPT-5.1, Gemini 3 Pro, Claude 4.5 Opus, Grok 4.1 등
- **이미지 품질 선택**: Standard(1K), High(2K), Ultra(4K) 해상도 지원
- **프롬프트 미리보기 및 편집**: 이미지 생성 전 프롬프트 확인 및 수정 가능
- **5가지 비주얼 스타일**: 인포그래픽, 포스터, 다이어그램, 마인드맵, 타임라인
- **자동 재시도**: 일시적 오류 발생 시 지수적 백오프로 자동 재시도
- **실시간 진행 상황**: 단계별 피드백과 함께 진행 상태 표시
- **다국어 지원**: 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어

## 스크린샷

### 진행 상태 모달
```
┌─────────────────────────────────────────┐
│  Knowledge Poster 생성 중...             │
│                                         │
│  ████████████░░░░░░░░ 60%              │
│                                         │
│  ✅ 1. 노트 분석 완료                    │
│  ✅ 2. 프롬프트 생성 완료                 │
│  🔄 3. 이미지 생성 중...                 │
│  ⏳ 4. 파일 저장 대기                    │
└─────────────────────────────────────────┘
```

### 프롬프트 미리보기
```
┌─────────────────────────────────────────┐
│  📝 프롬프트 미리보기                     │
│                                         │
│  🤖 모델: gemini-3-pro-image-preview    │
│  📊 스타일: Infographic                  │
│  🎨 품질: High (2K)                      │
│                                         │
│  [이미지 생성] [다시 생성] [취소]          │
└─────────────────────────────────────────┘
```

## 설치 방법

### BRAT을 통한 설치 (권장)

1. [BRAT](https://github.com/TfTHacker/obsidian42-brat) 플러그인 설치
2. BRAT 설정 열기
3. "Add Beta Plugin" 클릭
4. 다음 주소 입력: `joonlab/nanobanana-pro-obsidian-joonlab`
5. 플러그인 활성화

### 수동 설치

1. [Releases](https://github.com/joonlab/nanobanana-pro-obsidian-joonlab/releases)에서 최신 버전 다운로드
2. 압축 해제 후 Vault의 `.obsidian/plugins/nanobanana-pro-obsidian/` 폴더에 복사
3. Obsidian 재시작
4. 설정 → 커뮤니티 플러그인에서 활성화

## 설정

### API 키

이미지 생성을 위해 **Google API Key**가 필수입니다. 프롬프트 생성을 위해 다른 제공자도 선택적으로 구성할 수 있습니다:

| 제공자 | 필수 여부 | 용도 |
|--------|----------|------|
| Google | ✅ 필수 | 이미지 생성 (항상 필요) |
| OpenAI | 선택 | 프롬프트 생성 |
| Anthropic | 선택 | 프롬프트 생성 |
| xAI | 선택 | 프롬프트 생성 |

**API 키 발급:**
- [Google AI Studio](https://aistudio.google.com/apikey)
- [OpenAI Platform](https://platform.openai.com/api-keys)
- [Anthropic Console](https://console.anthropic.com/settings/keys)
- [xAI Console](https://console.x.ai/)

### 설정 옵션

| 설정 | 기본값 | 설명 |
|------|--------|------|
| AI 제공자 | Google | 프롬프트 생성에 사용할 AI |
| 프롬프트 모델 | gemini-2.5-flash | 이미지 프롬프트 생성 모델 |
| 이미지 모델 | gemini-3-pro-image-preview | 이미지 생성 모델 |
| 이미지 스타일 | Infographic | 시각적 스타일 프리셋 |
| 이미지 품질 | High (2K) | 이미지 해상도 |
| 선호 언어 | 한국어 | 이미지 내 텍스트 언어 |
| 미리보기 표시 | ✅ 활성화 | 생성 전 프롬프트 미리보기 |
| 진행 상태 표시 | ✅ 활성화 | 진행 상태 모달 표시 |
| 첨부파일 폴더 | 999-Attachments | 이미지 저장 위치 |
| 자동 재시도 횟수 | 2 | 일시적 오류 시 재시도 횟수 |

### 지원 모델

#### OpenAI
| 모델 | 등급 | 설명 |
|------|------|------|
| GPT-5.1 | ⭐ Flagship | 최신 플래그십, 고급 추론 및 코딩 도구 |
| GPT-5 Pro | ⭐ Flagship | 복잡한 분석을 위한 최고 수준 추론 |
| GPT-5 Mini | ⚖️ Balanced | 비용 최적화된 추론 및 채팅 |
| GPT-5 Nano | ⚡ Fast | 고처리량, 단순 지시 수행 |
| GPT-4o | ⚖️ Balanced | 안정적인 멀티모달 모델 |
| GPT-4o Mini | ⚡ Fast | 빠르고 비용 효율적 |

#### Google Gemini
| 모델 | 등급 | 설명 |
|------|------|------|
| Gemini 3 Pro | ⭐ Flagship | 가장 강력한 에이전트 모델, 풍부한 비주얼 |
| Gemini 2.5 Pro | ⭐ Flagship | 사고 및 코드 실행 지원 |
| Gemini 2.5 Flash | ⚖️ Balanced | 최고의 가성비 |
| Gemini 2.5 Flash-Lite | ⚡ Fast | 가장 빠르고 저렴한 옵션 |

#### Anthropic Claude
| 모델 | 등급 | 설명 |
|------|------|------|
| Claude 4.5 Opus | ⭐ Flagship | 가장 강력한 Claude, 뛰어난 추론 |
| Claude 4.5 Sonnet | ⭐ Flagship | 성능과 속도의 최적 균형 |
| Claude Sonnet 4 | ⚖️ Balanced | 복잡한 작업에 적합 |
| Claude 3 Haiku | ⚡ Fast | 가장 빠른 Claude |

#### xAI Grok
| 모델 | 등급 | 설명 |
|------|------|------|
| Grok 4.1 Fast | ⭐ Flagship | 최신 멀티모달, 2M 컨텍스트 |
| Grok 4 | ⭐ Flagship | 강력한 추론, 구조화된 출력 |
| Grok 3 | ⚖️ Balanced | 함수 호출 지원 |
| Grok Code Fast | ⚡ Fast | 코딩 작업 최적화 |

## 사용 방법

### Knowledge Poster 생성

1. 내용이 있는 노트 열기
2. 명령 팔레트 열기 (`Cmd/Ctrl + P`)
3. "Generate Knowledge Poster" 검색
4. (선택) 미리보기 모달에서 프롬프트 편집
5. 생성 완료 대기
6. 노트 상단에 이미지가 자동 삽입됨

### 명령어

| 명령어 | 설명 |
|--------|------|
| Generate Knowledge Poster | 전체 생성 프로세스 |
| Generate Prompt Only | 프롬프트만 생성하여 클립보드에 복사 |
| Regenerate Last Poster | 동일한 프롬프트로 마지막 생성 재시도 |

### 단축키 설정

설정 → 단축키에서 사용자 지정 단축키를 할당할 수 있습니다:
- "NanoBanana"로 검색하여 모든 명령어 찾기

## 이미지 스타일

| 스타일 | 설명 | 적합한 용도 |
|--------|------|------------|
| 📊 인포그래픽 | 차트, 아이콘, 시각적 계층 구조 | 데이터 기반 콘텐츠 |
| 🎨 포스터 | 굵은 타이포그래피, 강렬한 이미지 | 공지사항, 요약 |
| 📐 다이어그램 | 기술적, 명확한 연결선 | 시스템 아키텍처 |
| 🧠 마인드맵 | 중심 개념과 가지 | 브레인스토밍, 개념 정리 |
| 📅 타임라인 | 진행과 이정표 | 역사, 프로세스 |

## 이미지 품질

| 품질 | 해상도 | 설명 |
|------|--------|------|
| 📱 Standard | 1K (1024px) | 빠른 생성, 낮은 디테일 |
| 🖥️ High | 2K (2048px) | 권장 설정, 균형잡힌 품질 |
| 🎨 Ultra | 4K (4096px) | 최대 품질, Gemini 3 Pro 전용 |

## 문제 해결

### "API key is not configured"
→ 설정 → NanoBanana PRO에서 API 키를 추가하세요

### "Rate limit exceeded"
→ 몇 분 후 다시 시도하세요. API 요금제 업그레이드를 고려해보세요.

### "Content was blocked by safety filters"
→ 노트 내용을 수정하거나 다른 스타일을 시도하세요

### 이미지 생성이 반복적으로 실패
→ 다른 스타일로 재생성하거나, 미리보기 모드에서 프롬프트를 편집하세요

### 응답에 이미지가 없음
→ 해당 모델이 이미지 생성을 지원하지 않을 수 있습니다. `gemini-3-pro-image-preview`를 사용하세요.

## 개발

### 소스에서 빌드

```bash
# 저장소 클론
git clone https://github.com/joonlab/nanobanana-pro-obsidian-joonlab.git
cd nanobanana-pro-obsidian-joonlab

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 개발 모드 (watch)
npm run dev
```

### 프로젝트 구조

```
nanobanana-pro-obsidian/
├── src/
│   ├── main.ts              # 플러그인 진입점
│   ├── types.ts             # TypeScript 인터페이스
│   ├── settings.ts          # 설정 탭 UI
│   ├── settingsData.ts      # 기본 설정값
│   ├── progressModal.ts     # 진행 상태 모달 UI
│   ├── previewModal.ts      # 프롬프트 미리보기 모달
│   └── services/
│       ├── promptService.ts # AI 프롬프트 생성
│       ├── imageService.ts  # 이미지 생성
│       └── fileService.ts   # 파일 작업
├── manifest.json
├── package.json
├── styles.css
└── README.md
```

## 변경 이력

### v1.1.0 (JoonLab Edition)
- 최신 AI 모델 추가 (GPT-5, Gemini 3 Pro, Claude 4.5 Opus, Grok 4.1)
- 드롭다운 기반 모델 선택 UI
- 이미지 품질 설정 (1K/2K/4K)
- Gemini API imageConfig 최적화 (aspectRatio, imageSize)
- 프롬프트 생성 로직 개선

### v1.0.0
- 초기 릴리스
- 4개 AI 제공자 지원 (OpenAI, Google, Anthropic, xAI)
- 5가지 이미지 스타일
- 단계별 추적이 가능한 진행 상태 모달
- 프롬프트 미리보기 및 편집
- 지수적 백오프를 통한 자동 재시도

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말

- [Obsidian](https://obsidian.md/) - 훌륭한 플랫폼 제공
- [reallygood83](https://github.com/reallygood83) - 원본 NanoBanana PRO 프로젝트 제작
- [Google Gemini](https://ai.google.dev/) - 이미지 생성 기능 제공
- [Claude Code](https://claude.ai/claude-code) - AI 기반 코드 커스터마이징 지원

---

Made with Claude Code by JoonLab
