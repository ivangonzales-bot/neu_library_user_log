# NEU Library Visitor Hub

A web-based visitor logging system for the NEU Library. Students can sign in using their NEU institutional Google account (`@neu.edu.ph`) or email, and their visit is automatically recorded in a centralized database for library staff to monitor.

---

## Features

- 🔐 **Google Sign-In** — restricted to `@neu.edu.ph` institutional accounts only
- 📧 **Email Sign-In** — alternative login for students using their NEU email
- 📋 **Visitor Log** — automatically records name, email, and timestamp on every visit
- 🛡️ **Admin Dashboard** — dedicated admin view for managing and monitoring visits
- 📊 **Visit History** — view and track past visitor records

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Supabase | Database & Authentication |
| Google OAuth 2.0 | Institutional sign-in |
| Lovable | Development & deployment |

---

## Setup & Installation

### Prerequisites
- Node.js installed
- A Supabase account and project
- A Google Cloud Console account

---

### 1. Clone the repository

```bash
git clone https://github.com/ivangonzales-bot/neu-library-visitor-hub.git
cd neu-library-visitor-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in your Supabase project under **Settings → API**.

---

### 4. Set up Google OAuth in Supabase

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. *NEU Library App*)
3. Go to **APIs & Services → OAuth Consent Screen** → set to **External** → fill in app details
4. Go to **APIs & Services → Credentials → + Create Credentials → OAuth Client ID**
5. Set type to **Web application**
6. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. In Supabase → **Authentication → Providers → Google** → paste both values → **Save**

---

### 5. Configure Supabase URL settings

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app-url.lovable.app`
- **Redirect URLs:** add `https://your-app-url.lovable.app/**`

---

### 6. Set up the database

In Supabase → **SQL Editor**, create the visits table:

```sql
create table visits (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  created_at timestamp with time zone default now()
);
```

---

### 7. Run the app locally

```bash
npm run dev
```

Open [http://localhost:3000]([http://localhost:3000](https://preview--neu-visitor-vision.lovable.app/#)) in your browser.

---

## Deployment

This project is deployed via [Lovable](https://lovable.dev). Any changes pushed to the `main` branch will automatically sync and deploy.

Live URL: `https://neu-visitor-vision.lovable.app`

---

## Notes

- Only `@neu.edu.ph` Google accounts are permitted to sign in via Google OAuth
- Admin access is separate from student sign-in
- Supabase API keys should never be committed to the repository — always use `.env`

---

## License

This project is for internal use by the NEU Library only.
