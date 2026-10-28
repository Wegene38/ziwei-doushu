# 紫微斗数排盘

[![Deploy to GitHub Pages](https://github.com/Wegene38/ziwei-doushu/actions/workflows/deploy.yml/badge.svg)](https://github.com/Wegene38/ziwei-doushu/actions/workflows/deploy.yml)

**在线使用**:https://wegene38.github.io/ziwei-doushu/

基于 GitHub 开源排盘引擎 [iztro](https://github.com/SylarLong/iztro) 开发的紫微斗数 Web 应用,使用 React + TypeScript + Vite 构建。

## 功能

- **排盘输入**:姓名、性别、公历/农历生日(含闰月)、十三个时辰(早子时~晚子时)
- **经典 4×4 十二宫命盘**:
  - 十四主星亮度(庙旺得利平不陷)与四化(禄权科忌)标色
  - 辅星、煞星、杂曜分类着色,长生十二神
  - 大限区间、小限虚岁、身宫/来因宫标记
  - 空宫自动借对宫主星(半透明显示)
- **三方四正**:悬停任意宫位,高亮本宫、对宫与两个三合宫
- **运限查询**:选择任意日期,显示大限/小限/流年/流月/流日所在宫位(命盘角标)及各级四化
- **命盘解读**:本地规则引擎一键生成整份解读——命格总论(组合性格 + 三方四正星曜构成)、格局判定(杀破狼/机月同梁/日月并明/火贪/禄马交驰等 10 余种)、生年四化落宫分批、当前大限运势、十二宫逐宫详解
- **八字职业参考**:从排盘干支四柱计算日主强弱与喜用神,结合十神多旺倾向与神煞(文昌/驿马/华盖/天乙贵人/桃花),推荐适配行业方向
- **释义面板**:点击星曜查看星情简释,点击宫名查看宫位释义
- **档案管理**:出生档案保存在浏览器 localStorage,可随时调出重排
- 中央信息面板:公历/农历/干支四柱、生肖、星座、五行局、命主/身主

## 快速开始

```bash
npm install
npm run dev      # 开发模式 http://localhost:5173
npm run build    # 生产构建,输出到 dist/
npm run preview  # 预览生产构建
```

## 技术栈

| 部分 | 说明 |
| --- | --- |
| [iztro](https://github.com/SylarLong/iztro) v2.6 | 紫微斗数排盘核心(安星、四化、大限、流年等全部计算) |
| React 19 + TypeScript | 界面 |
| Vite 8 | 构建工具 |
| CSS(无 UI 框架) | 暗色古典主题,金色点缀 |

## 项目结构

```
src/
├── App.tsx                  # 主逻辑:状态、布局、档案持久化
├── constants.ts             # 时辰表、地支→网格坐标映射、配色
├── types.ts                 # Profile 等本地类型
├── utils/chart.ts           # iztro 排盘封装、运限标记、三方四正
├── utils/reading.ts         # 解读引擎:总论/格局/四化落宫/分宫/大限
├── utils/bazi.ts            # 八字引擎:四柱解析/日主强弱/喜用神/十神/神煞
├── data/interpretations.ts  # 星曜/宫位简释文本
├── data/chartReading.ts     # 解读文案库:38 组合性格论、四化落宫批语、亮度注
├── data/baziCareer.ts       # 职业映射:五行行业对照、十神倾向、神煞加成
└── components/
    ├── BirthForm.tsx        # 出生信息表单
    ├── ChartGrid.tsx        # 4×4 命盘网格
    ├── PalaceCell.tsx       # 单个宫位(星曜/亮度/四化/大限)
    ├── CenterPanel.tsx      # 中央基本信息
    ├── HoroscopeBar.tsx     # 运限查询条(含解读/职业入口)
    ├── ReadingPanel.tsx     # 命盘解读抽屉面板
    ├── CareerPanel.tsx      # 八字职业参考抽屉面板
    └── ProfileBar.tsx       # 底部档案条
```

## 说明

- 排盘口径以 iztro 为准(闰月默认按"前半月归上月、后半月归下月"修正,可在源码 `castChart` 中调整)。
- 释义文本仅为学习参考的简释,不构成任何人生建议。

## 自动部署

推送到 `main` 分支时,GitHub Actions 会自动构建并发布到 GitHub Pages(见 `.github/workflows/deploy.yml`),无需手动操作。CI 构建时 Vite 的 `base` 自动设为 `/ziwei-doushu/`,本地开发不受影响。
