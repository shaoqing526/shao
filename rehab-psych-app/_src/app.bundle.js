
const SOURCES = [
  { n:'引言（Reid-Arndt & Brenner）', d:'康复心理学的定义与范围；人—环境交互的历史脉络：Meyerson（1948）提出“适应不只是个人的事，社会也需要调整”，Wright（1983）延续这一视角。' },
  { n:'第 1 章 康复心理学与胜任力本位实践', d:'ICF 生物心理社会模型；把目标定位在“最大化健康与福祉、独立与选择、功能能力与社会角色参与”。' },
  { n:'第 5 章 干预（Turner & Bombardier）', d:'PANEP 干预框架：指导原则 · 适应 · 自然史 · 证据基础 · 临床呈现；以及自我效能与目标设定在康复中的应用。' },
  { n:'第 9 章 只有连接：残疾的社会心理学', d:'污名、歧视与微攻击；残疾的积极心理学；以幸福感与茁壮成长（flourishing）作为干预目标；接触与积极社会环境。' },
  { n:'第 4 章 评估（Bush & Rush）', d:'以人为中心、多来源、跨情境的评估，而不是只盯着一份缺陷清单。' },
  { n:'第 12 章 家庭与残疾', d:'家庭既是支持来源，也可能是压力来源；把家庭纳入干预单元。' },
  { n:'第 13 章 老化与残疾', d:'全生命周期视角：康复目标随年龄与生活阶段而改变。' },
  { n:'第 29 章 社区本位康复', d:'同伴支持、社区参与与去机构化；“经验专家”的独特价值。' }
];
const TOOLBOX_ALL = {
  listen:  { ico:'🤝', name:'以人为中心的倾听', desc:'情绪先被看见，改变才有可能发生。倾听不是拖延，它是所有干预的地基。' },
  icf:     { ico:'🌐', name:'ICF 三圈地图',      desc:'身体功能与结构 / 活动 / 参与，外面套着环境因素与个人因素。换一层提问，就换一批可能。' },
  env:     { ico:'🔧', name:'环境杠杆清单',      desc:'在“他做不到”和“环境不允许”之间，先动后者。环境是最被低估、也最容易改动的干预点。' },
  ladder:  { ico:'🪜', name:'微目标阶梯',        desc:'够得着的一小步 → 一次真实的小成功 → “我能行” → 敢迈下一步。' },
  strength:{ ico:'💎', name:'优势与意义盘点',    desc:'把问题从“我少了什么”换成“我还有什么、我在乎什么、谁能和我一起”。' },
  peer:    { ico:'🌱', name:'同伴支持与自主选择', desc:'被经历过的人理解，是独特的力量；但这份力量只在自愿时才会生长。' }
};
const TAKEAWAYS = [
  '先看见人，再看见病。',
  '功能是「人 × 环境」的产物，不是一个人身上的属性。',
  '大目标要配一张今天就能踩上去的阶梯。',
  '复原不只是修补缺损，也包括重建意义。',
  '支持的最高形式，是让对方越来越不需要你。'
];

;

