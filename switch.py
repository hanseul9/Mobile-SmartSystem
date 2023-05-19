# 스위치가 눌려진 상탠지 아닌지 알아내는 파이썬 코드

import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

button = 21 # 핀 번호 21
GPIO.setup(button, GPIO.IN, GPIO.PUD_DOWN) # 핀 21 을 입력으로 지정. 풀다운 효과 지정

def pushSwitch():
	btnStatus = GPIO.input(button) # 버튼 즉, 핀 21 의 디지털 값(0/1)을 읽기
	return(btnStatus)