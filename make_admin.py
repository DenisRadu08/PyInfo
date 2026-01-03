import sqlite3

# Configurare
DB_PATH = "sql_app.db"  # Calea catre baza de date
TARGET_EMAIL = "denis@student.upt.ro" # <--- PUNE EMAILUL TAU AICI

def promote_to_admin():
    try:
        # Ne conectam la baza de date
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Verificam daca userul exista
        cursor.execute("SELECT id, username, is_admin FROM users WHERE email = ?", (TARGET_EMAIL,))
        user = cursor.fetchone()

        if not user:
            print(f"❌ Eroare: Userul cu emailul '{TARGET_EMAIL}' nu a fost gasit!")
            print("   -> Asigura-te ca te-ai inregistrat intai pe site.")
            return

        user_id, username, is_admin = user
        
        if is_admin:
            print(f"⚠️ Userul '{username}' este deja ADMIN.")
        else:
            # Il facem admin (is_admin = 1)
            cursor.execute("UPDATE users SET is_admin = 1 WHERE email = ?", (TARGET_EMAIL,))
            conn.commit()
            print(f"✅ Succes! Userul '{username}' (ID: {user_id}) este acum ADMIN.")

    except sqlite3.OperationalError:
        print(f"❌ Eroare: Nu gasesc baza de date la '{DB_PATH}'.")
        print("   -> Asigura-te ca rulezi scriptul din folderul 'backend'!")
    except Exception as e:
        print(f"❌ A aparut o eroare: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    promote_to_admin()