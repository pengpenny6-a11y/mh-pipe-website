# Application directory and stage — 2026-11-19

## Current scope

This iteration follows the user’s approval of the application-section audit and the subsequent correction that the first accordion layout felt crowded and over-animated. The accordion has been replaced rather than polished further.

The left column contains a section heading and six fixed-position application choices. All choices retain the same size and row geometry while the current one changes color and shows tour progress. The right side holds the architectural view, with one concise pipe-layout description and one solution link in a separate caption area below it. No repeated scene heading or text reveal is added.

All six architectural models, double-press fitting geometry, home-water ceiling route, Banner and navigation are unchanged. The slightly smaller view and continuous white ground give the architecture room without placing imagery behind the text. Ground lighting decoration and broad gray shading have been removed.

## Motion

Models now share one world anchor. A dual live-render handoff replaces the previous horizontal travel through empty space. The complete switch lasts 0.62 seconds, with only a short eased overlap; neither an extra camera orbit nor scale flourish is applied. The camera stays still at rest. Continuous pipe flow, hover emphasis and user-controlled orbit remain. Text and surrounding layout do not move during scene selection.

The automatic tour pauses its selection timer while the caption link has keyboard focus, so it does not replace the focused destination. Flow continues. Existing offscreen, hidden-tab, navigation and dialog pauses, reduced-motion behavior and ordinary document scrolling remain.

## Verification

- Production build and Sites packaging passed; all four worker tests passed.
- Eight geometry/flow checks passed: 33 routes, 14 linked branch phases, double-press anatomy and home-water overhead routing retained.
- All nine frozen-file hashes match (Banner, navigation and model/geometry sources).
- All 32 final browser checks pass with no JavaScript or shader exceptions. Six fixed directory rows, single visible panel, rapid selection, keyboard orbit/selection, continued flow, focused-caption tour pause, automatic resumption, overlay/offscreen pauses, natural wheel scrolling and reduced motion were exercised. Chinese and English layouts pass at 1100, 1440 and 1920px.
- Observed scene handoff: 617ms against the 620ms design. No empty architectural frame appeared in the sampled handoff. Stable gas view used 48 draw calls; the sampled dual-pass handoff peaked at 104.
- Visually reviewed the new water/home views, all six-scene overview and English 1100px layout; text, architecture and caption occupy separate regions. Evidence: `outputs/application-directory-2026-11-19/check.json`, `six-scenes-overview.png` and `layout-en-1100.png`.

The normal experience is realtime geometry. These architectural scenes illustrate applications; they are not surveyed installation drawings or a verified press-operation simulation. This update is a local preview, not a production deployment.

## 首页发展历程与全球经销合作 · 2026-11-22

- 对照用户提供的《截屏2026-11-22 02.17.38》调整两段的主次、留白与颜色。首页保留用户指定的厂区效果图，随后四段年份从左至右升高，雪山下沿直接接入通栏绿色地图。雪岭为原创生成的装饰图，来源记录在 public/assets/history/ridge-source.json。
- 四组年份为页面编排区间，正文注明已记录的实际事件年份。2017 年档案链接到国家标准公开记录。地图按大区选择经销询盘；点位表示联络入口。陆地轮廓来自 Natural Earth 公有领域物理地理数据。
- 在实际中文 1440px 和英文 1100px 桌面页面核对年份、指引线、雪山、地图留边、指标和厂区全图。根据截图缩短两处中文，放大桌面地图，并让地图本身进入视口时才开始显影。
- 验证进入、回滚、档案键盘打开与 Escape 关闭、焦点归还、地区点选、询盘地区预填、已有手填草稿保留及减少动态模式。截图与实际浏览器录屏保存在工作区 outputs/岷河发展历程与全球联系。此轮为本地预览。

## Homepage company introduction and title sizes · 2026-11-22

The new company introduction follows the supplied Camel Co. reference. At the reference viewport of 1318 × 1014, the paired copy and factory rendering sit above four circular service links. The three-part band crosses the image boundary. The factory rendering is the original supplied by MH PIPE. The brochure link opens the available Chinese PDF. The 18 inspection items and 20 featured partners are attributed to the company brochures.

