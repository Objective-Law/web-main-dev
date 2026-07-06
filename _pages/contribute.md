---
title: "Contribute"
date: "2026-06-10"
last_modified_at: "2026-07-05"
excerpt: "Support OLI through donations, introductions, legal research, writing, media, and scholar or lawyer collaboration."
tagline: "Help build a principled legal initiative for objective law, individual rights, and limited government."
classes: wide
header:
  kicker: "Support OLI"
  overlay_title: "Contribute"
  overlay_images:
  - image: /assets/images/overlay/contribute.webp
    focal_point: "75% 50%"
    anchor_point: "75% 50%"
---

<section class="oli-section" markdown="1">
## Support OLI

  <p class="oli-section__lead">OLI is building legal, scholarly, and educational capacity around a single purpose: clarifying and defending objective limits on government power and the individual rights those limits exist to protect.</p>
  <p>Prospective donors, collaborators, lawyers, scholars, writers, editors, designers, and volunteers can contact OLI at <a href="mailto:info@objectivelaw.org">info@objectivelaw.org</a>.</p>
  <p>A formal donation platform is pending 501(c)(3) confirmation. Until that contribution path is ready, prospective donors should email us directly.</p>
</section>

<section class="oli-section" markdown="1">
## Ways to Contribute

  <div class="oli-grid">
    <section class="oli-card">
      <h3>Donations</h3>
      <p>Financial support will fund research, writing, publication, operations, and future legal advocacy capacity.</p>
    </section>
    <section class="oli-card">
      <h3>Donor Introductions</h3>
      <p>Introduce OLI to people who may be interested in principled constitutional advocacy and public legal education.</p>
    </section>
    <section class="oli-card">
      <h3>Legal Research</h3>
      <p>Help identify legal issues, doctrines, cases, scholarship, and historical materials relevant to objective law.</p>
    </section>
    <section class="oli-card">
      <h3>Writing and Editing</h3>
      <p>Assist with articles, explainers, newsletters, educational scripts, copyediting, and source checking.</p>
    </section>
    <section class="oli-card">
      <h3>Media, Video, and Design</h3>
      <p>Support clear public communication through video, visual design, diagrams, and accessible web presentation.</p>
    </section>
    <section class="oli-card">
      <h3>Scholar and Lawyer Collaboration</h3>
      <p>Collaborate on research, public education, and future amicus work consistent with OLI's mission.</p>
    </section>
  </div>
</section>

<section class="oli-section" markdown="1">
## What Support Makes Possible

  <p class="oli-section__lead">Support gives OLI the capacity to turn principled legal analysis into timely public work.</p>
  <p>Financial and professional support helps OLI develop research, briefs, public education, editorial capacity, media assets, and the infrastructure needed to present serious legal-philosophical arguments clearly.</p>
  <p>OLI's work requires more than good ideas. It requires time, research capacity, legal judgment, writing, editing, publication tools, design, outreach, and the ability to act before important legal windows close.</p>
</section>

<section class="oli-section oli-section--issue-opportunities" markdown="1">
## Cases Do Not Wait for Infrastructure

  <p class="oli-section__lead">Major constitutional cases often reach the decisive stage before a young organization has the funding, research capacity, or briefing infrastructure to participate.</p>
  <p>By the time a case is granted, argued, or decided, the opportunity to shape the legal argument may already have passed. The matters below illustrate the kind of work OLI is built to do when it has the capacity to act: identify the principle at stake, develop an objective-law analysis, coordinate with lawyers and scholars, and intervene where a focused amicus brief or public explanation could add something other groups are not already saying.</p>

  {% assign opportunities = site.issue_opportunities | sort: "order" %}
  <div class="oli-grid oli-issue-opportunities">
    {% for opportunity in opportunities %}
      {% include oli/issue-opportunity-card.html item=opportunity show_tags=false title_level=3 %}
    {% endfor %}
  </div>
</section>

<section class="oli-section" markdown="1">
## Support Does Not Control Legal Judgment

  <p>Donors and volunteers do not control OLI's legal positions, research conclusions, advocacy judgment, publication decisions, or institutional priorities. OLI welcomes support because of its mission, not as a vehicle for private control over legal arguments.</p>
</section>
