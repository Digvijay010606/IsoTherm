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

''' text
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