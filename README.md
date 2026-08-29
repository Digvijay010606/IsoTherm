# 🌡️ IsoTherm — Urban Heat Risk Mapping & Recommendation System

> An interactive heat-risk mapping platform that helps identify heat-stressed urban areas and provides location-based recommendations for reducing heat exposure.

🔗 **Live Demo:** https://iso-therm.vercel.app/

---

## 📌 Overview

**IsoTherm** is an interactive web-based heat-risk mapping system designed to identify areas that are more vulnerable to extreme heat.

Instead of showing only temperature, IsoTherm combines temperature and surrounding environmental factors to calculate a **Heat Risk Score** for different locations.

The system helps answer questions such as:

- Which areas are experiencing higher heat?
- How severe is the heat risk?
- How long does an area remain dangerously hot?
- What factors are contributing to the risk?
- Where are the nearest water, cooling, shade, and medical facilities?
- What actions can be taken to reduce heat exposure?

The project is designed to support **urban planning, public safety, heat mitigation, and climate-resilience decisions**.

---

## 🚀 Features

### 🗺️ Interactive Heat Map

The application displays heat-risk information across the map using high-resolution temperature data.

Users can:

- Search for a place or street
- Explore different locations
- Click on map zones
- View heat-risk information for individual areas
- Identify hotspots

---

### 🔥 Heat Risk Score

Each selected zone receives a **Heat Risk Score from 0–100**.

The score represents the combined heat-related risk of the selected location.

Example:

```text
Risk Score: 76.4 / 100
Risk Level: Critical
```

---

### 🌡️ Temperature Analysis

For each selected location, the dashboard provides:

- Peak temperature
- Average temperature
- Temperature comparison with cooler areas
- Number of hours above 35°C
- Longest continuous dangerous heat period

This allows users to understand not only how hot a location is, but also how persistent the heat is.

---

### 📊 Heat Risk Drivers

The system breaks down the risk score into contributing factors.

These include:

- Heat exposure
- Green-cover deficit
- Cooling-water deficit
- Shade deficit

This makes the system more explainable instead of providing only a single risk number.

---

### 💧 Nearby Relief & Resources

The map also identifies nearby resources that can help reduce heat exposure.

These include:

- 💧 Water points
- ❄️ Cooling locations
- 🌳 Shade shelters
- 🏥 Medical facilities

The system can also show the distance to nearby relief locations.

---

### 💡 Recommendations

Based on the identified heat-risk factors, the system provides practical recommendations.

Examples include:

- Prioritize shaded rest areas
- Increase cooling measures
- Provide worker heat alerts
- Improve green coverage
- Increase access to drinking water

---

## 🧠 How the System Works

The overall workflow can be summarized as:

```text
Temperature Data
       │
       ▼
Data Collection & Storage
       │
       ▼
Spatial / Location Processing
       │
       ▼
Feature Engineering
       │
       ├── Heat Exposure
       ├── Green Cover
       ├── Water Availability
       └── Shade Availability
       │
       ▼
Heat Risk Calculation
       │
       ▼
Risk Classification
       │
       ▼
Recommendations
       │
       ▼
Interactive Web Dashboard
```

---

## 📡 Data Sources

### 🌡️ FortyGuard

Temperature data is obtained using the **FortyGuard Temperature API.**

The system uses high-resolution temperature information at approximately 100 m spatial resolution.

This allows the system to analyze heat conditions at a much more local level instead of relying only on city-wide temperature values.

### 🗺️ OpenStreetMap

**OpenStreetMap (OSM) data** is used to identify relevant locations and infrastructure around the selected area.

This includes information that can be used for:

- Water points
- Cooling locations
- Shade-related infrastructure
- Medical facilities
- Other useful urban features

---

## ⚙️ Tech Stack

**Frontend**

- React
- JavaScript
- HTML
- CSS
- Interactive mapping

**Data & APIs**

- FortyGuard Temperature API
- OpenStreetMap

**Data Processing**

- Python
- Pandas
- NumPy
- SQLite

**Deployment**

- Vercel

---

## 🛠️ How to Run the Project Locally

1. Clone the Repository

```text
git clone https://github.com/Digvijay010606/IsoTherm.git
```

Move into the project directory:

```text
cd IsoTherm
```

2. Install Dependencies

If the frontend uses npm:

```text
npm install
```

3. Configure Environment Variables

Create a <key>.env</key> file if required by the project.

Example:

```text
FORTYGUARD_API_KEY="your_api_key"
```

Add any other API keys or configuration values required by the project.

Never commit API keys or other secrets to GitHub.

4. Start the Development Server

```text
npm run dev
```

The terminal will provide a local URL, usually similar to:

**http://localhost:3000**

Open the URL in your browser.

---

## 🖥️ Recommended Usage

### ⚠️ Desktop View Recommended

IsoTherm is primarily designed for desktop/laptop screens because the application contains:

- Interactive maps
- Heat layers
- Multiple information panels
- Risk-score visualizations
- Charts and statistics
- Map markers and controls

For the best experience, use the website in **Desktop View.**

### 📱 Mobile

The project is not optimized primarily for mobile screens.

If you open it on a mobile device, we recommend enabling:

> Desktop Site / Desktop View

from your mobile browser.

---

## 👥 Team

Project: **IsoTherm**

Members:

- https://github.com/Digvijay010606
- https://github.com/Kanakbaghel
- https://github.com/iamsiddhesh-dev

---

## 📡 Data Sources & Credits

IsoTherm is built using data and open-source technologies from the following sources:

### 🌡️ FortyGuard

Temperature and heat-related environmental data are provided through the **FortyGuard API**.

We use FortyGuard's high-resolution temperature data to analyze local heat conditions and generate heat-risk insights.

🔗 https://www.fortyguard.com/

**Special thanks to FortyGuard for providing the temperature data API that powers the heat analysis in IsoTherm.**

---

### 🗺️ OpenStreetMap

**OpenStreetMap (OSM)** provides geographic and location data used to identify surrounding infrastructure and relevant locations.

The data is used for features such as:

- Water points
- Medical facilities
- Cooling locations
- Shade-related locations
- Other nearby urban resources

🔗 https://www.openstreetmap.org/

© OpenStreetMap contributors

---

### 🍃 Leaflet

**Leaflet** is used to create the interactive maps and map-based user interface in IsoTherm.

🔗 https://leafletjs.com/

Leaflet is open-source software licensed under the BSD-2-Clause License.

---

### 🛰️ Esri

**Esri** map tiles and/or geographic services are used as part of the map visualization and geographic representation.

🔗 https://www.esri.com/

Map data and services are subject to Esri's applicable terms of use.

---

## 🙏 Acknowledgements

We would like to thank:

- **FortyGuard** — for providing the temperature API and high-resolution heat data.
- **OpenStreetMap contributors** — for providing open geographic data.
- **Leaflet** — for the open-source interactive mapping library.
- **Esri** — for providing mapping and geographic visualization services.

These technologies and data sources were essential in building the IsoTherm heat-risk mapping platform.