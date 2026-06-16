import { useState, useRef, useCallback } from "react";
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
      { itemId: "powder",     priority: 1, area: "Tゾーン・小鼻まわり", how: "ブラシで軽くのせてテカリをオフ。重ねすぎず薄くが鉄則" },
      { itemId: "correction", priority: 2, area: "頬・あご",             how: "指先で軽くなじませてヨレたベースをなめらかに整える" },
      { itemId: "balm",       priority: 3, area: "目元・口元",           how: "乾燥が気になる部分に少量のせてツヤを復活させて" },
    ],
  },
  {
    skinCondition: "乾燥でくすみが出やすいタイミング",
    concerns: ["頬の乾燥・粉っぽさ", "くすんで見える", "口元のよれ"],
    message: "潤いを足せば、ぐっと明るく見えるはず",
    recommendations: [
      { itemId: "balm",       priority: 1, area: "頬・目元・口元",       how: "指の温かみで少量を溶かしながら押さえるようになじませて" },
      { itemId: "tone",       priority: 2, area: "頬骨・額",             how: "くすみが気になる部分に薄く重ねてトーンを補正" },
      { itemId: "powder",     priority: 3, area: "小鼻・あご",           how: "皮脂が出やすい部分だけピンポイントで軽くおさえる" },
    ],
  },
  {
    skinCondition: "色ムラ＋毛穴が気になりはじめてる",
    concerns: ["頬の色ムラ・赤み", "毛穴が目立つ", "全体的くすみ"],
    message: "2ステップでOK。難しく考えないで",
    recommendations: [
      { itemId: "tone",       priority: 1, area: "赤みが出やすい頬",       how: "コンシーラー感覚で薄く重ねて色ムラをトーンダウン" },
      { itemId: "powder",     priority: 2, area: "鼻・毛穴が気になる部分", how: "毛穴をぼかすようにブラシでくるくると軽くのせる" },
      { itemId: "correction", priority: 3, area: "全体",                   how: "仕上げに指でさっとなじませてメイクをまとめる" },
    ],
  },
];

const C = {
  bg: "#FAF8F5", surface: "#FFF", border: "#EDE5DE",
  skin: "#C4987A", skinLight: "#E8DDD4", skinPale: "#F5EDE8",
  text: "#2C2C2C", muted: "#9E9E9E", accent: "#D4A574",
};

const s = {
  root: { minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP',sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" },
  header: { padding: "18px 24px 14px", borderBottom: "1px solid " + C.border, background: C.surface, display: "flex", alignItems: "baseline", gap: 6 },
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
  primaryBtn: {
    width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg," + C.skin + "," + C.accent + ")",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.06em",
  },
  ghostBtn: {
    width: "100%", padding: "14px 0", borderRadius: 14, border: "1.5px solid " + C.border,
    background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer",
  },
  saveBtn: {
    width: "100%", padding: "15px 0", borderRadius: 14, border: "2px solid " + C.skin,
    background: "#fff", color: C.skin, fontSize: 15, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
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

export default function PaletteApp() {
  const [phase, setPhase] = useState("home");
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
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
      setPhase("result");
    }, 1800);
  }, []);

  const reset = () => {
    setPhase("home");
    setImageData(null);
    setResult(null);
  };

  return (
    <div style={s.root}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.2);opacity:.9} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>
      <header style={s.header}>
        <span style={s.logo}>nuance</span>
        <span style={s.logoSub}>palette</span>
      </header>
      <main style={s.main}>
        {phase === "home"      && <HomeScreen onCapture={() => fileInputRef.current.click()} onSkip={goToPreview} />}
        {phase === "preview"   && <PreviewScreen image={imageData} onAnalyze={analyze} onRetake={() => fileInputRef.current.click()} />}
        {phase === "analyzing" && <AnalyzingScreen />}
        {phase === "result"    && result && <ResultScreen result={result} onReset={reset} />}
      </main>
      <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleImageSelect} style={{ display: "none" }} />
    </div>
  );
}

function HomeScreen({ onCapture, onSkip }) {
  return (
    <div style={s.page}>
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
        <button style={s.ghostBtn} onClick={onSkip}>写真なしで診断する（外回り帰りOLモード）</button>
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
              <span style={{ fontSize: 40 }}>🧖‍♀️</span>
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
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#FAF8F5",
        scale: 2,
        useCORS: true,
      });
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
      <div ref={cardRef} style={s.saveArea}>
        <div style={s.badge}>
          <span style={s.badgeText}>{result.skinCondition}</span>
        </div>
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
              <div key={i}
                style={{ ...s.card, borderColor: isOpen ? item.color : C.border, background: isOpen ? item.color + "15" : "#fff" }}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div style={s.cardRow}>
                  <div style={{ ...s.cardIcon, background: item.color }}>
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                  </div>
                  <div style={s.cardMeta}>
                    <span style={s.cardStep}>STEP {rec.priority}</span>
                    <span style={s.cardName}>{item.name}</span>
                    <span style={s.cardDesc}>{item.desc}</span>
                  </div>
                  <span style={{ ...s.arrow, transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                </div>
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