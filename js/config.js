/* Public flower wall settings.
   Fill both values from Supabase → Project Settings → API (or "Connect") to switch the wall on.
   The anon / publishable key is meant to be public: the database only lets visitors add a gift
   and read the wall summary (see supabase/schema.sql). Leave empty to keep the wall hidden. */
window.PETAL_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '', // public publishable key, safe to share
};
