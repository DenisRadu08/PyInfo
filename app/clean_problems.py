from app.database import SessionLocal
from app.models import Problem, Submission, TestCase, problem_tags

def wipe_problems():
    db = SessionLocal()
    try:
        print("🧹 Începem curățenia generală...")

        # 1. Ștergem explicit Test Cases (Copiii)
        deleted_tests = db.query(TestCase).delete()
        print(f"   🗑️  Au fost șterse {deleted_tests} teste vechi.")

        # 2. Ștergem explicit Submisiile (Copiii)
        deleted_submissions = db.query(Submission).delete()
        print(f"   🗑️  Au fost șterse {deleted_submissions} submisii vechi.")

        # 4. Ștergem Problemele (Părinții)
        deleted_problems = db.query(Problem).delete()
        print(f"   🗑️  Au fost șterse {deleted_problems} probleme.")

        db.commit()
        print("✅ CURĂȚENIE COMPLETĂ! Baza de date e gata pentru probleme noi.")
        print("   (Utilizatorii și conturile de Admin au rămas intacte)")

    except Exception as e:
        print(f"❌ Eroare la curățare: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    wipe_problems()