from app.database import SessionLocal
from app.models import Problem, TestCase, Tag

# ==============================================================================
# LISTA CELOR 20 DE PROBLEME (8 Easy, 8 Medium, 4 Hard)
# ==============================================================================

ALL_PROBLEMS = [
    # --- EASY (1-8) ---
    {
        "title": "Suma a Două Numere",
        "description": (
            "Scrieți un program care citește două numere întregi și afișează suma lor.\n\n"
            "**Instrucțiuni:**\n"
            "Datele se citesc de pe două linii separate.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "5\n"
            "10\n"
            "Output:\n"
            "15"
        ),
        "difficulty": "Easy",
        "tags": ["Math", "Basics"],
        "hint": "Folosește funcția `input()` de două ori și convertește rezultatul la `int`.",
        "editorial": "a = int(input()); b = int(input()); print(a + b)",
        "test_cases": [
            {"input_data": "3\n5", "expected_output": "8"},
            {"input_data": "10\n-2", "expected_output": "8"},
            {"input_data": "0\n0", "expected_output": "0"}
        ]
    },
    {
        "title": "Par sau Impar",
        "description": (
            "Se dă un număr întreg `n`. Afișați `True` dacă numărul este par și `False` dacă este impar.\n\n"
            "**Instrucțiuni:**\n"
            "Citiți un singur număr de la tastatură.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "4\n"
            "Output:\n"
            "True"
        ),
        "difficulty": "Easy",
        "tags": ["Math", "Logic"],
        "hint": "Un număr este par dacă restul împărțirii la 2 este 0 (n % 2 == 0).",
        "editorial": "n = int(input()); print(n % 2 == 0)",
        "test_cases": [
            {"input_data": "2", "expected_output": "True"},
            {"input_data": "3", "expected_output": "False"},
            {"input_data": "0", "expected_output": "True"}
        ]
    },
    {
        "title": "Maximul din Listă",
        "description": (
            "Se dă o listă de numere întregi. Găsiți și afișați cel mai mare număr din listă.\n\n"
            "**Instrucțiuni:**\n"
            "Inputul este o listă Python validă. Folosiți `nums = eval(input())`.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[1, 5, 3, 9, 2]\n"
            "Output:\n"
            "9"
        ),
        "difficulty": "Easy",
        "tags": ["Array"],
        "hint": "Poți folosi funcția `max()` din Python sau un loop.",
        "editorial": "nums = eval(input()); print(max(nums))",
        "test_cases": [
            {"input_data": "[1, 2, 3]", "expected_output": "3"},
            {"input_data": "[-5, -1, -10]", "expected_output": "-1"},
            {"input_data": "[100]", "expected_output": "100"}
        ]
    },
    {
        "title": "Factorial",
        "description": (
            "Calculați factorialul unui număr `n` (n!). Factorialul lui n este produsul tuturor numerelor de la 1 la n.\n\n"
            "**Instrucțiuni:**\n"
            "Citiți n cu `n = int(input())`.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "5\n"
            "Output:\n"
            "120"
        ),
        "difficulty": "Easy",
        "tags": ["Math", "Loop"],
        "hint": "Poți folosi un loop `for` sau recursivitate. 5! = 1*2*3*4*5.",
        "editorial": "import math; n = int(input()); print(math.factorial(n))",
        "test_cases": [
            {"input_data": "5", "expected_output": "120"},
            {"input_data": "3", "expected_output": "6"},
            {"input_data": "0", "expected_output": "1"}
        ]
    },
    {
        "title": "Inversare String",
        "description": (
            "Se dă un text. Afișați textul inversat.\n\n"
            "**Instrucțiuni:**\n"
            "Citiți textul cu `text = input()`.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "python\n"
            "Output:\n"
            "nohtyp"
        ),
        "difficulty": "Easy",
        "tags": ["String"],
        "hint": "În Python poți inversa un string folosind slicing: `text[::-1]`.",
        "editorial": "print(input()[::-1])",
        "test_cases": [
            {"input_data": "abc", "expected_output": "cba"},
            {"input_data": "hello world", "expected_output": "dlrow olleh"},
            {"input_data": "a", "expected_output": "a"}
        ]
    },
    {
        "title": "Numărare Vocale",
        "description": (
            "Se dă un string. Afișați numărul de vocale (a, e, i, o, u) din el (indiferent dacă sunt mari sau mici).\n\n"
            "**Instrucțiuni:**\n"
            "Citiți string-ul de la tastatură.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "Salutare\n"
            "Output:\n"
            "4"
        ),
        "difficulty": "Easy",
        "tags": ["String", "Logic"],
        "hint": "Iterează prin caractere și verifică dacă `char.lower() in 'aeiou'`.",
        "editorial": "s = input().lower(); print(sum(1 for c in s if c in 'aeiou'))",
        "test_cases": [
            {"input_data": "Ana are mere", "expected_output": "6"},
            {"input_data": "xyz", "expected_output": "0"},
            {"input_data": "AEIOU", "expected_output": "5"}
        ]
    },
    {
        "title": "Palindrom",
        "description": (
            "Verificați dacă un string dat este palindrom (se citește la fel și invers). Afișați `True` sau `False`.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "radar\n"
            "Output:\n"
            "True"
        ),
        "difficulty": "Easy",
        "tags": ["String"],
        "hint": "Compară string-ul cu inversul său.",
        "editorial": "s = input(); print(s == s[::-1])",
        "test_cases": [
            {"input_data": "radar", "expected_output": "True"},
            {"input_data": "python", "expected_output": "False"},
            {"input_data": "ana", "expected_output": "True"}
        ]
    },
    {
        "title": "Al N-lea număr Fibonacci",
        "description": (
            "Afișați al n-lea număr din șirul lui Fibonacci, unde F(0)=0, F(1)=1 și F(n)=F(n-1)+F(n-2).\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "6\n"
            "Output:\n"
            "8"
        ),
        "difficulty": "Easy",
        "tags": ["Math", "Recursion"],
        "hint": "Poți folosi recursivitate sau o abordare iterativă pentru eficiență.",
        "editorial": "Iterativ: a,b=0,1; loop n times; a,b=b,a+b; print(a)",
        "test_cases": [
            {"input_data": "0", "expected_output": "0"},
            {"input_data": "1", "expected_output": "1"},
            {"input_data": "6", "expected_output": "8"},
            {"input_data": "10", "expected_output": "55"}
        ]
    },

    # --- MEDIUM (9-16) ---
    {
        "title": "Two Sum",
        "description": (
            "Se dă o listă de numere și o țintă (target). Afișați indicii celor două numere care adunate dau ținta.\n"
            "Inputul este pe două linii: prima linie lista, a doua linie ținta.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[2, 7, 11, 15]\n"
            "9\n"
            "Output:\n"
            "[0, 1]"
        ),
        "difficulty": "Medium",
        "tags": ["Array", "HashMap"],
        "hint": "Folosește un dicționar pentru a reține {valoare: index}.",
        "editorial": "Iterăm lista. Dacă target - număr există în map, returnăm indecșii.",
        "test_cases": [
            {"input_data": "[2, 7, 11, 15]\n9", "expected_output": "[0, 1]"},
            {"input_data": "[3, 2, 4]\n6", "expected_output": "[1, 2]"},
            {"input_data": "[3, 3]\n6", "expected_output": "[0, 1]"}
        ]
    },
    {
        "title": "Fizz Buzz Avansat",
        "description": (
            "Se dă `n`. Afișați o listă cu numerele de la 1 la n, dar înlocuiți multiplii de 3 cu 'Fizz', de 5 cu 'Buzz' și de ambele cu 'FizzBuzz'.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "5\n"
            "Output:\n"
            "['1', '2', 'Fizz', '4', 'Buzz']"
        ),
        "difficulty": "Medium",
        "tags": ["Math", "String"],
        "hint": "Verifică divizibilitatea cu 15 mai întâi.",
        "editorial": "List comprehension sau loop.",
        "test_cases": [
            {"input_data": "3", "expected_output": "['1', '2', 'Fizz']"},
            {"input_data": "5", "expected_output": "['1', '2', 'Fizz', '4', 'Buzz']"},
            {"input_data": "15", "expected_output": "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']"}
        ]
    },
    {
        "title": "Valid Parentheses",
        "description": (
            "Verificați dacă un șir de paranteze '()[]{}' este valid (închis corect și în ordine).\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "'()[]{}'\n"
            "Output:\n"
            "True"
        ),
        "difficulty": "Medium",
        "tags": ["Stack"],
        "hint": "Folosește o stivă (stack). Adaugă deschise, scoate când găsești închise.",
        "editorial": "Stack pentru deschise. La închise verificăm vârful stivei.",
        "test_cases": [
            {"input_data": "'()'", "expected_output": "True"},
            {"input_data": "'([)]'", "expected_output": "False"},
            {"input_data": "'{[]}'", "expected_output": "True"}
        ]
    },
    {
        "title": "Eliminare Duplicate",
        "description": (
            "Se dă o listă de numere. Returnați lista sortată fără duplicate.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[1, 2, 2, 3]\n"
            "Output:\n"
            "[1, 2, 3]"
        ),
        "difficulty": "Medium",
        "tags": ["Array", "Sorting"],
        "hint": "Transformă lista în Set și înapoi în Listă, apoi sortează.",
        "editorial": "print(sorted(list(set(eval(input())))))",
        "test_cases": [
            {"input_data": "[1, 2, 2, 3]", "expected_output": "[1, 2, 3]"},
            {"input_data": "[4, 4, 4]", "expected_output": "[4]"},
            {"input_data": "[3, 1, 2, 1]", "expected_output": "[1, 2, 3]"}
        ]
    },
    {
        "title": "Numărul Lipsă (Medium)",
        "description": (
            "Într-o listă de la 0 la n lipsește un singur număr. Găsiți-l.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[3, 0, 1]\n"
            "Output:\n"
            "2"
        ),
        "difficulty": "Medium",
        "tags": ["Math", "Array"],
        "hint": "Suma așteptată (n*(n+1)/2) minus suma actuală.",
        "editorial": "n = len(nums); expected = n*(n+1)//2; print(expected - sum(nums))",
        "test_cases": [
            {"input_data": "[3, 0, 1]", "expected_output": "2"},
            {"input_data": "[0, 1]", "expected_output": "2"},
            {"input_data": "[0]", "expected_output": "1"}
        ]
    },
    {
        "title": "Merge Intervals",
        "description": (
            "Se dă o listă de intervale. Uniți toate intervalele care se suprapun.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[[1,3],[2,6],[8,10],[15,18]]\n"
            "Output:\n"
            "[[1, 6], [8, 10], [15, 18]]"
        ),
        "difficulty": "Medium",
        "tags": ["Sorting", "Array"],
        "hint": "Sortează intervalele după start. Iterează și unește dacă se suprapun.",
        "editorial": "Sortare. Merge logic: if current.start <= last.end, extend last.end.",
        "test_cases": [
            {"input_data": "[[1,3],[2,6],[8,10],[15,18]]", "expected_output": "[[1, 6], [8, 10], [15, 18]]"},
            {"input_data": "[[1,4],[4,5]]", "expected_output": "[[1, 5]]"}
        ]
    },
    {
        "title": "Anagram Check",
        "description": (
            "Se dau două cuvinte. Verificați dacă sunt anagrame (au aceleași litere).\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "'ascult'\n"
            "'sculat'\n"
            "Output:\n"
            "True"
        ),
        "difficulty": "Medium",
        "tags": ["String", "Sorting"],
        "hint": "Sortează caracterele ambelor cuvinte și compară.",
        "editorial": "sorted(s1) == sorted(s2)",
        "test_cases": [
            {"input_data": "'ascult'\n'sculat'", "expected_output": "True"},
            {"input_data": "'rat'\n'car'", "expected_output": "False"},
            {"input_data": "'a'\n'a'", "expected_output": "True"}
        ]
    },
    {
        "title": "Produs Array Fără Sine",
        "description": (
            "Se dă un vector. Returnați un vector unde fiecare element este produsul tuturor celorlalte elemente, exceptând pe el însuși.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[1, 2, 3, 4]\n"
            "Output:\n"
            "[24, 12, 8, 6]"
        ),
        "difficulty": "Medium",
        "tags": ["Array", "Prefix Sum"],
        "hint": "Calculează produs prefix și produs sufix.",
        "editorial": "Două treceri: stânga->dreapta și dreapta->stânga.",
        "test_cases": [
            {"input_data": "[1, 2, 3, 4]", "expected_output": "[24, 12, 8, 6]"},
            {"input_data": "[-1, 1, 0, -3, 3]", "expected_output": "[0, 0, 9, 0, 0]"}
        ]
    },

    # --- HARD (17-20) ---
    {
        "title": "Trapping Rain Water",
        "description": (
            "Se dă un vector de înălțimi (harta unui relief). Calculați câtă apă de ploaie poate fi reținută între bare.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[0,1,0,2,1,0,1,3,2,1,2,1]\n"
            "Output:\n"
            "6"
        ),
        "difficulty": "Hard",
        "tags": ["Two Pointers", "DP"],
        "hint": "Pentru fiecare poziție, apa reținută este min(max_stanga, max_dreapta) - inaltime.",
        "editorial": "Algoritm Two Pointers cu complexitate O(n).",
        "test_cases": [
            {"input_data": "[0,1,0,2,1,0,1,3,2,1,2,1]", "expected_output": "6"},
            {"input_data": "[4,2,0,3,2,5]", "expected_output": "9"}
        ]
    },
    {
        "title": "Median of Two Sorted Arrays",
        "description": (
            "Se dau doi vectori deja sortați. Găsiți mediana celor doi vectori combinați. Soluția trebuie să fie eficientă.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[1, 3]\n"
            "[2]\n"
            "Output:\n"
            "2.0"
        ),
        "difficulty": "Hard",
        "tags": ["Binary Search"],
        "hint": "Nu uni listele! Folosește Binary Search pe vectorul mai scurt.",
        "editorial": "Binary search pe partiții.",
        "test_cases": [
            {"input_data": "[1, 3]\n[2]", "expected_output": "2.0"},
            {"input_data": "[1, 2]\n[3, 4]", "expected_output": "2.5"}
        ]
    },
    {
        "title": "Edit Distance",
        "description": (
            "Se dau două cuvinte. Aflați numărul minim de operații (inserare, ștergere, înlocuire) pentru a transforma primul cuvânt în al doilea.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "'horse'\n"
            "'ros'\n"
            "Output:\n"
            "3"
        ),
        "difficulty": "Hard",
        "tags": ["Dynamic Programming"],
        "hint": "Folosește o matrice DP unde dp[i][j] este distanța dintre primele i și primele j caractere.",
        "editorial": "Dacă caracterele sunt egale, dp[i][j] = dp[i-1][j-1]. Altfel 1 + min(insert, delete, replace).",
        "test_cases": [
            {"input_data": "'horse'\n'ros'", "expected_output": "3"},
            {"input_data": "'intention'\n'execution'", "expected_output": "5"}
        ]
    },
    {
        "title": "Cel mai lung șir consecutiv",
        "description": (
            "Dat fiind un vector de numere nesortat, găsiți lungimea celei mai lungi secvențe de numere consecutive.\n\n"
            "**Exemplu:**\n"
            "Input:\n"
            "[100, 4, 200, 1, 3, 2]\n"
            "Output:\n"
            "4\n"
            "(Explicație: secvența este [1, 2, 3, 4])"
        ),
        "difficulty": "Hard",
        "tags": ["HashMap", "Union Find"],
        "hint": "Pune toate numerele într-un Set pentru acces O(1). Verifică doar începuturile de secvență.",
        "editorial": "Set(nums). For n in set: if n-1 not in set, start counting sequence.",
        "test_cases": [
            {"input_data": "[100, 4, 200, 1, 3, 2]", "expected_output": "4"},
            {"input_data": "[0,3,7,2,5,8,4,6,0,1]", "expected_output": "9"}
        ]
    }
]

