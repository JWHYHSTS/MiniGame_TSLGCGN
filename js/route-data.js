(function(T){
'use strict';
const MAPS=T.CONFIG.MAPS.map(m=>({...m,title:m.name,enemies:['m'+m.id+'_a','m'+m.id+'_b'],boss:'m'+m.id+'_boss',accent:m.color,background:'assets/images/map_bg_'+m.id+'.svg'}));
  const TOWERS={
    barracks:{id:'barracks',name:'Xưởng Robot Gác',icon:'assets/images/tower_barracks.svg',icons:['assets/images/tower_barracks.svg','assets/images/tower_barracks_l2.svg','assets/images/tower_barracks_l3.svg'],cost:40,color:'#ffd66b',barracks:true,special:'Phóng robot gác đánh chặn. Mỗi robot gác khóa 1 mục tiêu.'},
    archer:{id:'archer',name:'Pháo Liên Thanh',icon:'assets/images/tower_archer.svg',icons:['assets/images/tower_archer.svg','assets/images/tower_archer_l2.svg','assets/images/tower_archer_l3.svg'],cost:55,damage:16,range:160,rate:.52,projectileSpeed:540,color:'#64e9ff',special:'Đạn tốc độ cao, ổn định.'},
    ice:{id:'ice',name:'Trạm Hơi Lạnh',icon:'assets/images/tower_ice.svg',icons:['assets/images/tower_ice.svg','assets/images/tower_ice_l2.svg','assets/images/tower_ice_l3.svg'],cost:75,damage:10,range:148,rate:.88,projectileSpeed:410,color:'#93d8ff',slow:.45,slowTime:1.8,special:'Đóng băng và làm chậm robot.'},
    magic:{id:'magic',name:'Pháo Áp Suất',icon:'assets/images/tower_magic.svg',icons:['assets/images/tower_magic.svg','assets/images/tower_magic_l2.svg','assets/images/tower_magic_l3.svg'],cost:80,damage:38,range:152,rate:1.05,projectileSpeed:440,color:'#ff69df',special:'Đạn áp suất gây sát thương lớn.'},
    tesla:{id:'tesla',name:'Tháp Tesla',icon:'assets/images/tower_tesla.svg',icons:['assets/images/tower_tesla.svg','assets/images/tower_tesla_l2.svg','assets/images/tower_tesla_l3.svg'],cost:105,damage:24,range:172,rate:.92,chain:3,color:'#c08cff',special:'Tia điện lan sang nhiều mục tiêu.'}
  };

  const TOWER_UNLOCKS={barracks:{availableFromMap:1,unlockAfterMap:0},archer:{availableFromMap:1,unlockAfterMap:0},ice:{availableFromMap:2,unlockAfterMap:1},magic:{availableFromMap:3,unlockAfterMap:2},tesla:{availableFromMap:4,unlockAfterMap:3}};
  const TOWER_UNLOCK_BY_COMPLETED_MAP={1:'ice',2:'magic',3:'tesla'};
  const TOWER_BRANCHES={
    barracks:[{id:'guardian',name:'Robot Khiên',icon:'🛡️',desc:'Robot gác bền hơn, giữ mục tiêu lâu.',mods:{soldierHp:1.35,soldierDamage:.9,respawn:1}},{id:'assault',name:'Robot Xung Kích',icon:'🚀',desc:'Robot gác đánh mạnh và tái phóng nhanh.',mods:{soldierHp:.95,soldierDamage:1.45,respawn:.78}}],
    archer:[{id:'rapid',name:'Liên Thanh Siêu Tốc',icon:'⚡',desc:'Tăng tốc độ bắn và tầm kiểm soát.',mods:{damage:1,rate:.72,range:1.08}},{id:'pierce',name:'Đạn Xuyên Giáp',icon:'🎯',desc:'Tăng sát thương và xuyên giáp.',mods:{damage:1.42,rate:1,range:1,armorPierce:.55}}],
    ice:[{id:'blizzard',name:'Bão Hơi Lạnh',icon:'❄️',desc:'Làm chậm sâu và lâu hơn.',mods:{damage:.95,rate:.9,range:1.08,slowBonus:.18,slowTime:1.45}},{id:'frostbolt',name:'Tia Đóng Băng',icon:'🧊',desc:'Tăng mạnh sát thương hơi lạnh.',mods:{damage:1.48,rate:.9,range:1}}],
    magic:[{id:'nova',name:'Áp Suất Cực Đại',icon:'💥',desc:'Năng lượng nén gây sát thương cực lớn.',mods:{damage:1.52,rate:1.06,range:.98}},{id:'arcane',name:'Pháo Tầm Xa',icon:'🌌',desc:'Bắn xa và nhanh hơn.',mods:{damage:1.1,rate:.76,range:1.22}}],
    tesla:[{id:'chain',name:'Tesla Chuỗi',icon:'⚡',desc:'Lan thêm nhiều mục tiêu.',mods:{damage:1.05,rate:.92,range:1.05,chainBonus:2}},{id:'overload',name:'Tesla Quá Tải',icon:'🌩️',desc:'Điện áp cao, bắn nhanh hơn.',mods:{damage:1.38,rate:.76,range:1}}]
  };

  const WAVE_TYPES={
    1:{id:'normal',name:'Trinh sát',icon:'🛰️',desc:'Đội hình thăm dò cân bằng.'},
    2:{id:'rush',name:'Tốc kích',icon:'💨',desc:'Robot tăng 18% tốc độ.',speedMult:1.18,spawnMult:.82},
    3:{id:'armored',name:'Thiết giáp',icon:'🛡️',desc:'Địch có thêm giáp và 10% máu.',armorBonus:2,hpMult:1.10},
    4:{id:'boss',name:'Robot chỉ huy',icon:'👑',desc:'Đợt cuối có Titan cơ khí.',hpMult:1.08,boss:true}
  };

  const BOSS_SKILLS={
    m1_boss:{id:'rage',name:'Quá Tải Động Cơ',desc:'Khi còn 60% HP, Boss tăng tốc và sát thương.'},
    m2_boss:{id:'warp',name:'Lướt Đường Ray',desc:'Khi còn 65% HP, Boss tăng tốc vượt một đoạn băng chuyền.'},
    m3_boss:{id:'shield',name:'Giáp Bánh Răng',desc:'Boss tái tạo lá chắn khi nguy cấp.'},
    m4_boss:{id:'heal',name:'Tự Sửa Chữa',desc:'Khi còn 45% HP, Boss hồi 20% máu.'},
    m5_boss:{id:'summon',name:'Triệu Hồi Robot',desc:'Boss gọi thêm hai robot hộ vệ.'},
    m6_boss:{id:'phases',name:'Titan Hai Giai Đoạn',desc:'Boss có hai giai đoạn: dựng khiên rồi gọi cận vệ.'}
  };
  const SOLDIER_ICONS=['assets/images/soldier_l1.svg','assets/images/soldier_l2.svg','assets/images/soldier_l3.svg'];

  const ENEMIES={
    m1_a:{name:'Robot Trinh Sát',icon:'assets/images/enemy_m1_a.svg',hp:62,speed:58,reward:10,armor:0,attack:10,attackRate:.9,baseDamage:1},
    m1_b:{name:'Robot Xâm Nhập',icon:'assets/images/enemy_m1_b.svg',hp:82,speed:48,reward:12,armor:1,attack:12,attackRate:.95,baseDamage:1},
    m1_boss:{name:'Đốc Công Sắt',icon:'assets/images/enemy_m1_boss.svg',hp:620,speed:30,reward:80,armor:4,attack:28,attackRate:1.05,baseDamage:20,boss:true,size:78},
    m2_a:{name:'Robot Đồng Hồ',icon:'assets/images/enemy_m2_a.svg',hp:78,speed:75,reward:12,armor:0,attack:12,attackRate:.82,baseDamage:1},
    m2_b:{name:'Thiết Giáp Đồng',icon:'assets/images/enemy_m2_b.svg',hp:112,speed:56,reward:15,armor:2,attack:15,attackRate:.95,baseDamage:1},
    m2_boss:{name:'Chúa Tể Bánh Răng',icon:'assets/images/enemy_m2_boss.svg',hp:760,speed:31,reward:90,armor:5,attack:32,attackRate:1,baseDamage:20,boss:true,size:80},
    m3_a:{name:'Robot Đường Ống',icon:'assets/images/enemy_m3_a.svg',hp:104,speed:62,reward:14,armor:2,attack:16,attackRate:.9,baseDamage:1},
    m3_b:{name:'Thiết Giáp Áp Suất',icon:'assets/images/enemy_m3_b.svg',hp:145,speed:46,reward:18,armor:4,attack:19,attackRate:1,baseDamage:2},
    m3_boss:{name:'Titan Lò Hơi',icon:'assets/images/enemy_m3_boss.svg',hp:880,speed:29,reward:100,armor:7,attack:36,attackRate:.95,baseDamage:20,boss:true,size:82},
    m4_a:{name:'Robot Đường Ray',icon:'assets/images/enemy_m4_a.svg',hp:125,speed:65,reward:16,armor:2,attack:18,attackRate:.85,baseDamage:1},
    m4_b:{name:'Xe Bọc Thép',icon:'assets/images/enemy_m4_b.svg',hp:182,speed:43,reward:21,armor:6,attack:22,attackRate:1.05,baseDamage:2},
    m4_boss:{name:'Chỉ Huy Đường Ray',icon:'assets/images/enemy_m4_boss.svg',hp:1020,speed:28,reward:110,armor:8,attack:41,attackRate:1,baseDamage:20,boss:true,size:84},
    m5_a:{name:'Robot Công Nghiệp',icon:'assets/images/enemy_m5_a.svg',hp:150,speed:67,reward:18,armor:3,attack:20,attackRate:.82,baseDamage:1},
    m5_b:{name:'Thiết Giáp Trên Không',icon:'assets/images/enemy_m5_b.svg',hp:225,speed:44,reward:24,armor:7,attack:25,attackRate:1,baseDamage:2},
    m5_boss:{name:'Bạo Chúa Tuabin',icon:'assets/images/enemy_m5_boss.svg',hp:1180,speed:28,reward:125,armor:10,attack:46,attackRate:.95,baseDamage:20,boss:true,size:86},
    m6_a:{name:'Robot Lõi Đen',icon:'assets/images/enemy_m6_a.svg',hp:185,speed:72,reward:21,armor:4,attack:23,attackRate:.78,baseDamage:1},
    m6_b:{name:'Cận Vệ Titan',icon:'assets/images/enemy_m6_b.svg',hp:275,speed:46,reward:28,armor:9,attack:29,attackRate:1,baseDamage:2},
    m6_boss:{name:'Titan Bánh Răng',icon:'assets/images/enemy_m6_boss.svg',hp:1450,speed:27,reward:150,armor:12,attack:55,attackRate:.9,baseDamage:20,boss:true,size:92}
  };

  const PATHS={
    1:[{x:-40,y:582}, {x:130,y:582}, {x:248,y:484}, {x:424,y:484}, {x:541,y:344}, {x:735,y:344}, {x:862,y:200}, {x:1034,y:200}, {x:1134,y:338}, {x:1185,y:338}],
    2:[{x:-40,y:226}, {x:155,y:226}, {x:258,y:132}, {x:430,y:132}, {x:558,y:302}, {x:730,y:302}, {x:845,y:478}, {x:1000,y:478}, {x:1106,y:612}, {x:1185,y:612}],
    3:[{x:-40,y:464}, {x:132,y:464}, {x:132,y:266}, {x:320,y:266}, {x:320,y:540}, {x:532,y:540}, {x:532,y:214}, {x:768,y:214}, {x:768,y:430}, {x:980,y:430}, {x:980,y:158}, {x:1185,y:158}],
    4:[{x:-40,y:358}, {x:126,y:358}, {x:232,y:214}, {x:422,y:214}, {x:532,y:510}, {x:746,y:510}, {x:862,y:214}, {x:1040,y:214}, {x:1126,y:358}, {x:1185,y:358}],
    5:[{x:-40,y:530}, {x:158,y:530}, {x:270,y:402}, {x:456,y:402}, {x:580,y:522}, {x:736,y:522}, {x:844,y:334}, {x:1002,y:334}, {x:1114,y:184}, {x:1185,y:184}],
    6:[{x:-40,y:156}, {x:160,y:156}, {x:280,y:320}, {x:448,y:320}, {x:548,y:162}, {x:714,y:162}, {x:836,y:396}, {x:998,y:396}, {x:1098,y:552}, {x:1185,y:552}]
  };
  const TOWER_SPOTS_BY_MAP={
    1:[{x:93,y:478}, {x:231,y:623}, {x:278,y:380}, {x:430,y:592}, {x:492,y:250}, {x:648,y:446}, {x:690,y:235}, {x:862,y:110}, {x:950,y:296}, {x:1073,y:112}, {x:1092,y:420}, {x:525,y:513}],
    2:[{x:80,y:116}, {x:220,y:316}, {x:330,y:42}, {x:484,y:363}, {x:558,y:412}, {x:682,y:198}, {x:804,y:582}, {x:914,y:382}, {x:1023,y:662}, {x:1138,y:498}, {x:553,y:136}, {x:823,y:268}],
    3:[{x:228,y:368}, {x:228,y:470}, {x:244,y:170}, {x:422,y:360}, {x:390,y:632}, {x:436,y:446}, {x:636,y:126}, {x:672,y:346}, {x:844,y:526}, {x:884,y:332}, {x:1064,y:62}, {x:1076,y:248}],
    4:[{x:92,y:246}, {x:200,y:419}, {x:336,y:118}, {x:540,y:260}, {x:500,y:600}, {x:692,y:384}, {x:790,y:130}, {x:930,y:318}, {x:1008,y:118}, {x:1098,y:450}, {x:720,y:300}, {x:620,y:604}],
    5:[{x:88,y:428}, {x:210,y:616}, {x:300,y:306}, {x:444,y:290}, {x:584,y:620}, {x:660,y:426}, {x:818,y:242}, {x:940,y:434}, {x:1058,y:106}, {x:1152,y:293}, {x:528,y:338}, {x:796,y:604}],
    6:[{x:126,y:272}, {x:206,y:80}, {x:322,y:416}, {x:449,y:416}, {x:572,y:72}, {x:674,y:286}, {x:817,y:490}, {x:910,y:298}, {x:1036,y:634}, {x:1142,y:430}, {x:540,y:354}, {x:823,y:162}]
  };


T.RouteData={MAPS,TOWERS,TOWER_UNLOCKS,TOWER_BRANCHES,WAVE_TYPES,BOSS_SKILLS,ENEMIES,SOLDIER_ICONS,PATHS,TOWER_SPOTS_BY_MAP};
})(Trig);
