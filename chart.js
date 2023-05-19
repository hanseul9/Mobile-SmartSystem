// 웹페이지에 차트를 그려주는 자바스립트 코드

var config = {
    // type 은 차트 종류 지정
    type: 'bar', /* 막대기 형태 */

    // data 는 차트에 출력될 전체 데이터 표현
    data: {
        // labels 는 배열로 데이터의 레이블들
        labels: [],

        // datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 아래는 그래프 1 개만 있는 경우
        datasets: [{
            label: '실시간 작물 길이',
            backgroundColor: 'rgb(180,255,255)',
            borderColor: 'rgb(255,198,255)',
            borderWidth: 2,
            data: [], /* 각 레이블에 해당하는 데이터 */
            fill: false /* 그래프 아래가 채워진 상태로 그려짐. */
        }]
    },

    // 차트의 속성 지정
    options: {
        responsive: false, // 크기 조절 금지
        scales: { /* x 축과 y 축 정보 */
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '시간'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '길이(cm)'
                }
            }]
        }
    }
};

var ctx = null;
var chart = null;
var LABEL_SIZE = 10; // 차트에 그려지는 데이터의 개수
var tick = 0; // 도착한 데이터의 개수임, tick 의 범위는 0 에서 99 까지만
var once = 1;

function drawChart() {
    ctx = document.getElementById('canvas').getContext('2d');
    chart = new Chart(ctx, config);
    if (once == 1) {
        once--;
        init();
    }
} // end of drawChart()

// chart 의 차트에 labels 의 크기를 LABEL_SIZE 로 만들고 0~19 까지 레이블 붙이기 - 초기화 역할
function init() {
    for (let i = 0; i < LABEL_SIZE; i++) {
        chart.data.labels[i] = i;
    }
    chart.update();
}

var count = -2; // 맨 처음 측정값은 높이로 두기 위한 변수

function addChartData(value) { // 차트 추가
    // 시,분,초를 라벨값으로 지정
    var now = new Date();
    var hour = String(now.getHours());
    var minutes = String(now.getMinutes());
    var seconds = String(now.getSeconds());
    var time = hour.concat(',', minutes, ',', seconds);

    if (count == -2) { // 처음에 측정버튼을 누르면 지면으로부터의 높이를 측정함
        height = value;
        count++;
        document.getElementById("plantLength").innerHTML = '*지면 높이 측정 완료*';
        return;
    }

    value = height - value; // 식물의 길이 = 지면으로부터의 높이 - 초음파 센서와의 거리

    if (count < 10) {
        count++;
    }

    chart.data.labels[count] = time;
    tick++; // 도착한 데이터의 개수 증가
    tick %= 100; // tick 의 범위는 0 에서 99 까지만. 100 보다 크면 다시 0 부터 시작

    let n = chart.data.datasets[0].data.length; // 현재 데이터의 개수

    if (n < LABEL_SIZE) {
        chart.data.datasets[0].data.push(value);
    } else {
        // 새 데이터 value 삽입
        chart.data.datasets[0].data.push(value);
        chart.data.datasets[0].data.shift();

        // 레이블 삽입
        chart.data.labels.shift();
    }

    chart.update();
}

window.addEventListener("load", drawChart); // load 이벤트가 발생하면 drawChart() 호출하도록 등록