def seed_db():
    print("🌱 Starting Database Seed...")
    db = SessionLocal()
    try:
        count = 0
        for p_data in ALL_PROBLEMS:
            # 1. Verificam daca problema exista deja
            exists = db.query(Problem).filter(Problem.title == p_data["title"]).first()
            if exists:
                continue

            print(f"➕ Adding: {p_data['title']} ({p_data['difficulty']})")
            
            # 2. Cream problema
            new_prob = Problem(
                title=p_data["title"],
                description=p_data["description"],
                difficulty=p_data["difficulty"],
                hint=p_data.get("hint"),
                editorial=p_data.get("editorial")
            )
            
            # 3. Adaugam Tag-uri
            for tag_name in p_data["tags"]:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                new_prob.tags.append(tag)
            
            db.add(new_prob)
            db.commit() # Commit ca sa avem ID-ul problemei
            
            # 4. Adaugam Test Cases
            for tc in p_data["test_cases"]:
                new_tc = TestCase(
                    input_data=tc["input_data"],
                    expected_output=tc["expected_output"],
                    problem_id=new_prob.id
                )
                db.add(new_tc)
            
            db.commit()
            count += 1

        print(f"✅ GATA! Au fost adaugate {count} probleme noi.")

    except Exception as e:
        print(f"❌ Eroare la seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()