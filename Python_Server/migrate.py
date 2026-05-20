import os
import shutil
from app import app, extract_face_embedding, db, User, Biometric, DATASET_PATH
from security import encrypt_face_template
import argon2

ph = argon2.PasswordHasher()

def migrate_datasets():
    """ Migrates raw dataset images safely into encrypted Biometric rows and deletes the physical files. """
    if not os.path.exists(DATASET_PATH):
        print("Dataset directory not found.")
        return

    with app.app_context():
        identities = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
        for name in identities:
            print(f"Migrating user: {name}")
            user = User.query.filter_by(username=name).first()
            if not user:
                # Create a placeholder user with disabled password login
                default_pw = ph.hash("changeme123")
                user = User(username=name, password_hash=default_pw, role='user')
                db.session.add(user)
                db.session.commit()
                print(f"  Created user record with ID {user.id}")

            person_path = os.path.join(DATASET_PATH, name)
            images = [f for f in os.listdir(person_path) if f.endswith(('.jpg', '.png', '.jpeg'))]
            
            if images:
                # Extract template from the very first image
                with open(os.path.join(person_path, images[0]), 'rb') as img_file:
                    raw_bytes = img_file.read()
                    embedding = extract_face_embedding(raw_bytes)
                    encrypted_template, nonce, encrypted_dek = encrypt_face_template(embedding)
                    
                    bio = Biometric(
                        user_id=user.id,
                        encrypted_template=encrypted_template,
                        encrypted_dek=encrypted_dek,
                        nonce=nonce,
                        is_guest=False
                    )
                    db.session.add(bio)
                    db.session.commit()
                    print(f"  Migrated and encrypted face template.")

            # Safety Delete: remove raw images
            print(f"  Deleting raw images for {name}...")
            shutil.rmtree(person_path)

        print("Migration complete. All dataset folders cleared.")

if __name__ == "__main__":
    migrate_datasets()
