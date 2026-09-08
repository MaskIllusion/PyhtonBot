import os


TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
DB_NAME = os.environ.get("BOT_DB_NAME", "bot_users.db")

if not TOKEN:
    raise RuntimeError(
        "TELEGRAM_BOT_TOKEN is required. Add it as an environment variable "
        "before starting the bot."
    )