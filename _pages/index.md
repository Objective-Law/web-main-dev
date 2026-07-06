---
title: "The Objective Law Initiative"
date: "2026-06-09"
last_modified_at: "2026-07-05"
permalink: /
excerpt: "The Objective Law Initiative fights to secure individual rights against arbitrary power by developing and applying a constitutional framework grounded in rational principles of rights and limited government."
tagline: "A public-interest legal initiative for objective law, individual rights, and limited government."
classes: wide
header:
  # kicker: "Objective Law Initiative"
  overlay_title: "The Objective Law Initiative"
  overlay_title_width: "48rem"
  # overlay_interval: 4800
  overlay_images:
    - image: /assets/images/overlay/index.webp
      focal_point: "80% 25%"
      anchor_point: "80% 25%"
  actions:
    - label: "About OLI"
      url: /about/
      class: "oli-button oli-button--overlay"
    - label: "Contribute"
      url: /contribute/
      class: "oli-button oli-button--overlay"
---

<div class="oli-home">
  <section class="oli-section">
    <h2>The Objective Law Initiative fights to secure individual rights against arbitrary power.</h2>
    <p class="oli-section__lead">OLI develops and applies a constitutional framework grounded in rational principles of rights, objective law, and limited government.</p>
    <p>OLI was cofounded by <a href="mailto:nicholas@objectivelaw.org">Nicholas Provenzo</a> and <a href="mailto:arthur@objectivelaw.org">Arthur Zey</a>. Questions may be sent to <a href="mailto:info@objectivelaw.org">info@objectivelaw.org</a>.</p>
  </section>

  <section class="oli-section oli-panel oli-panel--accent">
    <h2>Rights need legal principles that can actually constrain power.</h2>
    <p>America's constitutional order depends on more than written text. It depends on courts, lawyers, scholars, and citizens understanding why individual rights exist, why government power must be limited, and why constitutional restraints must be enforced according to principle rather than expediency.</p>
    <p>OLI exists to develop those principles into legal arguments, public education, and advocacy capable of resisting vague standards, open-ended balancing tests, excessive deference, and discretionary power.</p>
    {% include double_icon_button.html href="/about/#why-oli-exists" label="Read more" alignment="center" container_alignment="right" %}
  </section>

  <section class="oli-section">
    <h2>Principled legal work for cases, courts, and public understanding.</h2>
    <div class="oli-grid">
      <article class="oli-card">
        <h3>Legal Research</h3>
        <p>Develop constitutional arguments grounded in objective standards, individual rights, due process, separation of powers, and limits on official discretion.</p>
      </article>
      <article class="oli-card">
        <h3>Amicus Advocacy</h3>
        <p>Prepare selected public-interest amicus work where a case presents a serious opportunity to clarify and defend objective limits on government power.</p>
      </article>
      <article class="oli-card">
        <h3>Public Education</h3>
        <p>Publish articles, explainers, videos, and commentary that make rights-based legal principles intelligible to lawyers, scholars, judges, and citizens.</p>
      </article>
    </div>
    {% include double_icon_button.html href="/about/#activities" label="Read more" alignment="center" container_alignment="right" %}
  </section>

  <section class="oli-section oli-section--issue-opportunities">
    <h2>Concrete controversies where objective-law analysis could matter.</h2>
    <p class="oli-section__lead">These are illustrative cases and legal controversies, not OLI filings, client matters, or final institutional positions. They show the kinds of problems OLI is built to address: disputes where government power becomes vague, discretionary, collectivized, or detached from the protection of individual rights.</p>
    <p>Each example points to work that requires time-sensitive research, principled legal analysis, and the capacity to act before briefing windows close.</p>

    {% assign opportunities = site.issue_opportunities | sort: "order" %}
    <div class="oli-grid oli-issue-opportunities">
      {% for opportunity in opportunities %}
        {% include oli/issue-opportunity-card.html item=opportunity show_tags=false title_level=3 %}
      {% endfor %}
    </div>
  </section>

  <section class="oli-section">
    <h2>Help us scale before the next briefing window closes.</h2>
    <p>OLI needs research, editorial, legal, technical, and donor-development capacity before major cases reach the decisive stage. Support helps turn a principled framework into timely legal work and public explanation.</p>
    <div class="oli-actions">
      <a class="oli-button" href="/contribute/">Support OLI</a>
      <a class="oli-button oli-button--secondary" href="/about/">Learn About OLI</a>
    </div>
  </section>
{% comment %}
  <section class="oli-section oli-video-placeholder" aria-label="Introductory video placeholder">
    <div class="oli-video-placeholder__inner">
      <span class="oli-video-placeholder__icon"><i class="fas fa-play" aria-hidden="true"></i></span>
      <h2 class="oli-section__title">Video introduction coming soon</h2>
      <p>The first OLI video will introduce the mission, legal focus, and contribution posture. No video is embedded until an official asset exists.</p>
    </div>
  </section>
{% endcomment %}
</div>
