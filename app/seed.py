from app.database import SessionLocal
from app.models import Problem, TestCase, Tag

# ==========================================
# 🟢 PROBLEME EASY (8)
# ==========================================
PROBLEMS_EASY = [
    {
        "title": "Two Sum",
        "description": "Se dă un vector de numere întregi `nums` și un număr întreg `target`.\nReturnați indicii celor două numere din vector astfel încât suma lor să fie egală cu `target`.\nPuteți presupune că fiecare intrare are exact o soluție și nu puteți folosi același element de două ori. Ordinea răspunsului nu contează.",
        "difficulty": "Easy",
        "tags": ["Array", "HashMap"],
        "hint": "Folosește un dicționar pentru a stoca numerele vizitate și indexul lor. Când ești la un număr `x`, verifică dacă `target - x` există deja în dicționar.",
        "editorial": "Iterăm prin vector. Calculăm `complement = target - num`. Dacă `complement` e în map, returnăm `[map[complement], i]`. Altfel, adăugăm `num` în map.",
        "test_cases": [
            {"input_data": "[2, 7, 11, 15]\n9", "expected_output": "[0, 1]"},
            {"input_data": "[3, 2, 4]\n6", "expected_output": "[1, 2]"},
            {"input_data": "[3, 3]\n6", "expected_output": "[0, 1]"},
            {"input_data": "[1, 5, 9]\n10", "expected_output": "[0, 2]"},
            {"input_data": "[-1, -2, -3, -4, -5]\n-8", "expected_output": "[2, 4]"}
        ]
    },
    {
        "title": "Verificare Palindrom",
        "description": "Se dă un număr întreg `x`. Returnați `True` dacă `x` este un palindrom, și `False` în caz contrar.\nUn număr este palindrom dacă se citește la fel de la stânga la dreapta și de la dreapta la stânga.",
        "difficulty": "Easy",
        "tags": ["Math"],
        "hint": "Un număr negativ nu poate fi palindrom. Încearcă să inversezi numărul matematic (folosind modulo 10) și compară rezultatul cu numărul original.",
        "editorial": "Dacă x < 0, return False. Inversăm x cifră cu cifră într-o variabilă nouă `reverted`. Dacă `x == reverted`, e palindrom.",
        "test_cases": [
            {"input_data": "121", "expected_output": "True"},
            {"input_data": "-121", "expected_output": "False"},
            {"input_data": "10", "expected_output": "False"},
            {"input_data": "12321", "expected_output": "True"},
            {"input_data": "0", "expected_output": "True"}
        ]
    },
    {
        "title": "Fizz Buzz",
        "description": "Se dă un număr întreg `n`. Returnați o listă de string-uri de la 1 la `n`, unde:\n* Pentru multiplii de 3 scrieți \"Fizz\"\n* Pentru multiplii de 5 scrieți \"Buzz\"\n* Pentru multiplii de 3 și 5 scrieți \"FizzBuzz\"\n* Altfel scrieți numărul ca string.",
        "difficulty": "Easy",
        "tags": ["Math", "String"],
        "hint": "Verifică mai întâi divizibilitatea cu 15 (3 * 5), apoi cu 3, apoi cu 5.",
        "editorial": "Buclă de la 1 la n. `if i % 15 == 0: FizzBuzz` etc.",
        "test_cases": [
            {"input_data": "3", "expected_output": "['1', '2', 'Fizz']"},
            {"input_data": "5", "expected_output": "['1', '2', 'Fizz', '4', 'Buzz']"},
            {"input_data": "15", "expected_output": "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']"},
            {"input_data": "1", "expected_output": "['1']"}
        ]
    },
    {
        "title": "Inversare String",
        "description": "Scrieți o funcție care inversează un string. String-ul de intrare este dat ca o listă de caractere `s`.\nTrebuie să faceți asta modificând lista de intrare (in-place) cu memorie suplimentară O(1).",
        "difficulty": "Easy",
        "tags": ["Two Pointers", "String"],
        "hint": "Folosește doi pointeri: unul la început (left) și unul la sfârșit (right). Schimbă caracterele și mută pointerii spre centru.",
        "editorial": "While left < right: swap(s[left], s[right]); left++; right--.",
        "test_cases": [
            {"input_data": "['h','e','l','l','o']", "expected_output": "['o', 'l', 'l', 'e', 'h']"},
            {"input_data": "['H','a','n','n','a','h']", "expected_output": "['h', 'a', 'n', 'n', 'a', 'H']"},
            {"input_data": "['a']", "expected_output": "['a']"},
            {"input_data": "['A','B']", "expected_output": "['B', 'A']"}
        ]
    },
    {
        "title": "Numărul Lipsă",
        "description": "Se dă un vector `nums` care conține `n` numere distincte din intervalul `[0, n]`. Returnați singurul număr din interval care lipsește din vector.",
        "difficulty": "Easy",
        "tags": ["Array", "Math", "Bit Manipulation"],
        "hint": "Suma numerelor de la 0 la n este n*(n+1)/2. Scade suma elementelor din vector din această sumă totală.",
        "editorial": "Calculăm suma așteptată `n*(n+1)//2`. Scădem `sum(nums)`. Rezultatul e numărul lipsă.",
        "test_cases": [
            {"input_data": "[3, 0, 1]", "expected_output": "2"},
            {"input_data": "[0, 1]", "expected_output": "2"},
            {"input_data": "[9,6,4,2,3,5,7,0,1]", "expected_output": "8"},
            {"input_data": "[0]", "expected_output": "1"}
        ]
    },
    {
        "title": "Validare Paranteze",
        "description": "Se dă un string `s` care conține doar caracterele '(', ')', '{', '}', '[' și ']'. Determinați dacă string-ul este valid.\nUn string este valid dacă:\n1. Parantezele deschise sunt închise de același tip de paranteze.\n2. Parantezele sunt închise în ordinea corectă.",
        "difficulty": "Easy",
        "tags": ["Stack", "String"],
        "hint": "Folosește o stivă (stack). Când întâlnești o paranteză deschisă, pune-o în stivă. Când întâlnești una închisă, verifică dacă vârful stivei este perechea ei.",
        "editorial": "Dicționar mapare: `')':'(', ']':'[', '}':'{'`. Iterăm s. Dacă e deschisă -> push. Dacă e închisă -> pop și verificăm. La final stiva trebuie să fie goală.",
        "test_cases": [
            {"input_data": "'()'", "expected_output": "True"},
            {"input_data": "'()[]{}'", "expected_output": "True"},
            {"input_data": "'(]'", "expected_output": "False"},
            {"input_data": "'([)]'", "expected_output": "False"},
            {"input_data": "'{[]}'", "expected_output": "True"}
        ]
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "description": "Aveți un vector `prices` unde `prices[i]` este prețul unei acțiuni în ziua `i`. Vreți să maximizați profitul alegând o zi pentru a cumpăra o acțiune și o zi diferită din viitor pentru a o vinde.\nReturnați profitul maxim. Dacă nu se poate obține profit, returnați 0.",
        "difficulty": "Easy",
        "tags": ["Array", "DP"],
        "hint": "Menține prețul minim întâlnit până acum și calculează profitul potențial la fiecare pas (preț curent - minim).",
        "editorial": "`min_price = infinit`, `max_profit = 0`. For price in prices: update min_price, update max_profit = max(max_profit, price - min_price).",
        "test_cases": [
            {"input_data": "[7,1,5,3,6,4]", "expected_output": "5"},
            {"input_data": "[7,6,4,3,1]", "expected_output": "0"},
            {"input_data": "[1, 2]", "expected_output": "1"},
            {"input_data": "[2, 4, 1]", "expected_output": "2"}
        ]
    },
    {
        "title": "Single Number",
        "description": "Se dă un vector nevid de numere întregi `nums`, unde fiecare element apare de două ori, cu excepția unuia singur. Găsiți acel element unic.\nÎncercați o soluție cu complexitate liniară și memorie constantă.",
        "difficulty": "Easy",
        "tags": ["Bit Manipulation", "Array"],
        "hint": "Operația XOR (^) are proprietatea că `a ^ a = 0` și `a ^ 0 = a`.",
        "editorial": "Inițializăm `res = 0`. Facem XOR între `res` și toate numerele din vector. La final, `res` va fi numărul unic.",
        "test_cases": [
            {"input_data": "[2,2,1]", "expected_output": "1"},
            {"input_data": "[4,1,2,1,2]", "expected_output": "4"},
            {"input_data": "[1]", "expected_output": "1"},
            {"input_data": "[0, 1, 0, 1, 99]", "expected_output": "99"}
        ]
    }
]

