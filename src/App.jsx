import { useState, useRef, useCallback, useEffect } from "react";
import logo from "./logo.png.jpg";
import face from "./face.jpg";
import html2canvas from "html2canvas";

const PALETTE_ITEMS = {
  balm:       { id: "balm",       name: "潤いバーム",        color: "#D4A574", emoji: "✨", desc: "乾燥・くすみに" },
  correction: { id: "correction", name: "ヨレ補正クリーム",   color: "#C4987A", emoji: "🌿", desc: "メイク崩れに" },
  powder:     { id: "powder",     name: "毛穴ぼかしパウダー", color: "#E8C9A0", emoji: "🌸", desc: "毛穴・テカリに" },
  tone:       { id: "tone",       name: "トーン補正カラー",   color: "#F0B8C8", emoji: "💫", desc: "くすみ・色ムラに" },
};

const MOCK_RESULTS = [
  {
    skinCondition: "午後のテカリ＆ヨレ、お疲れさまです",
    concerns: ["Tゾーンのテカリ", "マスクでヨレたチーク", "毛穴が目立つ"],
    message: "あと少し！肌をリセットして夜まで乗り切ろう",
    recommendations: [
      { itemId: "powder",     priority: 1, area: "Tゾーン・小鼻まわり", how: "ブラシで軽くのせてテカリをオフ。重ねすぎず薄くが鉄則", x: 50, y: 38 },
      { itemId: "correction", priority: 2, area: "頬・あご",             how: "指先で軽くなじませてヨレたベースをなめらかに整える", x: 30, y: 58 },
      { itemId: "balm",       priority: 3, area: "目元・口元",           how: "乾燥が気になる部分に少量のせてツヤを復活させて", x: 50, y: 70 },
    ],
  },
  {
    skinCondition: "乾燥でくすみが出やすいタイミング",
    concerns: ["頬の乾燥・粉っぽさ", "くすんで見える", "口元のよれ"],
    message: "潤いを足せば、ぐっと明るく見えるはず",
    recommendations: [
      { itemId: "balm",       priority: 1, area: "頬・目元・口元",       how: "指の温かみで少量を溶かしながら押さえるようになじませて", x: 35, y: 45 },
      { itemId: "tone",       priority: 2, area: "頬骨・額",             how: "くすみが気になる部分に薄く重ねてトーンを補正", x: 65, y: 30 },
      { itemId: "powder",     priority: 3, area: "小鼻・あご",           how: "皮脂が出やすい部分だけピンポイントで軽くおさえる", x: 50, y: 65 },
    ],
  },
  {
    skinCondition: "色ムラ＋毛穴が気になりはじめてる",
    concerns: ["頬の色ムラ・赤み", "毛穴が目立つ", "全体的くすみ"],
    message: "2ステップでOK。難しく考えないで",
    recommendations: [
      { itemId: "tone",       priority: 1, area: "赤みが出やすい頬",       how: "コンシーラー感覚で薄く重ねて色ムラをトーンダウン", x: 28, y: 50 },
      { itemId: "powder",     priority: 2, area: "鼻・毛穴が気になる部分", how: "毛穴をぼかすようにブラシでくるくると軽くのせる", x: 50, y: 60 },
      { itemId: "correction", priority: 3, area: "全体",                   how: "仕上げに指でさっとなじませてメイクをまとめる", x: 50, y: 80 },
    ],
  },
  {
    skinCondition: "花粉で肌がゆらいでる春の悩み",
    concerns: ["目元・鼻まわりの赤み", "こすって荒れた頬", "くすんで顔色が悪い"],
    message: "触りすぎが一番のダメージ。やさしくリセットして",
    recommendations: [
      { itemId: "balm",       priority: 1, area: "目元・鼻まわり",       how: "刺激を与えず指の腹でそっとなじませて赤みをやわらげて", x: 50, y: 45 },
      { itemId: "tone",       priority: 2, area: "頬・顔全体",           how: "くすみと赤みを同時にカバー。薄く重ねるのがポイント", x: 30, y: 55 },
      { itemId: "correction", priority: 3, area: "荒れが気になる部分",   how: "ベースのヨレをやさしく整えて、肌を均一に見せて", x: 65, y: 55 },
    ],
  },
  {
    skinCondition: "汗と皮脂でメイクが限界な夏肌",
    concerns: ["汗でドロドロに崩れた", "テカリが止まらない", "化粧が厚ぼったく見える"],
    message: "全部落としたい気持ちはわかる。でもこれで乗り切れる",
    recommendations: [
      { itemId: "powder",     priority: 1, area: "顔全体・特にTゾーン",   how: "余分な皮脂と汗をオフ。ティッシュで軽くおさえてからのせると◎", x: 50, y: 35 },
      { itemId: "correction", priority: 2, area: "崩れが目立つ頬・あご", how: "汗で浮いたベースをなめらかに整えて密着させる", x: 30, y: 60 },
      { itemId: "tone",       priority: 3, area: "くすんで見える部分",   how: "疲れた印象をトーンアップ。薄く重ねるだけで顔色が変わる", x: 65, y: 40 },
    ],
  },
  {
    skinCondition: "秋の乾燥、じわじわ肌に出てきてる",
    concerns: ["頬がかさついてきた", "ファンデが浮いてくる", "目元に小じわが目立つ"],
    message: "季節の変わり目、肌は正直。今日だけでも潤いチャージを",
    recommendations: [
      { itemId: "balm",       priority: 1, area: "頬・目元・口元",       how: "乾燥した部分に薄くなじませて、うるおいの膜をつくるイメージで", x: 35, y: 50 },
      { itemId: "correction", priority: 2, area: "ファンデが浮いた部分", how: "浮いたベースを押さえながらなめらかに密着させる", x: 60, y: 55 },
      { itemId: "powder",     priority: 3, area: "小鼻・あご",           how: "乾燥しやすい部分は避けて、皮脂が出るところだけに軽くのせて", x: 50, y: 65 },
    ],
  },
  {
    skinCondition: "冬の極乾燥、肌がカサカサに",
    concerns: ["粉っぽくてファンデが浮く", "口元・目元がつっぱる", "顔色がくすんで暗い"],
    message: "乾燥は全部のトラブルの元。まず潤いを閉じ込めて",
    recommendations: [
      { itemId: "balm",       priority: 1, area: "顔全体・特に乾燥部分", how: "多めに指で温めてからなじませて。潤いのベースをつくるつもりで", x: 50, y: 45 },
      { itemId: "tone",       priority: 2, area: "くすみが出やすい頬・額", how: "血色感をプラスして冬の顔色の悪さをカバーして", x: 30, y: 35 },
      { itemId: "correction", priority: 3, area: "口元・目元",           how: "つっぱりやすい部分のヨレをやさしく整えて仕上げる", x: 50, y: 70 },
    ],
  },
  {
    skinCondition: "デスクワーク疲れで肌がくたびれてる",
    concerns: ["顔色が暗くくすんでいる", "目元がたるんで疲れて見える", "夕方のドロドロ崩れ"],
    message: "画面疲れは肌にも出る。2分でリフレッシュしよう",
    recommendations: [
      { itemId: "tone",       priority: 1, area: "頬・目の下・額",       how: "血色が失われた部分にのせて、ぱっと明るい顔色に整えて", x: 35, y: 40 },
      { itemId: "balm",       priority: 2, area: "目元・口元",           how: "乾燥でくすんだ部分にツヤをプラス。疲れた印象がやわらぐ", x: 50, y: 65 },
      { itemId: "correction", priority: 3, area: "崩れが目立つ部分",     how: "夕方の崩れをさっとリセット。指でなじませるだけでOK", x: 65, y: 55 },
    ],
  },
  {
    skinCondition: "大事な予定前、肌を完璧に整えたい",
    concerns: ["テカリで化粧が崩れてきた", "毛穴が目立ってきた", "顔色をもっと明るく見せたい"],
    message: "あとひと手間で、もっとキレイになれる",
    recommendations: [
      { itemId: "powder",     priority: 1, area: "Tゾーン・毛穴が気になる部分", how: "テカリと毛穴をふんわりカバー。ブラシでくるくるとのせて", x: 50, y: 38 },
      { itemId: "tone",       priority: 2, area: "頬骨・目の下",               how: "顔の高い部分にのせて立体感と明るさをプラスして", x: 30, y: 48 },
      { itemId: "balm",       priority: 3, area: "目元・唇",                   how: "ツヤをのせてイキイキとした印象に。少量でOK", x: 50, y: 68 },
    ],
  },
];

