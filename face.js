//카메라 감시시작, 감시 해제버튼을 누르면 호출되는 함수들이 구현된 자바스 립트 코드

// 전역 변수 선언
var canvas;
var context;
var img;

// load 이벤트 리스너 등록. 웹페이지가 로딩된 후 실행
window.addEventListener("load", function() {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    img = new Image();

    img.onload = function() {
        context.drawImage(img, 0, 0); // (0,0) 위치에 img 의 크기로 그리기
    }
});

// drawImage()는 "image' 토픽이 도착하였을 때 onMessageArrived()에 의해 호출된다.
function drawImage(imgUrl) { // imgUrl 은 이미지의 url
    img.src = imgUrl; // img.onload 에 등록된 코드에 의해 그려짐
}

function recognizeTrue() {
    // 토픽 image, image_find 등록
    subscribe('image');
    subscribe('image_find');
    publish('facerecognition', 'action'); // 토픽: facerecognition, action 메시지 전송
}

function recognizeFalse() {
    // 토픽 image, image_find 해제
    unsubscribe('image');
    unsubscribe('image_find');
    publish('facerecognition_unsubscribe', 'action'); // 토픽: facerecognition_unsubscribe, action 메시지 전송
}
