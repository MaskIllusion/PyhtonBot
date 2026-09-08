# Registration Bot

A small Telegram registration bot with a local SQLite database and a companion
web dashboard in `artifacts/web`.

## Run the Telegram bot

1. Create a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set the bot token as an environment variable. Never commit the real token:

   ```bash
   export TELEGRAM_BOT_TOKEN="your-token-from-botfather"
   ```

4. Start the bot:

   ```bash
   python bot/app.py
   ```

The bot supports `/start`, `/users`, and `/me`. User records are stored in
`bot_users.db`, which is ignored by Git.

## Dashboard

The web dashboard is a local-first registration control room. It includes a
searchable user directory, user details, registration summaries, setup guidance,
and local persistence in the browser. Its source lives in `artifacts/web`.

## Security

The Telegram token must stay in an environment variable or a secrets manager.
If a real token was ever posted publicly, revoke it in BotFather and create a
replacement before running the bot.