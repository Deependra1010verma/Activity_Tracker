export default function SetupPage() {
  return (
    <section className="grid-two">
      <div className="section-panel">
        <span className="eyebrow">Auth setup</span>
        <h2 className="section-title">How this becomes a real two-user app</h2>
        <p className="section-copy">
          Supabase Auth me tum aur tumhari bahan alag accounts se sign in karoge.
          Login ke baad each account ka profile row load hoga, aur ussi profile ke
          hisaab se dashboard, subjects, cards, aur review history fetch hogi.
        </p>
        <div className="stack">
          <article className="list-card">
            <h4>1. Separate accounts</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Shared account use nahi karna, kyunki revision schedule har learner ke
              answer quality par depend karega.
            </p>
          </article>
          <article className="list-card">
            <h4>2. Profile onboarding</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              First login par learner mode, grade, target exam, aur subject presets
              save honge.
            </p>
          </article>
          <article className="list-card">
            <h4>3. Row-level security</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Database policy ensure karegi ki user sirf apna hi data dekh sake.
            </p>
          </article>
        </div>
      </div>

      <div className="section-panel">
        <span className="eyebrow">Current scaffold</span>
        <h3 className="section-title">What is already prepared</h3>
        <div className="stack">
          <article className="list-card">
            <h4>Multi-profile sample flow</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Dashboard, learn, and review pages now support profile-specific behavior.
            </p>
          </article>
          <article className="list-card">
            <h4>Profile-aware subject presets</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Engineering and NEET learners ke liye alag subject buckets aur prompts.
            </p>
          </article>
          <article className="list-card">
            <h4>Schema direction</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Profiles, subjects, decks, reviews, aur RLS-ready table structure add kiya
              gaya hai.
            </p>
          </article>
          <article className="list-card">
            <h4>Auth page scaffold</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              `/auth` par signup/signin form add ho chuka hai jo Supabase env setup ke
              baad real account creation handle karega.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
