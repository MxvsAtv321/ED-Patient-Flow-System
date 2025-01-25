import secrets

def generate_keys():
    # Generate two different secure random strings
    secret_key = secrets.token_urlsafe(32)
    jwt_secret_key = secrets.token_urlsafe(32)

    # Print with clear labels
    print("\nGenerated Security Keys:")
    print("-----------------------")
    print(f"SECRET_KEY={secret_key}")
    print(f"JWT_SECRET_KEY={jwt_secret_key}")
    print("\nCopy these values to your .env file!")
    print("-----------------------\n")

if __name__ == "__main__":
    generate_keys()