function getSkinForecast() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  const time = hour < 6 ? "night" : hour < 10 ? "morning" : hour < 14 ? "noon" : hour < 18 ? "afternoon" : "evening";

  const base = month >= 6 && month <= 8 ? "summer" :
               month >= 3 && month <= 5 ? "spring" :
               month >= 9 && month <= 11 ? "autumn" : "winter";

  const map = {
    summer: {
      morning:   { emoji: "🌅", label: "蒸し暑い朝・崩れ予防を", level: "mid", advice: "今日も湿度高め。ベース前に毛穴ぼかしパウダーを仕込んで崩れにくくして", color: "#FF8C42", bg: "#FFF3E8" },
      noon:      { emoji: "☀️", label: "真夏の昼・テカリMAX", level: "high", advice: "紫外線と汗でメイクが限界に。毛穴ぼかしパウダーで今すぐオフして", color: "#FF6B35", bg: "#FFF0E8" },
      afternoon: { emoji: "🔥", label: "夕方テカリのピーク", level: "high", advice: "皮脂が一番出る時間帯。ティッシュオフ→パウダーの順でリセットして", color: "#FF8C42", bg: "#FFF3E8" },
      evening:   { emoji: "🌆", label: "夜も蒸し暑い・ベタつき注意", level: "mid", advice: "夜でも湿度が高い季節。軽めに毛穴ぼかしパウダーで整えて", color: "#E8A042", bg: "#FFF5E8" },
      night:     { emoji: "🌙", label: "深夜ケアで明日に備えて", level: "low", advice: "今夜はしっかり洗顔。夏の皮脂汚れをきちんと落として明日の肌を整えて", color: "#9E9E9E", bg: "#F5F5F5" },
    },
    spring: {
      morning:   { emoji: "🌸", label: "花粉の朝・肌バリアを", level: "mid", advice: "外出前に潤いバームで肌バリアを作って。花粉が刺激になりにくくなるよ", color: "#E8A0BF", bg: "#FFF0F5" },
      noon:      { emoji: "🌼", label: "春の昼・乾燥と花粉に注意", level: "mid", advice: "空気が乾いてきたら潤いバームを少量。肌をやさしく整えて", color: "#E8A0BF", bg: "#FFF0F5" },
      afternoon: { emoji: "🌤️", label: "花粉ピーク時間帯", level: "high", advice: "15〜17時は花粉が多い時間。目元・鼻まわりを触らずに潤いバームでケアして", color: "#D4897A", bg: "#FDF0EC" },
      evening:   { emoji: "🌇", label: "帰宅後すぐにケアを", level: "mid", advice: "外から帰ったら花粉をオフ。潤いバームで赤くなった部分をなだめて", color: "#E8A0BF", bg: "#FFF0F5" },
      night:     { emoji: "🌙", label: "春の夜・保湿で肌を回復", level: "low", advice: "花粉で荒れた肌をやさしくケア。今夜は潤いバームをたっぷりなじませて", color: "#9E9E9E", bg: "#F5F5F5" },
    },
    autumn: {
      morning:   { emoji: "🍂", label: "秋の朝・乾燥チェックを", level: "mid", advice: "朝の乾燥が一番きつい季節。洗顔後すぐに潤いバームで保湿して", color: "#C4987A", bg: "#FDF3EC" },
      noon:      { emoji: "🌾", label: "日中も乾燥が進んでる", level: "mid", advice: "エアコンで乾燥しやすい時間帯。潤いバームを少量のせてツヤを復活させて", color: "#C4987A", bg: "#FDF3EC" },
      afternoon: { emoji: "🍁", label: "夕方の乾燥・ヨレ注意", level: "high", advice: "乾燥でファンデが浮いてきやすい時間。ヨレ補正クリームでなめらかに整えて", color: "#C4987A", bg: "#FDF3EC" },
      evening:   { emoji: "🌃", label: "夜風で肌が冷えてくる", level: "mid", advice: "気温が下がると乾燥が加速。帰宅したら潤いバームで肌を温めて", color: "#B08060", bg: "#FDF5EC" },
      night:     { emoji: "🌙", label: "秋の夜・保湿ナイトケアを", level: "low", advice: "今夜は化粧水の後に潤いバームを重ねて。翌朝の肌が全然違うよ", color: "#9E9E9E", bg: "#F5F5F5" },
    },
    winter: {
      morning:   { emoji: "❄️", label: "冬の朝・極乾燥注意", level: "high", advice: "起き抜けの肌は水分ゼロ。洗顔後すぐに潤いバームを全顔になじませて", color: "#7BA7CC", bg: "#EEF5FC" },
      noon:      { emoji: "🌨️", label: "日中も乾燥が続いてる", level: "high", advice: "暖房で室内も乾燥MAX。潤いバームを少量のせてくすみと乾燥を同時にケア", color: "#7BA7CC", bg: "#EEF5FC" },
      afternoon: { emoji: "🌬️", label: "寒風でヨレ・乾燥注意", level: "high", advice: "冷たい風でメイクが乾いて崩れやすい。ヨレ補正クリームで整えてから外出を", color: "#7BA7CC", bg: "#EEF5FC" },
      evening:   { emoji: "🌆", label: "夕方の冷え・肌が固まる", level: "mid", advice: "寒さで肌が硬くなってきたら、指で温めながら潤いバームをなじませて", color: "#7BA7CC", bg: "#EEF5FC" },
      night:     { emoji: "🌙", label: "冬の夜・徹底保湿を", level: "low", advice: "今夜は特に保湿を念入りに。潤いバームをたっぷり使って翌朝に備えて", color: "#9E9E9E", bg: "#F5F5F5" },
    },
  };

  return map[base][time];
}
const C = {
  bg: "#FAF8F5", surface: "#FFF", border: "#EDE5DE",
  skin: "#C4987A", skinLight: "#E8DDD4", skinPale: "#F5EDE8",
  text: "#2C2C2C", muted: "#9E9E9E", accent: "#D4A574",
};

