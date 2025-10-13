from flask import Flask, request, jsonify, render_template

app = Flask(__name__,template_folder='main_template')

@app.route('/')
def home():
    return render_template("main_html.html")

if __name__=="__main__":
    app.run(debug=True)