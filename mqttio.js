//웹페이지의 접속/접속 해제를 담당하는 역할을 한다. 또한 웹페이지에서 센서와 장치들을 제어하기 위해 요구한 토픽들의 subscribe/unsubscribe, 또는 라즈베리파이로 publish하는 역할을 한다.

var port = 9001; // mosquitto 의 디폴트 웹 포트
var client = null; // null 이면 연결되지 않았음

function startConnect() { // 접속을 시도하는 함수
    clientID = "clientID-" + parseInt(Math.random() * 100); // 랜덤한 사용자 ID 생성

    // 사용자가 입력한 브로커의 IP 주소와 포트 번호 알아내기
    broker = document.getElementById("broker").value; // 브로커의 IP 주소

    // id 가 message 인 DIV 객체에 브로커의 IP 와 포트 번호 출력

    // MQTT 메시지 전송 기능을 모두 가진 Paho client 객체 생성
    client = new Paho.MQTT.Client(broker, Number(port), clientID);

    // client 객체에 콜백 함수 등록
    client.onConnectionLost = onConnectionLost; // 접속이 끊어졌을 때 실행되는 함수 등록
    client.onMessageArrived = onMessageArrived; // 메시지가 도착하였을 때 실행되는 함수 등록

    // 브로커에 접속. 매개변수는 객체 {onSuccess : onConnect}로서, 객체의 프로퍼틴느 onSuccess 이고 그 값이 onConnect.
    // 접속에 성공하면 onConnect 함수를 실행하라는 지시
    client.connect({
        onSuccess: onConnect,
    });
}

var isConnected = false;

function onConnect() { // 브로커로의 접속이 성공할 때 호출되는 함수
    isConnected = true;
    document.getElementById("messages_subscribe").innerHTML += '<span>Connected</span><br/>';
}

var topicSave;

function subscribe(topic) {
    if (client == null) return;
    if (isConnected != true) {
        topicSave = topic;
        window.setTimeout("subscribe(topicSave)", 500);
        return;
    }

    // 토픽으로 subscribe 하고 있음을 id 가 message 인 DIV 에 출력
    document.getElementById("messages_subscribe").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';
    client.subscribe(topic); // 브로커에 subscribe
}

function publish(topic, msg) {
    if (client == null) return; // 연결되지 않았음
    client.send(topic, msg, 0, false);
}

function unsubscribe(topic) {
    if (client == null || isConnected != true) return;

    // 토픽으로 subscribe 하고 있음을 id 가 message 인 DIV 에 출력
    document.getElementById("messages_unsubscribe").innerHTML += '<span>Unsubscribing to: ' + topic + '</span><br/>';
    client.unsubscribe(topic, null); // 브로커에 subscribe
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // 매개변수인 responseObject 는 응답 패킷의 정보를 담은 객체
    document.getElementById("messages_unsubscribe").innerHTML += '<span>오류 : 접속 >끊어짐</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages_unsubscribe").innerHTML += '<span>오류 : ' + responseObject.errorMessage + '</span><br/>';
    }
}

var showTemp = 0;
var showHumid = 0;
var showLight = 0;

function show(topic, yes) {
    // html 에서 넘어온 yes 값에 따라 온습도,조도를 확인할 수 있는 조건으로 만들어줌
    yes = parseInt(yes);
    if (topic == 'temperature') {
        showTemp = yes;
    } else if (topic == 'humidity') {
        showHumid = yes;
    } else if (topic == 'light') {
        showLight = yes;
    }

    if (yes == 0) { // div 를 빠져나간 경우
        if (topic == 'temperature') {
            document.getElementById("tempMessage").innerHTML = '<br><br><br>온도확인';
        } else if (topic == 'humidity') {
            document.getElementById("humidMessage").innerHTML = '<br><br><br>습도확인';
        } else if (topic == 'light') {
            document.getElementById("lightMessage").innerHTML = '<br><br><br>조도확인';
        }
    }
}

var showMsg = null;
var click = false; // 감시 카메라 관련 감시중인 상태인지 아닌지.

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg 는 도착한 MQTT 메시지를 담고 있는 객체
    showMsg = Number(msg.payloadString);

    if (msg.destinationName == 'ultrasonic') {
        addChartData(parseFloat(msg.payloadString));
        unsubscribe('ultrasonic');
    }

    // 도착한 메세지의 destinationName 에 따라 led 제어
    // div 위에 올렸는지 아닌지에 따라 출력 여부 결정
    else if (msg.destinationName == 'temperature') {
        if (showMsg >= 30) {
            publish('led_temperature', '1');
        } else {
            publish('led_temperature', '0');
        }

        if (showTemp == 1) { // 해당 div 위에 커서를 올린 경우
            showMsg = showMsg.toFixed(5) + '℃';
            document.getElementById("tempMessage").innerHTML = '<br><br><br>' + showMsg;
        }
    } else if (msg.destinationName == 'humidity') {
        if (showMsg >= 45) {
            publish('led_humidity', '1');
        } else {
            publish('led_humidity', '0');
        }

        if (showHumid == 1) {
            showMsg = showMsg.toFixed(5) + '%';
            document.getElementById("humidMessage").innerHTML = '<br><br><br>' + showMsg;
        }
    } else if (msg.destinationName == 'light') {
        if (showMsg <= 400) {
            publish('led_light', '1');
        } else {
            publish('led_light', '0');
        }

        if (showLight == 1) {
            document.getElementById("lightMessage").innerHTML = '<br><br><br>' + showMsg;
        }
    } else if (msg.destinationName == 'image') {
        drawImage(msg.payloadString);
    } else if (msg.destinationName == 'image_find') {
        drawImage(msg.payloadString);

        // 침입자 발견시 + 감시 해제시 unsubscribe 하여 더 이상 촬영하지 않음
        if (imageunsubscribed) {
            unsubscribe('image');
            unsubscribe('image_find');
        }
    }
}

// disconnection 버튼이 선택되었을 때 호출되는 함수
function startDisconnect() {
    client.disconnect(); // 브로커에 접속 해제
    document.getElementById("messages_unsubscribe").innerHTML += '<span>Disconnected</span><br/>';
}

// 관찰 시작 버튼을 누르면 sunbscribe, 관찰 중지 버튼을 누르면 unsubscribe
function startWatch() {
    subscribe('temperature');
    subscribe('humidity');
    subscribe('light');
}

function stopWatch() {
    unsubscribe('temperature');
    unsubscribe('humidity');
    unsubscribe('light');
}