const s = {
  root: { minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP',sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" },
  header: { padding: "18px 24px 14px", borderBottom: "1px solid " + C.border, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: "0.12em", color: C.skin, fontFamily: "Georgia,serif" },
  logoSub: { fontSize: 11, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase" },
  main: { padding: "0 0 48px" },
  page: { padding: "36px 24px", display: "flex", flexDirection: "column", gap: 24 },
  centerPage: { padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  homeTop: { display: "flex", flexDirection: "column", gap: 10 },
  eyebrow: { fontSize: 10, letterSpacing: "0.2em", color: C.skin, textTransform: "uppercase", margin: 0 },
  title: { fontSize: 30, fontWeight: 700, lineHeight: 1.3, margin: 0, fontFamily: "Georgia,serif" },
  titleEm: { fontStyle: "italic", color: C.skin },
  subtitle: { fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "Georgia,serif" },
  body: { fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 },
  chips: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  chip: { borderRadius: 12, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 6 },
  chipEmoji: { fontSize: 20 },
  chipName: { fontSize: 12, fontWeight: 600, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.25)" },
  btnGroup: { display: "flex", flexDirection: "column", gap: 10 },
  primaryBtn: { width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg," + C.skin + "," + C.accent + ")", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.06em" },
  ghostBtn: { width: "100%", padding: "14px 0", borderRadius: 14, border: "1.5px solid " + C.border, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" },
  saveBtn: { width: "100%", padding: "15px 0", borderRadius: 14, border: "2px solid " + C.skin, background: "#fff", color: C.skin, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  historyBtn: { padding: "8px 14px", borderRadius: 20, border: "1.5px solid " + C.border, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" },
  hint: { fontSize: 11, color: C.muted, textAlign: "center", margin: 0 },
  imgFrame: { borderRadius: 20, overflow: "hidden", background: C.skinPale, aspectRatio: "3/4", position: "relative" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" },
  pulseWrap: { position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" },
  pulseRing: { position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + C.skin, animation: "pulse 1.8s ease-in-out infinite" },
  pulseCore: { width: 68, height: 68, borderRadius: "50%", background: C.skinPale, display: "flex", alignItems: "center", justifyContent: "center" },
  dots: { display: "flex", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: C.skin, display: "inline-block", animation: "bounce 0.8s ease-in-out infinite" },
  badge: { background: "linear-gradient(135deg," + C.skinPale + "," + C.skinLight + ")", borderRadius: 14, padding: "18px 20px", textAlign: "center" },
  badgeText: { fontSize: 15, fontWeight: 600, color: C.skin },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  pill: { display: "flex", alignItems: "center", gap: 6, background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "6px 12px", fontSize: 12 },
  pillDot: { width: 6, height: 6, borderRadius: "50%", background: C.skin, flexShrink: 0 },
  message: { fontSize: 13, color: C.muted, textAlign: "center", fontStyle: "italic", lineHeight: 1.7, margin: 0 },
  divRow: { display: "flex", alignItems: "center", gap: 10 },
  divLine: { flex: 1, height: 1, background: C.border },
  divLabel: { fontSize: 10, letterSpacing: "0.16em", color: C.skin, textTransform: "uppercase", whiteSpace: "nowrap" },
  cards: { display: "flex", flexDirection: "column", gap: 10 },
  card: { borderRadius: 14, padding: 16, border: "1.5px solid", cursor: "pointer", transition: "all .2s" },
  cardRow: { display: "flex", alignItems: "center", gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardMeta: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  cardStep: { fontSize: 9, letterSpacing: "0.18em", color: C.skin, textTransform: "uppercase" },
  cardName: { fontSize: 14, fontWeight: 700 },
  cardDesc: { fontSize: 11, color: C.muted },
  arrow: { fontSize: 22, color: C.muted, transition: "transform .2s", lineHeight: 1 },
  cardBody: { marginTop: 14, paddingTop: 14, borderTop: "1px solid " + C.border },
  areaTag: { fontSize: 11, color: C.skin, marginBottom: 8 },
  howText: { fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0 },
  saveArea: { background: C.bg, borderRadius: 16, padding: 4 },
  saveFooter: { textAlign: "center", fontSize: 10, color: C.muted, letterSpacing: "0.15em", marginTop: 8 },
};

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("nuance_history") || "[]"); }
  catch { return []; }
}
function saveHistory(history) {
  localStorage.setItem("nuance_history", JSON.stringify(history));
}export default function PaletteApp() {
  const [phase, setPhase] = useState("splash");
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const fileInputRef = useRef(null);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        setImageData(canvas.toDataURL("image/jpeg"));
        setPhase("preview");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const goToPreview = useCallback(() => {
    setImageData(null);
    setPhase("preview");
  }, []);

  const analyze = useCallback(() => {
    setPhase("analyzing");
    setTimeout(() => {
      const mock = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      setResult(mock);
      const newEntry = { id: Date.now(), date: new Date().toISOString(), skinCondition: mock.skinCondition, concerns: mock.concerns };
      const newHistory = [newEntry, ...loadHistory()].slice(0, 50);
      saveHistory(newHistory);
      setHistory(newHistory);
      setPhase("result");
    }, 1800);
  }, []);

  useEffect(() => {
    if (phase === "splash") setTimeout(() => setPhase("home"), 2500);
  }, [phase]);

  const reset = () => { setPhase("home"); setImageData(null); setResult(null); };

  return (
    <div style={s.root}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.2);opacity:.9} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>
      <header style={s.header}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={s.logo}>nuance</span>
          <span style={s.logoSub}>palette</span>
        </div>
        {phase !== "splash" && (
          <button style={s.historyBtn} onClick={() => setPhase("history")}>履歴</button>
        )}
      </header>
      <main style={s.main}>
        {phase === "splash"    && <SplashScreen />}
        {phase === "home"      && <HomeScreen onCapture={() => fileInputRef.current.click()} onSkip={goToPreview} />}
        {phase === "preview"   && <PreviewScreen image={imageData} onAnalyze={analyze} onRetake={() => fileInputRef.current.click()} />}
        {phase === "analyzing" && <AnalyzingScreen />}
        {phase === "result"    && result && <ResultScreen result={result} onReset={reset} />}
        {phase === "history"   && <HistoryScreen history={history} onBack={() => setPhase("home")} />}
      </main>
      <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleImageSelect} style={{ display: "none" }} />
    </div>
  );
}

function SplashScreen() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#EDE5DC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <img src={logo} alt="nuance palette" style={{ width: "80%", maxWidth: 320, animation: "fadeIn 1.5s ease-in-out" }} />
      <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>
    </div>
  );
}

