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
5. Start the Uvicorn development server:
```bash
uvicorn main:app --reload
```