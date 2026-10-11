globalThis.Trig = globalThis.Trig || {};
Trig.CONFIG = Object.freeze({
  VERSION:'3.1.0', TEACHER_PASSWORD:'05067379', SAVE_KEY:'mechanical-fortress-v3',
  SESSION_KEY:'mechanical-fortress-session-v3', BASE_SCORE:100,
  MAPS:[
    {id:1,name:'XƯỞNG ĐÚC',title:'Tuyến phòng thủ đầu tiên',brief:'Robot đi theo băng chuyền đến căn cứ cuối đường. Đọc bản vẽ ba cạnh để cấp năng lượng cho pháo đài.',mechanic:'Nhận biết cạnh · Đặt tháp dọc băng chuyền',color:'#ffc179',altitude:'KHU 01',count:10,crystal:'SIN',scene:'foundry'},
    {id:2,name:'THÁP ĐỒNG HỒ',title:'Bánh răng thời gian',brief:'Robot men theo băng chuyền ngoằn ngoèo giữa bánh răng. Lắp công thức để mở mạch phòng thủ.',mechanic:'Lắp tỉ số · Tuyến đường ngoằn ngoèo',color:'#79d8dd',altitude:'KHU 02',count:10,crystal:'COS',scene:'clock'},
    {id:3,name:'MẠNG ĐƯỜNG ỐNG',title:'Áp suất dưới lòng đất',brief:'Các đường ống bẻ hướng đoàn robot. Tính tỉ số để vận hành xưởng cơ khí.',mechanic:'Tính tỉ số · Đường robot gấp khúc',color:'#a8caa1',altitude:'KHU 03',count:10,crystal:'TAN',scene:'pipes'},
    {id:4,name:'ĐƯỜNG RAY THÉP',title:'Chuyến tàu nổi loạn',brief:'Robot tăng tốc trên đường ray. Ghi nhớ tinh thể 30°, 45°, 60° để cấp năng lượng.',mechanic:'Ghi nhớ giá trị · Robot tăng tốc',color:'#c6b0f1',altitude:'KHU 04',count:12,crystal:'COT',scene:'rail'},
    {id:5,name:'XƯỞNG TRÊN KHÔNG',title:'Liên kết hai mạch',brief:'Drone và robot đi theo tuyến cầu treo đến căn cứ. Nối hai góc phụ nhau để hoàn thiện phòng tuyến.',mechanic:'Nối góc phụ · Phòng thủ drone',color:'#a2d7f5',altitude:'KHU 05',count:10,crystal:'90°',scene:'skyforge'},
    {id:6,name:'THÀNH TRÌ TITAN',title:'Trái tim của Pháo đài Cơ Khí',brief:'Mười lăm đợt tấn công, năm nhóm bản vẽ. Đối đầu Titan Bánh Răng ở đợt cuối.',mechanic:'Tổng hợp 5 kỹ năng · Titan Bánh Răng',color:'#f5ad79',altitude:'KHU 06',count:15,crystal:'CORE',scene:'citadel'}
  ]
});
