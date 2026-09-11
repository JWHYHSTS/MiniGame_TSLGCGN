/* One public configuration file. A local teacher PIN is an interface lock, not server security. */
globalThis.Trig = globalThis.Trig || {};
Trig.CONFIG = Object.freeze({
  VERSION: '1.0.0', TEACHER_PASSWORD: '05067379', SAVE_KEY: 'trig-expedition-v1',
  SESSION_KEY: 'trig-expedition-session-v1', BASE_SCORE: 100,
  MAPS: [
    {id:1,name:'BASE CAMP',title:'Bí mật ba cạnh',brief:'Gắn dây leo. Đọc đúng hình. Mở đường lên núi.',mechanic:'Chạm cạnh · Kéo nhãn',color:'#62e5c3',altitude:'480 m',count:10,crystal:'SIN',scene:'camp'},
    {id:2,name:'FOUR TRIG GATES',title:'Bốn cánh cổng',brief:'Lắp các tỉ số để đánh thức bốn cánh cổng cổ.',mechanic:'Lắp công thức · Mở cổng',color:'#e9b666',altitude:'1.260 m',count:10,crystal:'COS',scene:'gates'},
    {id:3,name:'TRIANGLE CANYON',title:'Vực thẳm tam giác',brief:'Tính tỉ số. Dựng từng nhịp cầu vượt qua vực.',mechanic:'Tính toán · Dựng cầu',color:'#f6a778',altitude:'2.140 m',count:10,crystal:'TAN',scene:'canyon'},
    {id:4,name:'CRYSTAL TEMPLE',title:'Đền 30° – 45° – 60°',brief:'Ghi nhớ dấu ấn. Ghép tinh thể. Thắp sáng ngôi đền.',mechanic:'Ghi nhớ · Ghép tinh thể',color:'#c9a4ff',altitude:'3.050 m',count:12,crystal:'COT',scene:'temple'},
    {id:5,name:'TWIN PEAKS',title:'Hai đỉnh phụ nhau',brief:'Nối các tỉ số bằng nhau để tạo cầu ánh sáng.',mechanic:'Kết nối · Góc phụ nhau',color:'#98dcff',altitude:'4.200 m',count:10,crystal:'90°',scene:'peaks'},
    {id:6,name:'GUARDIAN OF 90°',title:'Người gác Đỉnh 90°',brief:'Phá bốn lớp khiên. Chinh phục lõi năng lượng 90°.',mechanic:'Chiến đấu · 5 giai đoạn',color:'#ffc969',altitude:'5.090 m',count:15,crystal:'CORE',scene:'boss'}
  ]
});
