# 장치와 센서를 통해 외부를 모니 링하고 값에 따라 제어하는 파이썬 코드

# publisher
import time
import paho.mqtt.client as mqtt
import circuit # 초음파 센서 입력 모듈 import
import htu21d #온습도 모듈 import
import mcp3202 #조도 모듈 import
import camera # 카메라 사진 보내기
import pygame # 알람 출력관련 모듈 import
import switch # 스위치 모듈 import

pygame.mixer.init()#mixer 모듈 초기화
player = pygame.mixer.Sound("alarm.mp3") # 음악 로드
flag = False # True 이면 "action" 메시지를 수신하였음을 나타냄
cameraEx = False # 감시 해제 변수

def on_connect(client, userdata, flag, rc):
#웹페이지에서 보내는 message 를 받기위해 topic 들 subscribe
	client.subscribe('led_temperature', qos = 0)
	client.subscribe('led_humidity' , qos = 0)
	client.subscribe('led_light', qos = 0)
	client.subscribe("facerecognition", qos = 0)
	client.subscribe("facerecognition_unsubscribe", qos = 0)



def on_message(client, userdata, msg) :
	global flag
	global cameraEx

	# html 에서 감시시작 버튼을 누르면 날아오는 메세지
	if(msg.topic == 'facerecognition'):
		command = msg.payload.decode("utf-8")
		if command == "action":
			cameraEx = True
			flag = True

	else:
		topic = str(msg.topic)
		msg = int(msg.payload); # msg 는 0 또는 1 의 정수
		
		# msg 가 0 이면 led off, 1 이면 led on
		if(topic == 'led_temperature'):
			htu21d.controlTemperatureLED(msg)
		elif(topic == 'led_humidity'):
			htu21d.controlHumidityLED(msg)
		elif(topic == 'led_light'):
			mcp3202.controlLightLED(msg)

broker_ip = "localhost" # 현재 이 컴퓨터를 브로커로 설정

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker_ip, 1883)
client.loop_start()


while(True):
	distance = circuit.measureDistance() #길이 측정
	client.publish("ultrasonic", distance, qos=0) #측정한 길이를 발행
	temperature = htu21d.getTemperature() #온도 측정
	client.publish("temperature", temperature, qos=0) #측정한 온도 발행
	humidity = htu21d.getHumidity() # 습도 측정
	client.publish("humidity", humidity, qos=0) #측정한 습도 발해
	light = mcp3202.getLight() #조도 측정
	client.publish("light", light, qos=0) #측정한 조도 발행



	if flag==True : # "action" 메시지 수신. 사진 촬영
		imageFileName = camera.takePicture() # 카메라 사진 촬영
		# *.jpg 에서 *을 알아냄. *이 100000000 밑이면 검출된 경우로 판단
		# (camera.py 에서 검출 여부에 따라 조작하여 저장)
		temp=imageFileName.split('static/')
		temp=temp[1].split('.jpg')
		temp=temp[1].split('.jpg')

		if( int(temp[0]) < 100000000 or cameraEx == True): #검출된 경우 또는 감시 해제한 경우
			client.publish("image_find", imageFileName, qos=0)
			if(cameraEx == False): #검출된 경우
				while True: # 스위치를 누르기 전까지 알람이 울림
					player.play()
					if switch.pushSwitch() == 1:
						break;
			camerEx = False
		elif( int(temp[0]) > 100000000 ): #검출되지 않은 경우
			client.publish("image", imageFileName, qos=0)
	time.sleep(0.2) 




client.loop_stop()
client.disconnect()
