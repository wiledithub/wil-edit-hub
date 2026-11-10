
/* Satu-satunya file konfigurasi situs. Ubah di sini, jangan di file lain. */
window.WEH_CONFIG = {
  name: "WIL EDIT HUB",
  tagline: "Your Creative Assets. Your Editing Inspiration.",
  description: "Platform resource editing digital: preset Alight Motion, template After Effects, preset CapCut, dan tutorial untuk editor video dan content creator.",
  logo: "assets/icons/favicon.svg",
  favicon: "assets/icons/favicon.svg",
  domain: "https://wiledithub.github.io/wil-edit-hub",
  contact: { email: "wilfocus23@gmail.com" },
  socials: [
    { name: "TikTok", url: "https://www.tiktok.com/@its_me_wil23" },
    { name: "YouTube", url: "https://www.youtube.com/@wilfocus3155" }
  ],
  ads: { enabled: false, client: "", slots: { inContent: "" } },
  perPage: 12,
  softwares: ["Alight Motion", "After Effects", "CapCut", "Other"],
  contentTypes: ["preset", "template", "tutorial", "resource"],
  analytics: { enabled: false, hook: null },

  // Supabase: statistik global preset
  supabase: {
    enabled: true,
    url: "https://epqcoecqgpgcuzlmzjrn.supabase.co",
    publishableKey: "sb_publishable_HxXAH2h4M_KK8TtanFhzHg_DsuwcT9Q"
  }
};
