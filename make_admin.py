from app.database import SessionLocal
from app.models import User

# 1. Conectare la baza de date
db = SessionLocal()

# 2. Cauta utilizatorul tau (MODIFICA EMAILUL DACA E CAZUL)
my_email = "denisradu04dr04@yahoo.com"
user = db.query(User).filter(User.email == my_email).first()

if user:
    # 3. Promoveaza-l
    user.is_admin = True
    db.commit()
    print(f"Succes! {user.email} este acum ADMIN (si Super Admin). 👑")
else:
    print(f"Eroare: Utilizatorul {my_email} nu a fost gasit. Ai creat contul?")

db.close()