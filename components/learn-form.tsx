const promptTemplates = [
  {
    title: "Definition recall",
    copy: "Concept ko seedha explain karo jaise kisi beginner ko samjhana ho.",
  },
  {
    title: "Why-based recall",
    copy: "Ye cheez aisi kyun hoti hai ya is rule ke peeche reason kya hai.",
  },
  {
    title: "Scenario-based recall",
    copy: "Real situation dekar pucho ki concept ko kaise apply karoge.",
  },
  {
    title: "Comparison recall",
    copy: "Do related ideas me difference ya choice kab karni hai.",
  },
];

export function LearnFormView() {
  return (
    <section className="grid-two">
      <div className="section-panel">
        <span className="eyebrow">Step 1</span>
        <h2 className="section-title">Capture what you learned today</h2>
        <p className="section-copy">
          Abhi form static scaffold hai. Next step me isko Supabase me persist
          karenge aur isi input se cards generate karenge.
        </p>

        <form className="capture-form">
          <div className="field">
            <label htmlFor="title">Topic title</label>
            <input
              id="title"
              name="title"
              placeholder="Example: Binary search fundamentals"
            />
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <select id="subject" name="subject" defaultValue="DSA">
              <option>DSA</option>
              <option>Web</option>
              <option>Backend</option>
              <option>Database</option>
              <option>System Design</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="notes">What did you learn?</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Aaj jo padha usko short, clear bullets ya paragraph me likho."
            />
          </div>

          <div className="field">
            <label htmlFor="concepts">Atomic concepts</label>
            <textarea
              id="concepts"
              name="concepts"
              placeholder="Ek concept per line. Example: Binary search only works on sorted data."
            />
          </div>

          <button className="primary-button" type="button">
            Save learning item
          </button>
        </form>
      </div>

      <div className="section-panel">
        <span className="eyebrow">Step 2</span>
        <h3 className="section-title">Question variants we will generate</h3>
        <p className="section-copy">
          Same concept ko different patterns me puchhne se rote memory ke
          instead flexible understanding build hoti hai.
        </p>
        <div className="template-grid">
          {promptTemplates.map((template) => (
            <article className="template" key={template.title}>
              <h4>{template.title}</h4>
              <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                {template.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

