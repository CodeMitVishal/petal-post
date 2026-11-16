/* Public flower wall settings.
   The real values are NOT stored in this repository. They live in the GitHub repository
   secrets SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, and the deploy workflow
   (.github/workflows/deploy.yml) writes them into this file only in the published site.
   Left empty (e.g. when you open the site locally), the flower wall and photos stay hidden. */
window.PETAL_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