# ==========================================
# 🟡 PROBLEME MEDIUM (8)
# ==========================================
PROBLEMS_MEDIUM = [
    {
        "title": "Cel mai lung subșir fără duplicate",
        "description": "Se dă un string `s`. Găsiți lungimea celui mai lung subșir (substring) care nu conține caractere repetate.",
        "difficulty": "Medium",
        "tags": ["Sliding Window", "HashMap"],
        "hint": "Folosește o fereastră glisantă (sliding window) și un set/dicționar pentru a ține minte caracterele din fereastra curentă.",
        "editorial": "Pointeri `start` și `end`. Dicționar `char_index`. Când întâlnim duplicat, mutăm `start` la `char_index[char] + 1`.",
        "test_cases": [
            {"input_data": "'abcabcbb'", "expected_output": "3"},
            {"input_data": "'bbbbb'", "expected_output": "1"},
            {"input_data": "'pwwkew'", "expected_output": "3"},
            {"input_data": "''", "expected_output": "0"},
            {"input_data": "'dvdf'", "expected_output": "3"}
        ]
    },
    {
        "title": "Container With Most Water",
        "description": "Se dă un vector `height` de lungime `n`. Există `n` linii verticale desenate astfel încât capetele liniei `i` sunt `(i, 0)` și `(i, height[i])`.\nGăsiți două linii care, împreună cu axa x, formează un container care conține cea mai multă apă.",
        "difficulty": "Medium",
        "tags": ["Two Pointers", "Greedy"],
        "hint": "Pornește cu doi pointeri la capetele vectorului. Calculează aria. Mută pointerul care indică înălțimea mai mică spre interior.",
        "editorial": "`left = 0`, `right = n-1`. Area = `min(h[l], h[r]) * (r-l)`. If `h[l] < h[r]`: `l++` else `r--`.",
        "test_cases": [
            {"input_data": "[1,8,6,2,5,4,8,3,7]", "expected_output": "49"},
            {"input_data": "[1,1]", "expected_output": "1"},
            {"input_data": "[4,3,2,1,4]", "expected_output": "16"},
            {"input_data": "[1,2,1]", "expected_output": "2"}
        ]
    },
    {
        "title": "3Sum",
        "description": "Se dă un vector de numere întregi `nums`. Returnați toate tripletele `[nums[i], nums[j], nums[k]]` astfel încât `i != j`, `i != k`, `j != k`, și suma lor este 0.\nSoluția nu trebuie să conțină triplete duplicate.",
        "difficulty": "Medium",
        "tags": ["Two Pointers", "Array"],
        "hint": "Sortează vectorul. Iterează cu `i` și folosește Two Pointers (`left`, `right`) pentru restul vectorului ca la problema Two Sum, dar căutând `-nums[i]`.",
        "editorial": "Sortare. For `i` in range. Dacă `nums[i] > 0` break. Skip duplicates. Two pointers `l`, `r`. Check sum. Skip duplicates internal.",
        "test_cases": [
            {"input_data": "[-1,0,1,2,-1,-4]", "expected_output": "[[-1, -1, 2], [-1, 0, 1]]"},
            {"input_data": "[0,1,1]", "expected_output": "[]"},
            {"input_data": "[0,0,0]", "expected_output": "[[0, 0, 0]]"},
            {"input_data": "[-2,0,1,1,2]", "expected_output": "[[-2, 0, 2], [-2, 1, 1]]"}
        ]
    },
    {
        "title": "Group Anagrams",
        "description": "Se dă o listă de string-uri `strs`. Grupați anagramele împreună. Puteți returna răspunsul în orice ordine.",
        "difficulty": "Medium",
        "tags": ["HashMap", "String"],
        "hint": "Două string-uri sunt anagrame dacă au aceleași caractere sortate. Folosește asta ca cheie într-un HashMap.",
        "editorial": "Map `key -> list`. Pentru fiecare cuvânt, cheia este `tuple(sorted(word))`. Adăugăm cuvântul în lista corespunzătoare cheii.",
        "test_cases": [
            {"input_data": "['eat','tea','tan','ate','nat','bat']", "expected_output": "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]"},
            {"input_data": "['']", "expected_output": "[['']]"},
            {"input_data": "['a']", "expected_output": "[['a']]"}
        ]
    },
    {
        "title": "Merge Intervals",
        "description": "Se dă o listă de intervale `intervals` unde `intervals[i] = [starti, endi]`. Uniți (merge) toate intervalele care se suprapun și returnați lista de intervale ne-suprapuse care acoperă exact aceeași distanță.",
        "difficulty": "Medium",
        "tags": ["Array", "Sorting"],
        "hint": "Sortează intervalele după timpul de start. Apoi iterează și unește-le dacă `current.end >= next.start`.",
        "editorial": "Sortare după `x[0]`. `merged = [intervals[0]]`. For interval in intervals[1:]: if interval[0] <= merged[-1][1]: merge (max end). Else: append.",
        "test_cases": [
            {"input_data": "[[1,3],[2,6],[8,10],[15,18]]", "expected_output": "[[1, 6], [8, 10], [15, 18]]"},
            {"input_data": "[[1,4],[4,5]]", "expected_output": "[[1, 5]]"},
            {"input_data": "[[1,4],[0,4]]", "expected_output": "[[0, 4]]"},
            {"input_data": "[[1,4],[2,3]]", "expected_output": "[[1, 4]]"}
        ]
    },
    {
        "title": "Maximum Subarray",
        "description": "Se dă un vector de numere întregi `nums`. Găsiți subșirul contiguu (care conține cel puțin un număr) care are suma maximă și returnați acea sumă.",
        "difficulty": "Medium",
        "tags": ["DP", "Kadane's Algorithm"],
        "hint": "Algoritmul lui Kadane: Parcurge vectorul și menține suma curentă. Dacă suma curentă devine negativă, reseteaz-o la 0.",
        "editorial": "`max_so_far = nums[0]`, `curr_max = nums[0]`. For i in 1..n: `curr_max = max(nums[i], curr_max + nums[i])`, `max_so_far = max(...)`.",
        "test_cases": [
            {"input_data": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6"},
            {"input_data": "[1]", "expected_output": "1"},
            {"input_data": "[5,4,-1,7,8]", "expected_output": "23"},
            {"input_data": "[-1, -2]", "expected_output": "-1"}
        ]
    },
    {
        "title": "Product of Array Except Self",
        "description": "Se dă un vector `nums`. Returnați un vector `answer` astfel încât `answer[i]` să fie egal cu produsul tuturor elementelor din `nums` cu excepția lui `nums[i]`.\nTrebuie să rezolvați problema în O(n) timp și fără a folosi operația de împărțire.",
        "difficulty": "Medium",
        "tags": ["Array", "Prefix Sum"],
        "hint": "Folosește doi vectori (sau două treceri): unul pentru prefix-produs (stânga->dreapta) și unul pentru sufix-produs (dreapta->stânga).",
        "editorial": "Left pass: `res[i] = res[i-1] * nums[i-1]`. Right pass: menținem variabila `right` și înmulțim `res[i]` cu ea, apoi actualizăm `right`.",
        "test_cases": [
            {"input_data": "[1,2,3,4]", "expected_output": "[24, 12, 8, 6]"},
            {"input_data": "[-1,1,0,-3,3]", "expected_output": "[0, 0, 9, 0, 0]"},
            {"input_data": "[2, 3]", "expected_output": "[3, 2]"}
        ]
    },
    {
        "title": "Longest Palindromic Substring",
        "description": "Se dă un string `s`. Returnați cel mai lung subșir palindromic din `s`.",
        "difficulty": "Medium",
        "tags": ["String", "DP", "Two Pointers"],
        "hint": "Pentru fiecare caracter, consideră-l ca fiind centrul unui palindrom și extinde-te spre stânga și dreapta cât timp caracterele sunt egale.",
        "editorial": "Iterăm `i` de la 0 la len(s). Expand Around Center pentru `(i, i)` (impar) și `(i, i+1)` (par). Păstrăm maximul.",
        "test_cases": [
            {"input_data": "'babad'", "expected_output": "'bab'"}, 
            {"input_data": "'cbbd'", "expected_output": "'bb'"},
            {"input_data": "'a'", "expected_output": "'a'"},
            {"input_data": "'ac'", "expected_output": "'a'"}
        ]
    }
]

# ==========================================
# 🔴 PROBLEME HARD (4)
# ==========================================
PROBLEMS_HARD = [
    {
        "title": "Trapping Rain Water",
        "description": "Se dă un vector `height` reprezentând înălțimile unui teren (lățimea fiecărei bare este 1). Calculați câtă apă de ploaie poate fi reținută după o ploaie.",
        "difficulty": "Hard",
        "tags": ["Two Pointers", "Stack", "DP"],
        "hint": "Pentru fiecare bară, apa reținută este `min(max_left, max_right) - height[i]`. Poți precalcula max_left și max_right sau folosi Two Pointers.",
        "editorial": "Two pointers `l`, `r`. `max_l`, `max_r`. Dacă `height[l] < height[r]`: dacă `height[l] >= max_l`: update `max_l`, else `ans += max_l - height[l]`, `l++`. Similar pentru dreapta.",
        "test_cases": [
            {"input_data": "[0,1,0,2,1,0,1,3,2,1,2,1]", "expected_output": "6"},
            {"input_data": "[4,2,0,3,2,5]", "expected_output": "9"},
            {"input_data": "[4,2,3]", "expected_output": "1"},
            {"input_data": "[1, 2]", "expected_output": "0"}
        ]
    },
    {
        "title": "Edit Distance",
        "description": "Se dau două cuvinte `word1` și `word2`. Returnați numărul minim de operații necesare pentru a converti `word1` în `word2`.\nOperațiile permise: Inserare, Ștergere, Înlocuire a unui caracter.",
        "difficulty": "Hard",
        "tags": ["DP", "String"],
        "hint": "Folosește Programare Dinamică. `dp[i][j]` = distanța dintre primele i caractere din word1 și primele j din word2.",
        "editorial": "Dacă `w1[i] == w2[j]`, `dp[i][j] = dp[i-1][j-1]`. Altfel `1 + min(insert, delete, replace)`.",
        "test_cases": [
            {"input_data": "'horse'\n'ros'", "expected_output": "3"},
            {"input_data": "'intention'\n'execution'", "expected_output": "5"},
            {"input_data": "'a'\n'b'", "expected_output": "1"},
            {"input_data": "''\n'abc'", "expected_output": "3"}
        ]
    },
    {
        "title": "Minimum Window Substring",
        "description": "Se dau două string-uri `s` și `t`. Returnați cel mai mic subșir din `s` care conține toate caracterele din `t` (inclusiv duplicatele). Dacă nu există, returnați stringul gol.",
        "difficulty": "Hard",
        "tags": ["Sliding Window", "HashMap"],
        "hint": "Sliding window cu doi pointeri. Extinde `right` până ai toate caracterele. Apoi micșorează `left` cât timp condiția rămâne validă, pentru a găsi minimul.",
        "editorial": "Frequency map pentru T. Variabilă `counter` pentru caractere rămase. Move `right`, scade din map. Dacă `counter==0`, move `left` și update min_len.",
        "test_cases": [
            {"input_data": "'ADOBECODEBANC'\n'ABC'", "expected_output": "'BANC'"},
            {"input_data": "'a'\n'a'", "expected_output": "'a'"},
            {"input_data": "'a'\n'aa'", "expected_output": "''"},
            {"input_data": "'ab'\n'a'", "expected_output": "'a'"}
        ]
    },
    {
        "title": "Median of Two Sorted Arrays",
        "description": "Se dau doi vectori sortați `nums1` și `nums2` de dimensiuni m și n. Returnați mediana celor doi vectori combinați. Complexitatea trebuie să fie O(log (m+n)).",
        "difficulty": "Hard",
        "tags": ["Binary Search", "Divide and Conquer"],
        "hint": "Nu face merge la vectori (ar fi O(m+n)). Folosește căutare binară pe vectorul mai scurt pentru a găsi partiția corectă.",
        "editorial": "Căutăm binar o partiție în `nums1` (x) și `nums2` (y) astfel încât max(LeftX, LeftY) <= min(RightX, RightY). Mediana se calculează din aceste 4 numere.",
        "test_cases": [
            {"input_data": "[1,3]\n[2]", "expected_output": "2.0"},
            {"input_data": "[1,2]\n[3,4]", "expected_output": "2.5"},
            {"input_data": "[0,0]\n[0,0]", "expected_output": "0.0"},
            {"input_data": "[]\n[1]", "expected_output": "1.0"}
        ]
    }
]

ALL_PROBLEMS = PROBLEMS_EASY + PROBLEMS_MEDIUM + PROBLEMS_HARD

def seed_db():
    print("🌱 Starting Database Seed...")
    db = SessionLocal()
    try:
        count = 0
        for p_data in ALL_PROBLEMS:
            # 1. Verificam daca problema exista deja
            exists = db.query(Problem).filter(Problem.title == p_data["title"]).first()
            if exists:
                # print(f"⚠️  Problema '{p_data['title']}' exista deja. Sarim peste.")
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