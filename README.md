<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Georgia&size=34&duration=3000&pause=1000&color=E0473E&center=true&vCenter=true&width=650&lines=IsoTherm;Heat+Vulnerability+Mapper;Built+for+FortyGuard+Hackathon+2026" alt="Typing SVG" />

### Heat vulnerability &amp; outdoor worker safety, mapped block by block — for Houston, TX

[![Live Demo](https://img.shields.io/badge/Live_Demo-iso--therm.vercel.app-3fb8c9?style=for-the-badge&logo=vercel&logoColor=white)](https://iso-therm.vercel.app)
[![Hackathon](https://img.shields.io/badge/FortyGuard-Global_AI_Hackathon_2026-e0473e?style=for-the-badge)](https://www.fortyguard.com/hackathon26)
[![Made with Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3fb8c9,50:e8a23d,100:e0473e&height=100&section=header" width="100%"/>

</div>

## Why IsoTherm

City-wide temperature readings hide the real story. Two neighborhoods a few kilometers apart can face very different heat risk — and the people most exposed to it, outdoor workers, usually get no street-level warning at all.

**IsoTherm turns raw heat and infrastructure data into a local, block-by-block risk picture — and tells you what to actually do about it.**

Instead of stopping at "here's a hot area," IsoTherm answers a harder question: *what happens if a city actually acts on it?*

---

## What it does

| Feature | Description |
|---|---|
| 🗺️ **Interactive heat map** | 9,900+ tiles at 100 m resolution across Houston, pulling live temperature from the **FortyGuard Temperature API** |
| 🌡️ **Heat risk score** | A 0–100 score per zone, weighing heat exposure against green-cover, cooling-water, and shade deficits |
| 📊 **Impact dashboard** | A public, no-login transparency view ranking all zones by risk, with a cooling-coverage-gap report for city planners |
| 🎯 **Projected score** | Select recommended interventions and see the *modeled* before → after risk score, at the risk engine's own published weights |
| 🦺 **Safety companion** | Plain-language, OSHA/NIOSH-aligned guidance for outdoor workers — what's driving the risk here, and warning signs to stop work immediately |
| 📍 **Community reporting** | Anonymous, location-rounded reports of no-shade, no-water, or unsafe conditions, feeding straight back onto the map |

Relief infrastructure — water points, cooling locations, shade shelters, and medical facilities — comes from **OpenStreetMap**.

---

## See it live

🔗 **[iso-therm.vercel.app](https://iso-therm.vercel.app)**

| Map | Impact | Safety |
|---|---|---|
| Block-level heat + risk score | 42 zones ranked, projected-score modeling | Worker-facing guidance |

<img width="900" height="560" alt="isotherm_projected_score" src="https://github.com/user-attachments/assets/a21ce945-6c40-48ba-af03-bfdf851db080" />

---

## How it works

```
FortyGuard Temperature API ─┐
                             ├─▶ Feature engineering ─▶ Risk engine ─▶ Risk score
OpenStreetMap infrastructure ┘                                            │
                                                                            ▼
                                                        Recommendations ─▶ Projected score
                                                                            │
                                                                            ▼
                                                              Interactive web dashboard
```

1. Fetch and cache environmental data (FortyGuard) and infrastructure data (OpenStreetMap) per 100 m tile.
2. Engineer features: heat exposure, green-cover deficit, cooling-water deficit, shade deficit.
3. Score each zone 0–100 and rank city-wide.
4. Generate recommended interventions per zone.
5. Model a projected score by reducing each targeted deficit at its published weight — a projection, not a measured outcome.

---

## Team

Built for the **FortyGuard Global AI Hackathon 2026**.

| Names | Roles | 
|---|---|
| **[Digvijay Singh Shekhawat](https://www.linkedin.com/in/digvijay-singh-shekhawat-20b203365/)** | Team Lead | 
| **[Siddhesh Kawat](https://www.linkedin.com/in/siddheshkasat/)** | Website |
| **[Kanak Baghel](https://www.linkedin.com/in/kanakbaghel/)** | Data |

---

## Disclaimer

The risk score is a transparent prototype measure, not a medically validated threshold, and does not indicate whether conditions are safe right now. Safety guidance is general information, not medical advice. If someone shows signs of heat illness, call emergency services immediately.

<div align="center">
<sub>Built with ❤️ and too much coffee for FortyGuard Hackathon 2026.</sub>
</div>
