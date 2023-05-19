# 초음파 센서를 통해 거리를 측정하는 파이썬 코드

import time
import RPi.GPIO as GPIO

# 전역 변수 선언 및 초기화
trig = 20 #초음파 발생 GPIO
echo = 16 #음파의 파형이 도착했는지 확인하는 GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(trig, GPIO.OUT)
GPIO.setup(echo, GPIO.IN)
GPIO.output(trig, False)

def measureDistance():
	global trig, echo
	GPIO.output(trig, True) # 신호 1 발생
	time.sleep(0.00001) # 짧은시간후 0 으로 떨어뜨려 falling edge 를 만들기 위함
	GPIO.output(trig, False) # 신호 0 발생(falling 에지)
	while(GPIO.input(echo) == 0):
		pass
	pulse_start = time.time() # 신호 1. 초음파 발생이 시작되었음을 알림
	while(GPIO.input(echo) == 1):
		pass
	pulse_end = time.time() # 신호 0. 초음파 수신 완료를 알림
	pulse_duration = pulse_end - pulse_start
	return 340*100/2*pulse_duration