function HomeScreen({ onCapture, onSkip }) {
  const forecast = getSkinForecast();
  const levelColor = forecast.level === "high" ? "#E05C5C" : "#E8A84A";
  const levelLabel = forecast.level === "high" ? "要注意" : "注意";
  return (
    <div style={s.page}>
      <div style={{ background: forecast.bg, borderRadius: 16, padding: 16, border: "1px solid " + forecast.color + "40" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{forecast.emoji}</span>
            <div>
              <p style={{ fontSize: 10, color: forecast.color, letterSpacing: "0.15em", margin: 0, fontWeight: 700 }}>TODAY'S SKIN FORECAST</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#2C2C2C", margin: 0 }}>{forecast.label}</p>
            </div>
          </div>
          <div style={{ background: levelColor, borderRadius: 20, padding: "3px 10px" }}>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{levelLabel}</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: 0 }}>{forecast.advice}</p>
      </div>
      <div style={s.homeTop}>
        <p style={s.eyebrow}>今の肌、ちゃんと見てる？</p>
        <h1 style={s.title}>撮るだけで<br /><em style={s.titleEm}>崩れケア</em>がわかる</h1>
        <p style={s.body}>写真1枚で肌悩みを分析。<br />パレットの使い方を即提案します。</p>
      </div>
      <div style={s.chips}>
        {Object.values(PALETTE_ITEMS).map(item => (
          <div key={item.id} style={{ ...s.chip, background: item.color }}>
            <span style={s.chipEmoji}>{item.emoji}</span>
            <span style={s.chipName}>{item.name}</span>
          </div>
        ))}
      </div>
      <div style={s.btnGroup}>
        <button style={s.primaryBtn} onClick={onCapture}><span>📷</span><span>今の肌を撮る</span></button>
        <button style={s.ghostBtn} onClick={onSkip}>写真なしで診断する</button>
      </div>
      <p style={s.hint}>写真はAI診断のみに使用し、保存されません</p>
    </div>
  );
}

