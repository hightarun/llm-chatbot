python -m venv venv

source ./venv/Scripts/activate

python install -r requirements.txt

uvicorn app.main:app --reload --port 8000
