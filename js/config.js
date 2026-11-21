/* Public flower wall settings.
   This is Supabase's *publishable* key: it is meant to be used in the browser and is safe
   to show. What it can do is limited in the database itself: row-level security (anyone
   can only add a gift row and read the public wall), rate limits, an origin lock to
   https://codemitvishal.github.io, and upload-only photo storage. Never put the
   secret (service_role) key here. */
window.PETAL_CONFIG = {
  supabaseUrl: 'https://pflbnxxmcbvgobcmdyec.supabase.co',
  supabaseAnonKey: 'sb_publishable_EHtg6eWDB6V1ZrgnnqJR9A_9oHNFn7T',
};
