# 라즈베리파이의 ip주소:8080포트로 접근하면 만들어놓은 html페이지를 보여주는 파이썬 코드

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
	return render_template('main.html')

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=8080)