const SCENES = [
  {
    id:'s1', act:'第 1 幕', title:'沉默的病房', place:'急性期 · 受伤后第 6 天', secs:40,
    narr:[
      '训练结束后，病房安静下来。',
      '{name} 盯着天花板，忽然开口：',
      '“我以后什么都做不了了。你们让我练这些，有什么用？”'
    ],
    q:'你会怎么回应？',
    tool:'listen',
    choices:[
      { k:'A', t:'“别这样想。现在医学这么发达，你一定会好起来的。”',
        badge:'善意的乐观', best:false,
        fb:'这是最常听见、也最出于好意的一句话。但它悄悄跳过了他此刻真正的体验——当痛苦没有被承认，人反而更孤独。它还可能传递一条隐含的规则：“难受”是不被允许的。康复心理学更关心的其实是：说完这句话之后，他还愿不愿意继续说下去。' },
      { k:'B', t:'“听起来今天特别难熬。你愿意说说，现在最让你害怕的是什么吗？”',
        badge:'以人为中心的倾听', best:true,
        fb:'**先听见，再行动。** 承认痛苦不等于放弃希望——恰恰相反，它让希望有地方落脚。在康复的急性期，建立关系、容纳情绪不是“耽误训练”，它是后面所有干预能够起作用的地基。这也是本书把“个体与社会情境”放在干预框架最前面的原因。' },
      { k:'C', t:'“我们先看康复计划表。今天的目标是坐起来 3 分钟，做到了就是进步。”',
        badge:'任务先行', best:false,
        fb:'你抓住了“行动”这条腿，这是对的——康复离不开行动。但情绪还没被看见时，任务很容易被体验成又一件“要求我做到的事”。更好的顺序常常是：先连接、再行动。这样，同一张计划表会从“布置的作业”，变成“我们一起商量出来的约定”。' }
    ]
  },
  {
    id:'s2', act:'第 2 幕', title:'“到底能不能恢复到以前那样”', place:'中期 · 康复评定会', secs:40,
    narr:[
      '评定会上，医生看着影像说恢复得比预期慢；治疗师说他目前穿衣还需要帮助。',
      '家属转过头来问你：“他到底能不能恢复到以前那样？”',
      '你需要帮团队把「康复目标」重新写清楚。'
    ],
    q:'这个目标，你会写在哪一层？',
    tool:'icf',
    choices:[
      { k:'A', t:'目标：恢复下肢肌力，争取独立行走。',
        badge:'功能／损伤层', best:false,
        fb:'这是很重要的一层，但它只是完整图景里的第一圈。如果目标停在这里，一次肌力评定的小波动，就容易被理解成对整个生活的判决。更关键的是：很多真实的功能改善，恰恰来自另外两圈——活动与参与。' },
      { k:'B', t:'目标：三个月内完成 3 件他真正在意的事——自己能移乘到轮椅、参加一次朋友聚会、重新用手机处理点工作；同时记录环境与个人因素。',
        badge:'ICF 三圈 + 情境', best:true,
        fb:'**这正是 ICF 生物心理社会模型的写法。** 功能与障碍不是某个部位的属性，而是“健康状态 × 环境因素 × 个人因素”动态互动的结果。它把“能不能走路”翻译成“想过什么样的生活”，目标因此变得可参与、可协商。ICF 也提示我们：环境往往是最容易被改变、也最容易被忽略的那一环。' },
      { k:'C', t:'目标：先让他情绪好起来，心情好了什么都好办。',
        badge:'情绪优先', best:false,
        fb:'情绪确实关键，它是重要的个人因素——但它不是唯一的变量，也不该被当成“前提条件”来等待。临床上更常用的是“并行”：情绪支持与功能目标同时推进，让它们互相带动。等到情绪完全好了再开始，往往等不到那一天。' }
    ]
  },
  {
    id:'s3', act:'第 3 幕', title:'门口的三级台阶', place:'出院前后 · 家庭环境评估', secs:40,
    narr:[
      '回家第一天，{name} 在门口停住了。',
      '三级台阶。轮椅上不去。',
      '他试了两次，退了回来，之后再也没有提过“出门”这件事。'
    ],
    q:'你的下一步是什么？',
    tool:'env',
    choices:[
      { k:'A', t:'“多想想开心的事，别老盯着台阶。”',
        badge:'把问题放回个人', best:false,
        fb:'这句话把全部重量压回了个人身上，隐含的信息是：“环境不会变，你只能改变你的感受。” 但康复心理学的一条核心主张恰好相反——在判断一个人适应得好不好之前，先看看环境里有多少东西是可以被改动的。' },
      { k:'B', t:'“我们一起做一张「环境清单」：门口加装坡道、浴室扶手、社区里的无障碍路线、线上康复同伴小组、有没有远程岗位。一项一项去试。”',
        badge:'人—环境交互', best:true,
        fb:'**这正是“人—环境交互”原则。** 从 Meyerson（1948）到 ICF（2001），康复心理学一直强调：适应不只是个人的事，社会与环境同样需要调整。当环境改变的时候，那些“被限制住”的能力会重新出现——门外的世界回来了，参与也就回来了。' },
      { k:'C', t:'“那就少出门吧，安全第一。”',
        badge:'保护性回避', best:false,
        fb:'这几乎总是出于保护。但参与减少会带来一串连锁反应：情绪、体能、社交、自我认同一起下滑，之后想再出门会更难。康复心理学会先问一个更具体的问题——怎样在保留参与的前提下，把风险降下来？' }
    ]
  },
  {
    id:'s4', act:'第 4 幕', title:'一杯水的距离', place:'第 5 周 · 训练室', secs:40,
    narr:[
      '桌子上有杯水，离他大约 30 厘米。',
      '{name} 看着杯子说：',
      '“我想自己倒一杯。但我肯定做不到。”'
    ],
    q:'你会怎么接？',
    tool:'ladder',
    choices:[
      { k:'A', t:'“我们来定个目标：三个月内生活完全自理。加油！”',
        badge:'远大目标', best:false,
        fb:'大目标给方向，但如果它离今天太远，每一天都可能变成“又没做到”。远大的目标需要一张阶梯，而不只是一句口号——而且阶梯的第一级，必须今天就能踩上去。' },
      { k:'B', t:'“把它切成今天能做的一小步：今天只练「握住杯子保持 10 秒」。做到了，我们就在记录本上打一个勾。”',
        badge:'掌握性体验', best:true,
        fb:'**这是自我效能最可靠的引擎。** 自我效能最强的来源是“亲历的成功体验”（mastery experience）——不是被鼓励，而是真的做到过。每一个勾，都在更新一条底层信念：“我可以影响我的生活。” 在康复里，这条信念比任何一次说教都更能预测他会不会继续练下去。' },
      { k:'C', t:'（趁他不注意把水倒好）“好了，你看，你做到了。”',
        badge:'代为完成', best:false,
        fb:'出于好意，但“被完成的成功”不会带来效能感。更需要留意的是：过度帮助会让对方更加确信自己做不到，也悄悄拿走了他真实施展能力的机会。帮助的目标，是让自己越来越不被需要。' }
    ]
  },
  {
    id:'s5', act:'第 5 幕', title:'“我这一生还有什么用”', place:'第 9 周 · 一次很长的谈话', secs:45,
    narr:[
      '他忽然问你：',
      '“我以前在工地上，一个人能扛两袋水泥。现在我这个样子，还有什么用？”'
    ],
    q:'你带着他走向哪里？',
    tool:'strength',
    choices:[
      { k:'A', t:'“我们先列一个「功能缺陷清单」，一条条列出来，一项项修。”',
        badge:'修补取向', best:false,
        fb:'缺陷清单在评估阶段很有价值，但如果它变成整场对话的全部，对方眼里就只剩下“少掉的部分”。只做修补的复原，天花板是“不那么糟”——而康复心理学的目标要更高：不只是减少痛苦，也包括增加什么。' },
      { k:'B', t:'“我们做一次「优势盘点」：你以前最擅长什么？什么事你到现在还放不下？谁在乎你、你又在乎谁？从里面找一个你现在还能做、也愿意做的小贡献。”',
        badge:'优势与意义', best:true,
        fb:'**优势视角 + 意义重构。** 从 Meyerson 到当代“残疾的积极心理学”，一条重要的转向是：复原不只是修补缺损，也包括发现优势、重建意义、走向幸福与茁壮成长（flourishing）。而意义常常从“我还能给予什么”开始，而不是从“我还剩什么”开始。' },
      { k:'C', t:'“别想了，想开点，比你惨的人多的是。”',
        badge:'向下比较', best:false,
        fb:'这句话是想帮忙的，但它同时否定了他的经历和感受。“向下比较”很少带来意义，有时反而加深羞耻——而他和你之间的信任，也会一起被磨掉一点。' }
    ]
  }
];