function PreviewScreen({ image, onAnalyze, onRetake }) {
  return (
    <div style={s.page}>
      <p style={s.eyebrow}>STEP 01 — 確認</p>
      <h2 style={s.subtitle}>この状態で診断する</h2>
      <div style={s.imgFrame}>
        {image
          ? <img src={image} alt="撮影した肌" style={s.img} />
          : <div style={s.noImg}>
              <span style={{ fontSize: 40 }}>🧖</span>
              <p style={{ color: C.muted, fontSize: 13, margin: "8px 0 0" }}>外回り帰りOLの肌を想定して診断します</p>
            </div>
        }
      </div>
      <div style={s.btnGroup}>
        <button style={s.primaryBtn} onClick={onAnalyze}><span>✨</span><span>診断スタート</span></button>
        <button style={s.ghostBtn} onClick={onRetake}>撮り直す</button>
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  return (
    <div style={s.centerPage}>
      <div style={s.pulseWrap}>
        <div style={s.pulseRing} />
        <div style={s.pulseCore}><span style={{ fontSize: 30 }}>🔍</span></div>
      </div>
      <h2 style={s.subtitle}>診断中...</h2>
      <p style={{ color: C.muted, fontSize: 13 }}>肌状態を解析しています</p>
      <div style={s.dots}>
        {[0,1,2].map(i => <span key={i} style={{ ...s.dot, animationDelay: (i*0.25)+"s" }} />)}
      </div>
    </div>
  );
}

function ResultScreen({ result, onReset }) {
  const [open, setOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef(null);

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#F3EADD", scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `nuance-palette-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <div style={s.page}>
      <div style={{ position: "relative", width: "70%", margin: "0 auto", marginBottom: 20 }}>
        <img src={face} alt="face" style={{ width: "100%", display: "block" }} />
        {result.recommendations.map((rec, i) => {
          const item = PALETTE_ITEMS[rec.itemId] || PALETTE_ITEMS.balm;
          return (
            <div key={i} style={{ position: "absolute", left: rec.x + "%", top: rec.y + "%", transform: "translate(-50%, -50%)", width: 28, height: 28, borderRadius: "50%", background: item.color, border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {rec.priority}
            </div>
          );
        })}
      </div>
      <div ref={cardRef} style={s.saveArea}>
        <div style={s.badge}><span style={s.badgeText}>{result.skinCondition}</span></div>
        <div style={{ ...s.pillRow, marginTop: 16 }}>
          {result.concerns.map((c, i) => (
            <div key={i} style={s.pill}><span style={s.pillDot} />{c}</div>
          ))}
        </div>
        <p style={{ ...s.message, marginTop: 16 }}>"{result.message}"</p>
        <div style={{ ...s.divRow, marginTop: 16 }}>
          <div style={s.divLine} />
          <span style={s.divLabel}>あなたへのケア提案</span>
          <div style={s.divLine} />
        </div>
        <div style={{ ...s.cards, marginTop: 16 }}>
          {result.recommendations.map((rec, i) => {
            const item = PALETTE_ITEMS[rec.itemId] || PALETTE_ITEMS.balm;
            const isOpen = open === i;
            return (
              <div key={i} style={{ ...s.card, borderColor: isOpen ? item.color : C.border, background: isOpen ? item.color + "15" : "#fff" }} onClick={() => setOpen(isOpen ? null : i)}>
                <div style={s.cardRow}>
                  <div style={{ ...s.cardIcon, background: item.color }}>
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                  </div>
                  <div style={s.cardMeta}>
                    <span style={s.cardStep}>STEP {rec.priority}</span>
                    <span style={s.cardName}>{item.name}</span>
                    <span style={s.cardDesc}>{item.desc}</span>
                  </div>
                  <span style={{ ...s.arrow, transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>                </div>
                {isOpen && (
                  <div style={s.cardBody}>
                    <div style={s.areaTag}>📍 {rec.area}</div>
                    <p style={s.howText}>{rec.how}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p style={s.saveFooter}>nuance palette — 肌悩み診断</p>
      </div>
      <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
        <span>{saving ? "⏳" : "📥"}</span>
        <span>{saving ? "保存中..." : "診断結果を画像保存"}</span>
      </button>
      <button style={s.primaryBtn} onClick={onReset}>もう一度診断する</button>
    </div>
  );
}

function HistoryScreen({ history, onBack }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const diagnosedDays = new Set(
    history.filter(h => {
      const d = new Date(h.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).map(h => new Date(h.date).getDate())
  );

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const entriesForDay = (day) => history.filter(h => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>←</button>
        <h2 style={{ ...s.subtitle, margin: 0 }}>使用履歴</h2>
      </div>
      <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: "1px solid " + C.border }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{year}年{month + 1}月</span>
          <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
          {["日","月","火","水","木","金","土"].map(d => (
            <div key={d} style={{ fontSize: 10, color: C.muted, paddingBottom: 4 }}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => <div key={"e"+i} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const hasDiag = diagnosedDays.has(day);
            return (
              <div key={day} onClick={() => hasDiag && setSelectedEntry(entriesForDay(day)[0])}
                style={{ fontSize: 12, padding: "6px 0", borderRadius: 8, cursor: hasDiag ? "pointer" : "default", background: hasDiag ? C.skinLight : "transparent", color: hasDiag ? C.skin : C.text, fontWeight: hasDiag ? 700 : 400 }}>
                {day}
                {hasDiag && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.skin, margin: "2px auto 0" }} />}
              </div>
            );
          })}
        </div>
      </div>
      {selectedEntry && (
        <div style={{ background: C.skinPale, borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 8px" }}>
            {new Date(selectedEntry.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.skin, margin: "0 0 8px" }}>{selectedEntry.skinCondition}</p>
          <div style={s.pillRow}>
            {selectedEntry.concerns.map((c, i) => (
              <div key={i} style={s.pill}><span style={s.pillDot} />{c}</div>
            ))}
          </div>
        </div>
      )}
      <div style={{ ...s.divRow }}>
        <div style={s.divLine} />
        <span style={s.divLabel}>すべての履歴</span>
        <div style={s.divLine} />
      </div>
      {history.length === 0 ? (
        <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>まだ履歴がありません</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map(entry => (
            <div key={entry.id} style={{ background: C.surface, borderRadius: 12, padding: "12px 16px", border: "1px solid " + C.border }}>
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 4px" }}>
                {new Date(entry.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.skin, margin: "0 0 6px" }}>{entry.skinCondition}</p>
              <div style={s.pillRow}>
                {entry.concerns.map((c, i) => (
                  <div key={i} style={s.pill}><span style={s.pillDot} />{c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}