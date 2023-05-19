# htu21d를 통해 온도와 습도를 측정하는 파이썬 코드

import time
import RPi.GPIO as GPIO
from adafruit_htu21d import HTU21D
import busio

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

sda = 2 # GPIO 핀 번호, sda 라고 이름이 보이는 핀
scl = 3 # GPIO 핀 번호, scl 이라고 이름이 보이는 핀
i2c = busio.I2C(scl, sda)
sensor = HTU21D(i2c) # HTU21D 장치를 제어하는 객체 리턴


def getTemperature() :
	return float(sensor.temperature) # HTU21D 장치로부터 온도 값 읽기
def getHumidity() :
	return float(sensor.relative_humidity) # HTU21D 장치로부터 습도 값 읽기

#LED 점등 관련
# LED 점등을 위한 전역 변수 선언 및 초기화
led_temperature = 5 # 핀 번호 GPIO5 의미
led_humidity = 6 # 핀 번호 GPIO6 의미

GPIO.setup(led_temperature, GPIO.OUT) # GPIO 5 번 핀을 출력 선으로 지정.
GPIO.setup(led_humidity, GPIO.OUT) # GPIO 6 번 핀을 출력 선으로 지정.

# led 번호의 핀에 onOff(0/1) 값 출력하는 함수들 - 값에따라 led 제어
def controlTemperatureLED(onOff):
	GPIO.output(led_temperature, onOff)
def controlHumidityLED(onOff):
	GPIO.output(led_humidity, onOff)
