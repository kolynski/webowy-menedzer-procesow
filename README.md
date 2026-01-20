# Instrukcja 1: Visual Studio Code
Instrukcja dla osób używających edytora VS Code i wbudowanego terminala (PowerShell).

## Wymagania
Zainstalowane: Git, Python, Node.js.
### Krok 1: Pobranie i Backend
Otwórz nowe okno VS Code.
Otwórz terminal (Terminal > New Terminal).
Wykonaj kolejno komendy:
1. git clone https://github.com/kolynski/webowy-menedzer-procesow.git
2. cd webowy-menedzer-procesow
3. python -m venv venv
4. .\venv\Scripts\Activate
5. pip install fastapi uvicorn psutil
6. uvicorn main:app --reload --host 0.0.0.0
### Krok 2: Frontend
Otwórz drugi terminal (kliknij ikonę + w panelu terminala).
Wpisz komendy:
1. cd webowy-menedzer-procesow
2. cd frontend
3. npm install
4. npm run dev
Kliknij z wciśniętym Ctrl w link: Network: (w moim przypadku http://192.168.1.11:5173)

# Instrukcja 2: Wiersz polecenia (CMD)
Instrukcja dla osób korzystających ze standardowej konsoli systemu Windows (CMD).

## Wymagania
Zainstalowane: Git, Python, Node.js.
### Krok 1: Pobranie i Backend
Otwórz Wiersz polecenia (CMD).
Wpisz komendy:
1. git clone https://github.com/kolynski/webowy-menedzer-procesow.git
2. cd webowy-menedzer-procesow
3. python -m venv venv
4. venv\Scripts\activate.bat
5. pip install fastapi uvicorn psutil
6. uvicorn main:app --reload --host 0.0.0.0
### Krok 2: Frontend
Otwórz nowe, osobne okno CMD.
Wejdź do folderu frontend wewnątrz pobranego projektu:
1. cd webowy-menedzer-procesow\frontend
2. npm install
3. npm run dev
Otwórz w przeglądarce link: Network: (w moim przypadku http://192.168.1.11:5173/)