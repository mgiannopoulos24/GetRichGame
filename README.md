# GetRichGame
A game similar to Richup.io




# Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Create a virtual environment:
```bash
python3 -m venv venv
```
3. Activate the virtual environment.
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```
4. Install the required packages:
```bash
pip install -r requirements.txt
```
5. Start the Django development server:
```bash
python manage.py migrate # Also creates the db.sqlite3 file
daphne -p 8000 game_backend.asgi:application # Starts the backend server
```