const BONUS = {
  id:'s6', act:'加练一幕', title:'新来的女孩', place:'出院后 · 康复同伴小组', secs:40,
  narr:[
    '{name} 加入了同伴小组。最近小组里来了一位刚受伤的女孩，她非常害怕。',
    '伙伴们希望他去和她聊聊。他问你：“我去有用吗？我什么都不是。”'
  ],
  q:'你怎么回答？',
  tool:'peer',
  choices:[
    { k:'A', t:'“去不去由你决定。如果你愿意试，我可以陪你一起想想第一句话怎么说。”',
      badge:'自主 + 支持', best:true,
      fb:'**一句话同时照顾了两件事。** 一是尊重“自主与选择”——这正好写在康复心理学对康复目标的定义里；二是提供支持性的脚手架，让选择变得可以执行。同伴支持之所以有效，是因为它来自“经历过的人”，而这份力量只有在自愿时才会生长。' },
    { k:'B', t:'“当然有用！你必须去，这对你也是好事。”',
      badge:'好意 + 义务', best:false,
      fb:'“必须”会把一件好事变成一项任务。当帮助被安排，他失去的是选择感——而选择感本身，就是心理健康的一部分。' },
    { k:'C', t:'“算了，你自己还没好，别去了。”',
      badge:'过度保护', best:false,
      fb:'这保护了他的时间，也拿走了他“我还能为别人做点什么”的机会。而后者，常常正是意义重建最快的入口。' }
  ]
};

