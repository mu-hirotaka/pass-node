var socket = io.connect('http://localhost:3000');
socket.on('connect', function(msg) {
  console.log("connect");
});

// メッセージを受けたとき
socket.on('message', function(msg) {
  // メッセージを画面に表示する
  document.getElementById("receiveMsg").innerHTML = msg.value;
});

// メッセージを送る
function SendMsg() {
  var msg = document.getElementById("message").value;
  // メッセージを発射する
  socket.emit('message', { value: msg });
}

// 切断する 
function DisConnect() {
  // メッセージを発射する
  socket.emit('message', { value: '切断しました' });
  // socketを切断する
  socket.disconnect();
}

