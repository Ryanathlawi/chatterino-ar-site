// Interactive replica of the Chatterino AR window. Everything is local and fake.
const $ = (id) => document.getElementById(id);

const channels = [
  { name: "nightowl_sa", viewers: 1284 },
  { name: "abu_gamer", viewers: 642 },
  { name: "lina_plays", viewers: 2310 },
  { name: "falcon_rp", viewers: 418 },
];

const users = [
  ["ابو_فهد", "#ff7a59"], ["nora_x", "#c084fc"], ["سلطان", "#38bdf8"], ["k7lid", "#facc15"],
  ["reem.tv", "#f472b6"], ["ماجد_٩٩", "#4ade80"], ["ghost_12", "#60a5fa"], ["دانه", "#fb923c"],
  ["sam_k", "#a3e635"], ["عزوز", "#22d3ee"],
];
const lines = [
  "والله لعبة حلوة", "يا هلا والله بالجميع", "كم ساعة بتبث اليوم؟", "هههههههه لا تكفى",
  "الشات اليوم رايق", "قوية الحركة ذي", "مين جاي من التيك توك؟", "اللهم صل على محمد",
  "lets gooo", "gg wp", "this game looks so good", "first time here, love the vibe",
  "what's the song name?", "clip that!!", "ما شاء الله عليك", "اسحب عليه ههههه",
];
const badgeColors = ["#9146ff", "#00ad03", "#e91916", "#1f69ff", "#f0a500"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const isArabic = (s) => /[؀-ۿ]/.test(s);
const time = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const chat = $("chat");
let current = 0;
let countMe = true;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function addMessage(name, color, text, opts = {}) {
  const m = el("div", "m" + (opts.mine ? " mine" : "") + (opts.sys ? " sys" : ""));
  m.dir = isArabic(opts.sys ? "ع" : text) ? "rtl" : "ltr";
  m.append(el("span", "t", time()));
  if (!opts.sys) {
    const av = el("span", "av", [...name][0].toUpperCase());
    av.style.background = color;
    m.append(av);
    const nb = opts.badges ?? 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < nb; i++) {
      const b = el("span", "b");
      b.style.background = pick(badgeColors);
      m.append(b);
    }
    const n = el("span", "n");
    n.append(el("bdi", "", name), ":");
    n.style.color = color;
    m.append(n);
  }
  m.append(el("span", "x", text));
  const stick = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 40;
  chat.append(m);
  while (chat.children.length > 80) chat.firstChild.remove();
  if (stick || opts.mine) chat.scrollTop = chat.scrollHeight;
}

function randomMessage() {
  const [n, c] = pick(users);
  addMessage(n, c, pick(lines));
}

function renderTabs() {
  const tabs = $("tabs");
  tabs.textContent = "";
  channels.forEach((ch, i) => {
    const t = el("button", "tab" + (i === current ? " on" : ""), ch.name);
    t.append(el("i", "live-dot"));
    t.onclick = () => openChannel(i);
    tabs.append(t);
  });
  const add = el("div", "add", "+ إضافة قناة");
  add.onclick = () => {
    const name = prompt("اسم القناة:");
    if (!name || !name.trim()) return;
    channels.push({ name: name.trim().slice(0, 20), viewers: 50 + Math.floor(Math.random() * 900) });
    openChannel(channels.length - 1);
  };
  tabs.append(add);
}

function renderViewers() {
  const ch = channels[current];
  $("viewers").textContent = (ch.viewers + (countMe ? 1 : 0)).toLocaleString("ar-SA") + " مشاهد";
}

function openChannel(i) {
  current = i;
  renderTabs();
  $("chanTitle").textContent = "(مباشر) " + channels[i].name;
  renderViewers();
  chat.textContent = "";
  addMessage("", "", "متصل", { sys: true });
  addMessage("", "", "تم الانضمام للقناة", { sys: true });
  for (let k = 0; k < 6; k++) randomMessage();
  flashNoAds();
}

function flashNoAds() {
  const b = $("noads");
  b.classList.add("show");
  setTimeout(() => b.classList.remove("show"), 2600);
}

// player
const player = $("player");
$("mute").onclick = (e) => {
  const muted = e.target.textContent.includes("تشغيل");
  e.target.textContent = muted ? "كتم الصوت" : "تشغيل الصوت";
};
$("hideStream").onclick = (e) => {
  const hidden = player.classList.toggle("collapsed");
  e.target.textContent = hidden ? "إظهار البث" : "إخفاء البث";
};

// sending
$("send").onsubmit = (e) => {
  e.preventDefault();
  const text = $("msg").value.trim();
  if (!text) return;
  addMessage("ضيف", "#1fae6a", text, { mine: true, badges: 0 });
  $("msg").value = "";
};

// settings overlay
$("gear").onclick = () => { $("settings").hidden = false; };
$("setOk").onclick = () => { $("settings").hidden = true; };
$("optPlayer").onchange = (e) => player.classList.toggle("off", !e.target.checked);
$("optAvatars").onchange = (e) => chat.classList.toggle("no-av", !e.target.checked);
$("optTime").onchange = (e) => chat.classList.toggle("no-time", !e.target.checked);
$("optViewer").onchange = (e) => {
  countMe = e.target.checked;
  renderViewers();
  $("viewers").classList.add("bump");
  setTimeout(() => $("viewers").classList.remove("bump"), 900);
};

openChannel(0);
setInterval(randomMessage, 1400);
setInterval(() => {
  channels[current].viewers += Math.round((Math.random() - 0.4) * 6);
  renderViewers();
}, 4000);

// live numbers from GitHub
(async () => {
  try {
    const repo = "https://api.github.com/repos/Ryanathlawi/chatterino-ar";
    const [info, releases] = await Promise.all([
      fetch(repo).then((r) => r.json()),
      fetch(repo + "/releases").then((r) => r.json()),
    ]);
    const downloads = releases.reduce((s, r) => s + r.assets.reduce((a, x) => a + x.download_count, 0), 0);
    const latest = releases[0];
    const zip = latest.assets.find((a) => a.name.endsWith(".zip"));
    const size = zip ? Math.round(zip.size / 1048576) + " MB" : "—";
    const set = (k, v) => document.querySelectorAll(`[data-stat="${k}"]`).forEach((n) => (n.textContent = v));
    set("downloads", downloads.toLocaleString("en"));
    set("stars", info.stargazers_count.toLocaleString("en"));
    set("version", latest.tag_name);
    set("size", size);
    document.querySelectorAll("[data-version]").forEach((n) => (n.textContent = latest.tag_name));
    if (zip) document.querySelectorAll("[data-size]").forEach((n) => (n.textContent = Math.round(zip.size / 1048576) + " ميقا"));
  } catch {
    // offline or rate-limited: keep the placeholders
  }
})();

// hero: a thick 3D block, logo on the front and the app window on the back;
// it flips between them on its own and tilts toward the mouse
(() => {
  const box = $("logo3d");
  const spin = el("div", "spin");
  for (let z = -13; z <= 13; z += 2) {
    const l = el("div", "layer");
    l.style.setProperty("--z", z + "px");
    spin.append(l);
  }
  const ui = el("img", "back");
  ui.src = "img/app.jpg";
  ui.alt = "";
  spin.append(ui, box.querySelector(".face"));
  box.append(spin);
  addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    box.style.setProperty("--ry", -x * 30 + "deg");
    box.style.setProperty("--rx", y * 20 + "deg");
  });
})();
