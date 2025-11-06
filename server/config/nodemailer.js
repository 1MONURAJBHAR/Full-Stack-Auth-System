import nodemailer from "nodemailer";
import dotenv from "dotenv";

//  Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true if port is 465, false if 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY,
  },
});
/**secure tells Nodemailer whether to start with an encrypted connection or upgrade later — ensuring your SMTP communication stays private and safe. */


//  Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log(" SMTP Server Connected Successfully ✅!");
  }
});

export default transporter;
/**This transporter object is your “email connection pipe”.
It tells Nodemailer where to send mail, how to connect securely, and who is allowed to send it. */









/**host: process.env.SMTP_HOST || "smtp-relay.brevo.com"
This tells Nodemailer which mail server to connect to.
It first tries to use the value from your .env file (SMTP_HOST),
and if not found, it defaults to "smtp-relay.brevo.com" (the Brevo SMTP host).

port: Number(process.env.SMTP_PORT) || 587
This defines which port number to use for SMTP connection.
It converts the .env value (which is a string) into a number.
If it’s not defined, it defaults to 587 — the standard port for STARTTLS (secure email sending).

secure: Number(process.env.SMTP_PORT) === 465
This tells Nodemailer whether to start the connection securely (SSL) or not.
If port 465 → secure: true (use SSL immediately).
If port 587 → secure: false (use STARTTLS after handshake).

auth: { user, pass }
This is how Nodemailer logs into your SMTP server.
Every SMTP service (like Brevo, Gmail, etc.) requires authentication.
These values come from your .env file.

Connects to your SMTP server (smtp-relay.brevo.com)
Uses port 587 (or whatever you set)
Logs in with your credentials
Sends your email securely

| Line        | Purpose                        | Example                         |
| ----------- | ------------------------------ | ------------------------------- |
| `host`      | SMTP server hostname           | `smtp-relay.brevo.com`          |
| `port`      | Communication port             | `587` or `465`                  |
| `secure`    | Whether to use SSL immediately | `false` for 587, `true` for 465 |
| `auth.user` | SMTP username                  | Your Brevo login email          |
| `auth.pass` | SMTP password / key            | Your Brevo SMTP key             |
*/



/**What secure Means
The secure option in Nodemailer controls how your app connects to the mail server (SMTP) —
specifically whether it uses SSL/TLS encryption immediately or starts unencrypted and upgrades later.

⚙️ SMTP has two common connection types
Port	Encryption Type	secure value	Explanation
465	Implicit SSL/TLS	true	Connects securely from the start
587	STARTTLS (explicit TLS)	false	Starts unencrypted, then upgrades to TLS after handshake
25	Legacy (insecure)	false	Rarely used for app mail sending
🧩 How It Works

When your app connects to an SMTP server:

If secure: true
→ Nodemailer immediately starts a fully encrypted (TLS) connection.
Example: port 465.

If secure: false
→ Nodemailer connects normally first, then uses the STARTTLS command to upgrade to a secure connection after initial negotiation.
Example: port 587.

🔐 Why Encryption Matters
Without TLS, anyone sniffing your network could see:
The recipient’s email
The subject
Even parts of the message text

So secure ensures your email credentials and message content are encrypted during transmission.
That’s critical for:

Login safety
Protecting user data
Complying with privacy laws (like GDPR)

✅ Brevo’s Case (What You’re Using)
Brevo Port	secure	Description
587	false	Uses STARTTLS (recommended)
465	true	Uses SSL/TLS (if port 587 blocked) 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
It means:
“If my SMTP port number is 465, then set secure to true;
otherwise, set secure to false.”

So:
When you use port 465, secure → true
When you use port 587, secure → false

⚙️ Why we do this
Email servers like Brevo, Gmail, Outlook, etc., use different encryption methods on different ports:

Port	Encryption Type	Should secure be true?
465	SSL/TLS (starts encrypted immediately)	✅ Yes (secure: true)
587	STARTTLS (starts normal, then upgrades to secure)	❌ No (secure: false)*/