Compared the reference against the actual Chinese page and checked the layout in English, the campus image dialog, service destinations and the reduced-motion presentation. The homepage application directory and artwork fit below the masthead at 1440 × 900, 1366 × 768 and 1280 × 720. The home banner retains its existing sizing. Elsewhere content titles follow the size of the Development History heading, including at the two audited desktop widths of 1440px and 1280px. Evidence is in the workspace outputs/首页关于岷河 and outputs/首页应用领域 directories.

final result: passed

## Homepage factory floor and laboratory · 2026-11-22

Compared the supplied 850 × 896 workshop reference (right-hand gallery and laboratory band) with the Chinese homepage rendered at 1440 × 900, device scale factor 1. The workshop photograph has a rounded upper-left corner, an overlapping blue caption, inset controls and a visible slice of the following photograph. In the laboratory band, darkened space on the left carries the text and the microscope and monitor remain visible on the right. The bottom blue treatment carries the three test selectors. The image subjects, labels and source data belong to MH PIPE.

Checked the three production stations, contiguous wrap in both directions, keyboard arrows, the next-photo preview, the full-size photograph and Escape. The carousel resumes when keyboard focus and the pointer leave it. The Chinese and English laboratory panels change both the photograph and its explanation, support arrow keys and Home/End, and respect the user's motion preference. Website build and all nine existing worker tests pass. Desktop evidence is in the workspace outputs/首页制造与实验 directory.

final result: passed

## Homepage factory and laboratory screen sizes

At desktop widths each panel occupies the viewport below the 110px anchor offset. Browser checks at 1280 × 720, 1440 × 900 and 1920 × 1080 confirmed the factory and laboratory anchor bounds, continuous scrolling, switching and absence of horizontal overflow. Native anchor scrolling and the app's programmatic deep links align at the same height. The production figures now sit with the workshop photographs.

final result: passed

## 首页实验能力之后的五个板块 · 2026-11-22

按三个参考图的原始宽度（1362、1298、1170 CSS px，Chrome 设备倍率 1）分别截取新板块。去除第二张参考图中下一板块的边缘后，与实际页面并排检查。最终对照图在本机临时 QA 目录 /private/tmp/mh-lower-final-compare.jpg。

- 标志墙为四列两排，保留各企业标志原色、白底和浅阴影。标题遵循岷河蓝与全站双语字号。浏览器验证了 20 个标志的轮换、手动切换、暂停和减少动态模式。
- 项目图占满横向视口，左下两块白色切换面板、右下说明与档案入口都位于照片内部。复核后调整标题竖标、首张屋顶裁切，并移除项目图与新闻浅灰背景之间多余的外间距。比较了首页照片与档案原页，测试了四个项目与键盘操作。
- 新闻采用上方主报道与四则简讯、下方四篇档案的栅格。用岷河展会实拍替换参考中的体育插画，日期、正文均取自企业档案。实际测试了九个阅读入口。中文与英文桌面版无横向溢出。
- 联系模块展示真实办公楼和分别通往经销、工程需求的入口。验证两个预选询盘目标、页脚两份 PDF 和返回顶部。中英文标题层级、窄桌面换行、图像适配、焦点与动态偏好均已复核。项目画册建筑图约 1080px，超宽屏能看到原图精度限制。

final result: passed

## 首页「关于我们」实景轮播 · 2026-11-23

按参考截图宽度 1156px 对照实机截屏。新版把技术员操作涡流探伤设备的岷河实拍铺满画面，左侧叠放标题、简介、翻页和详情入口，右下保留描边字。中英文三幅画面在该宽度下均为 602px 高，文字切换时下方「服务与支持」位置稳定。

另在中文 1440 × 900、英文 1280 × 800 验证直接打开首页锚点、图文切换、键盘操作、查看厂区原图和四张证书、返回原焦点、公司详情及服务入口。鼠标停留时轮播暂停，减少动态模式下由访客手动切换。

final result: passed