;

(function(){
'use strict';
const $ = (id) => document.getElementById(id);
const stage = $('stage'), progBar = $('progBar'), timePill = $('timePill'), toolCount = $('toolCount');

const TOOL_SRC = {
  listen:  '第 5 章《干预》· PANEP 模型：先理解个体与社会情境',
  icf:     '第 1 章 · 第 5 章（ICF，世界卫生组织，2001）',
  env:     '引言 · 第 1 章（人—环境交互；Meyerson, 1948；Wright, 1983）',
  ladder:  '第 5 章《干预》（自我效能与目标设定）',
  strength:'第 9 章《只有连接：残疾的社会心理学》',
  peer:    '第 9 章 · 第 29 章（社会支持与社区本位康复）'
};

const state = {
  screen: 'intro', sceneIdx: 0, choiceIndex: null,
  tools: [], name: '阿哲', list: SCENES.slice(), bonusDone: false, answers: []
};

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function md(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'); }
function nm(s){ return String(s==null?'':s).replace(/\{name\}/g, esc(state.name)); }
function fmt(sec){
  sec = Math.max(5, Math.round(sec));
  if (sec < 60) return '约 ' + sec + ' 秒';
  const m = Math.floor(sec/60), s2 = Math.round(sec%60);
  return s2 ? ('约 ' + m + ' 分 ' + s2 + ' 秒') : ('约 ' + m + ' 分钟');
}
const INTRO_SEC = 15, BREATH_SEC = 12, OUTRO_SEC = 20;
function scenesFrom(i){ return state.list.slice(i); }
function sumSecs(arr){ return arr.reduce((a,s)=>a+s.secs,0); }
function remainSec(){
  switch(state.screen){
    case 'intro':  return INTRO_SEC + BREATH_SEC + sumSecs(state.list) + OUTRO_SEC;
    case 'breath': return BREATH_SEC + sumSecs(state.list) + OUTRO_SEC;
    case 'scene':  return sumSecs(scenesFrom(state.sceneIdx)) + OUTRO_SEC;
    case 'feedback': return sumSecs(scenesFrom(state.sceneIdx+1)) + OUTRO_SEC;
    default: return OUTRO_SEC;
  }
}
function totalSteps(){ return 2 + state.list.length + 1; }
function doneSteps(){
  if (state.screen === 'intro') return 0;
  if (state.screen === 'breath') return 1;
  if (state.screen === 'scene') return 2 + state.sceneIdx;
  if (state.screen === 'feedback') return 2 + state.sceneIdx + 0.5;
  return 2 + state.list.length + 1;
}
function syncChrome(){
  progBar.style.width = Math.round(doneSteps()/totalSteps()*100) + '%';
  if (state.screen === 'care' || state.screen === 'done') { timePill.textContent = '已完成'; }
  else if (state.screen === 'intro') { timePill.textContent = fmt(INTRO_SEC + BREATH_SEC + sumSecs(state.list) + OUTRO_SEC); }
  else { timePill.textContent = '还剩 ' + fmt(remainSec()); }
  toolCount.textContent = state.tools.length;
}
function unlock(key){ if (key && state.tools.indexOf(key) === -1) state.tools.push(key); }

/* ---------------- screens ---------------- */
function viewIntro(){
  return '<div class="card anim">'
    + '<div class="eyebrow">康复心理学 · 互动体验</div>'
    + '<h1>五分钟同行</h1>'
    + '<p class="lead">你要陪一个人，走过康复早期的一段路。</p>'
    + '<p>没有对错，只有不同的选择。每做一个选择，你会收到一张康复心理学的「视角卡片」，它们会慢慢填满你的工具箱；走完时，你再回头看这一段路。</p>'
    + '<div class="chips"><span class="chip">约 4 分钟</span><span class="chip">5 个片段</span><span class="chip g">随时可以停</span><span class="chip g">不用注册</span></div>'
    + '<div class="rule"></div>'
    + '<h3>先给 TA 一个名字</h3>'
    + '<p style="margin-bottom:4px">你将要陪伴的人。可以是你想象中的一个具体的人。</p>'
    + '<div class="field"><input type="text" id="nameInput" maxlength="8" value="' + esc(state.name) + '" aria-label="被陪伴者的名字"><span class="pill" style="box-shadow:none">留空就用「阿哲」</span></div>'
    + '<div class="btns"><button class="btn primary" id="startBtn">开始同行</button><button class="btn ghost" id="srcBtn">先看看知识来源</button></div>'
    + '</div>';
}
function viewBreath(){
  return '<div class="card anim">'
    + '<div class="eyebrow">开始之前 · 15 秒</div>'
    + '<h2>先安放一下自己</h2>'
    + '<p>同伴的状态是会被另一个人感觉到的。所以在开始之前，先给自己一个呼吸。</p>'
    + '<div class="breathe"><div class="orb" id="orb">准备</div></div>'
    + '<p id="breathTip" style="text-align:center;color:var(--ink3);margin-top:6px">跟着圆圈：吸气 4 秒 · 停留 2 秒 · 呼气 6 秒</p>'
    + '<div class="btns"><button class="btn primary" id="breathGo">开始呼吸</button><button class="btn plain" id="skipBreath">跳过，直接出发</button></div>'
    + '</div>';
}
function viewScene(){
  const s = state.list[state.sceneIdx];
  const narr = s.narr.map(p => '<p>' + nm(p) + '</p>').join('');
  const choices = s.choices.map((c,i) =>
    '<button class="choice" data-i="' + i + '"><span class="k">' + esc(c.k) + '</span><span class="txt">' + nm(c.t) + '</span></button>'
  ).join('');
  return '<div class="card anim">'
    + '<div class="eyebrow">' + esc(s.act) + ' · ' + esc(s.place) + '</div>'
    + '<h2>' + nm(s.title) + '</h2>'
    + '<div class="narr">' + narr + '</div>'
    + '<h3>' + esc(s.q) + '</h3>'
    + '<div class="choices">' + choices + '</div>'
    + '<div class="btns"><button class="btn plain" id="openToolbox2">先看看我的工具箱（' + state.tools.length + ' 张）</button></div>'
    + '</div>';
}
function viewFeedback(){
  const s = state.list[state.sceneIdx];
  const c = s.choices[state.choiceIndex];
  const t = TOOLBOX_ALL[s.tool];
  const badge = c.best
    ? '<span class="badge ok">✦ 贴近本书的做法</span>'
    : '<span class="badge alt">◇ 另一种视角，也值得看见</span>';
  const isLast = state.sceneIdx >= state.list.length - 1;
  return '<div class="card anim">'
    + '<div class="eyebrow">' + esc(s.act) + ' · 你的回应</div>'
    + badge
    + '<div class="echo">「' + nm(c.t) + '」<br><span style="font-size:12.5px;color:var(--ink3)">' + esc(c.badge) + '</span></div>'
    + '<div class="fb">' + md(nm(c.fb)) + '</div>'
    + '<div class="tool"><div class="th"><span class="ico">' + t.ico + '</span><span>' + esc(t.name) + '</span></div>'
    + '<p style="margin:0;color:var(--ink2)">' + esc(t.desc) + '</p>'
    + '<div class="src">已收入工具箱 · 来源：' + esc(TOOL_SRC[s.tool] || '') + '</div></div>'
    + '<div class="btns"><button class="btn primary" id="nextBtn">' + (isLast ? '看看这一路' : '继续') + '</button>'
    + '<button class="btn ghost" id="retryBtn">换个回应再看看</button></div>'
    + '</div>';
}
function viewOutro(){
  const cards = state.tools.map(k => {
    const t = TOOLBOX_ALL[k];
    return '<div class="tcard"><div class="ico">' + t.ico + '</div><h4>' + esc(t.name) + '</h4><p>' + esc(t.desc) + '</p></div>';
  }).join('') || '<div class="empty">还没有收集到卡片</div>';
  const take = TAKEAWAYS[state.tools.length % TAKEAWAYS.length];
  return '<div class="card anim">'
    + '<div class="eyebrow">这一路</div>'
    + '<h1>你陪 ' + esc(state.name) + ' 走完了 ' + state.list.length + ' 个片段</h1>'
    + '<p>你给出了 ' + state.answers.length + ' 次回应，收集了 ' + state.tools.length + ' 张视角卡片。它们不是分数，是你已经放进工具箱里的东西。</p>'
    + '<div class="grid">' + cards + '</div>'
    + '<div class="rule"></div>'
    + '<div class="narr" style="border-left-color:var(--teal)"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.18em;color:var(--teal);font-weight:700">带走这一句话</p><p style="margin:0;font-size:19px;font-weight:700;color:var(--teal-d);line-height:1.6">' + esc(take) + '</p></div>'
    + '<p>写下这句话的，其实是你刚刚做过的那些选择。</p>'
    + '<div class="btns">'
    + (state.bonusDone ? '' : '<button class="btn primary" id="bonusBtn">加练一幕（+40 秒）</button>')
    + '<button class="btn ghost" id="careBtn">60 秒，用在自己身上</button>'
    + '<button class="btn plain" id="againBtn">重新开始</button>'
    + '</div></div>';
}
function viewCare(){
  return '<div class="card anim">'
    + '<div class="eyebrow">60 秒 · 用在自己身上</div>'
    + '<h2>这套视角，也适用于你</h2>'
    + '<p>康复心理学的原则不只对来访者有效。今天，请给自己三个很小的动作：</p>'
    + '<label class="check"><input type="checkbox"><span>允许自己有一件事「今天没做到」。复原不需要满分。</span></label>'
    + '<label class="check"><input type="checkbox"><span>写下今天真正做成的一件小事，哪怕只花了 10 秒。</span></label>'
    + '<label class="check"><input type="checkbox"><span>找一个「环境杠杆」：有什么是可以改的环境，而不是更用力地逼自己？</span></label>'
    + '<div class="btns"><button class="btn primary" id="careDone">完成</button><button class="btn ghost" id="backOutro">回到总结</button></div>'
    + '</div>';
}
function viewDone(){
  return '<div class="card anim">'
    + '<div class="eyebrow">收好</div>'
    + '<h2>谢谢你愿意这样陪一个人</h2>'
    + '<p>康复心理学这句话说得很好：<b>适应不只是个人的事</b>。环境、关系、社会，都在其中——包括此刻愿意学习的你。</p>'
    + '<p>如果这段体验让你想多知道一点，右上的「工具箱」里附了对应的书本章节，可以回到原书继续读。</p>'
    + '<div class="btns"><button class="btn primary" id="againBtn2">再走一遍</button><button class="btn ghost" id="openToolbox3">打开工具箱</button></div>'
    + '</div>';
}
/* ---------------- render + wire ---------------- */
function render(){
  let html = '';
  switch(state.screen){
    case 'intro': html = viewIntro(); break;
    case 'breath': html = viewBreath(); break;
    case 'scene': html = viewScene(); break;
    case 'feedback': html = viewFeedback(); break;
    case 'outro': html = viewOutro(); break;
    case 'care': html = viewCare(); break;
    case 'done': html = viewDone(); break;
  }
  stage.innerHTML = html;
  syncChrome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  wire();
}

function wire(){
  const s = state.screen;
  if (s === 'intro'){
    const b = $('startBtn'); if (b) b.onclick = () => {
      const v = ($('nameInput').value || '').trim();
      state.name = v || '阿哲';
      state.screen = 'breath'; render();
    };
    const sb = $('srcBtn'); if (sb) sb.onclick = () => openDrawer();
    const inp = $('nameInput'); if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') $('startBtn').click(); };
  }
  else if (s === 'breath'){
    const go = $('breathGo');
    if (go) go.onclick = () => { if (go.dataset.ready === '1'){ state.screen = 'scene'; render(); } else { runBreath(); } };
    const sk = $('skipBreath'); if (sk) sk.onclick = () => { state.screen = 'scene'; render(); };
  }
  else if (s === 'scene'){
    stage.querySelectorAll('.choice').forEach(btn => {
      btn.onclick = () => {
        state.choiceIndex = +btn.dataset.i;
        const sc = state.list[state.sceneIdx];
        const ch = sc.choices[state.choiceIndex];
        unlock(sc.tool);
        state.answers.push({ scene: sc.id, choice: ch.k });
        state.screen = 'feedback';
        render();
      };
    });
    const o = $('openToolbox2'); if (o) o.onclick = () => openDrawer();
  }
  else if (s === 'feedback'){
    const n = $('nextBtn');
    if (n) n.onclick = () => {
      if (state.sceneIdx >= state.list.length - 1){ state.screen = 'outro'; }
      else { state.sceneIdx++; state.choiceIndex = null; state.screen = 'scene'; }
      render();
    };
    const r = $('retryBtn');
    if (r) r.onclick = () => { state.choiceIndex = null; state.screen = 'scene'; render(); };
  }
  else if (s === 'outro'){
    const b = $('bonusBtn');
    if (b) b.onclick = () => {
      if (!state.bonusDone){ state.list.push(BONUS); state.bonusDone = true; }
      state.sceneIdx = state.list.length - 1; state.choiceIndex = null; state.screen = 'scene'; render();
    };
    const c = $('careBtn'); if (c) c.onclick = () => { state.screen = 'care'; render(); };
    const a = $('againBtn'); if (a) a.onclick = () => restart();
  }
  else if (s === 'care'){
    const d = $('careDone'); if (d) d.onclick = () => { state.screen = 'done'; render(); };
    const b = $('backOutro'); if (b) b.onclick = () => { state.screen = 'outro'; render(); };
  }
  else if (s === 'done'){
    const a = $('againBtn2'); if (a) a.onclick = () => restart();
    const o = $('openToolbox3'); if (o) o.onclick = () => openDrawer();
  }
}

function restart(){
  state.screen = 'intro'; state.sceneIdx = 0; state.choiceIndex = null;
  state.tools = []; state.list = SCENES.slice(); state.bonusDone = false; state.answers = [];
  render();
}

/* ---------------- breathing ---------------- */
let breathTimer = null;
function runBreath(){
  const orb = $('orb'), tip = $('breathTip'), go = $('breathGo');
  if (!orb || !go) return;
  go.disabled = true;
  const seq = [['in','吸气 4',4000],['hold','停留 2',2000],['out','呼气 6',6000]];
  let i = 0;
  const step = () => {
    if (i >= seq.length){
      orb.className = 'orb'; orb.textContent = '好';
      if (tip) tip.textContent = '准备好了。现在出发，去见 ' + state.name + '。';
      go.disabled = false; go.textContent = '出发'; go.dataset.ready = '1';
      return;
    }
    const cur = seq[i++];
    orb.className = 'orb ' + cur[0]; orb.textContent = cur[1];
    breathTimer = setTimeout(step, cur[2]);
  };
  step();
}

/* ---------------- drawer ---------------- */
const drawer = $('drawer'), scrim = $('scrim');
function renderDrawer(){
  const list = $('toolList');
  if (state.tools.length === 0){
    list.innerHTML = '<div class="empty">还没有卡片。<br>每做一个选择，就会收到一张。</div>';
  } else {
    list.innerHTML = state.tools.map(k => {
      const t = TOOLBOX_ALL[k];
      return '<div class="kv"><div class="n">' + t.ico + ' ' + esc(t.name) + '</div><div class="d">' + esc(t.desc) + '</div></div>';
    }).join('');
  }
  const rest = Object.keys(TOOLBOX_ALL).length - state.tools.length;
  if (rest > 0) list.innerHTML += '<div class="note" style="margin-top:12px">还有 ' + rest + ' 张卡片没有解锁。</div>';
  $('srcList').innerHTML = SOURCES.map(s => '<div class="kv"><div class="n">' + esc(s.n) + '</div><div class="d">' + esc(s.d) + '</div></div>').join('');
}
function openDrawer(){ renderDrawer(); drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden','false'); }
function closeDrawer(){ drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden','true'); }
$('openToolbox').onclick = () => openDrawer();
$('closeDrawer').onclick = () => closeDrawer();
scrim.onclick = () => closeDrawer();
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
  if (state.screen === 'scene' && /^[123]$/.test(e.key)){
    const btns = stage.querySelectorAll('.choice');
    const b = btns[+e.key - 1]; if (b) b.click();
  }
  if (e.key === 'Enter'){
    const n = $('nextBtn'); if (n && state.screen === 'feedback') n.click();
  }
});

render();
})();
