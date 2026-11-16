/* Public flower wall settings.
   Fill both values from Supabase → Project Settings → API Keys to switch the wall on.
   The publishable key is meant to be public: the database only lets visitors add a gift
   and read the wall summary (see supabase/schema.sql). Leave empty to keep the wall hidden. */
window.PETAL_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '', // public publishable key "petal_post_web"
};
