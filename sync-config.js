// nutri-SCULPT sync settings.
// Sync is OFF until enabled is true and the two Supabase values are filled in.
// The anon/publishable key is safe to keep here: it is designed for browser
// code. Row level security in Supabase is what actually protects the data.
// Never put a service_role key in this file.
window.NUTRI_SYNC_CONFIG = {
  // Set this to true AFTER running supabase-sync-setup.sql and enabling
  // email/password sign-in in Supabase. Until then the app stays local-only.
  enabled: true,
  supabaseUrl: "https://bojfddaumbdggrtgynnm.supabase.co",
  supabaseAnonKey: "sb_publishable_D-vfS-pQyyvSbC4gMq5qFQ_HY89o6EQ"
};
