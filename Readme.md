# Backend

```
cd backend
python -m venv venv
source ./venv/Scripts/activate
python -m pip install --upgrade pip
python install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

# Frontend

```
cd frontend
npm i
npm run dev
```
