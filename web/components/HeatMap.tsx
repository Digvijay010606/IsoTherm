"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useJson } from "@/lib/useJson";
import { renderTileImage } from "@/lib/tileImage";
import { tileExtent, zoneBounds } from "@/lib/projection";
import { MARKER_COLORS, MARKER_GLYPHS } from "./MapMarkers";
import { RELIEF_POINTS, reliefLabel, zoneLabel } from "@/lib/realData";
import type { HeatLayerId, Place, ReliefKind, Report, TilesFile, Zone } from "@/lib/types";

const ESRI_CANVAS = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const BASEMAP_URL = `${ESRI_CANVAS}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`;
const LABELS_URL = `${ESRI_CANVAS}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`;

const BASEMAP_MAX_NATIVE_ZOOM = 16;
const MAP_MAX_ZOOM = 17;
const MAP_MIN_ZOOM = 3;
const AREA_ZOOM = 12;
const AREA_FIT_PADDING: [number, number] = [8, 8];

const AREA_PANE = "studyArea";
const AREA_PANE_Z_INDEX = "340";
const HEAT_PANE = "heatOverlay";
const HEAT_PANE_Z_INDEX = "350";
const LABEL_PANE = "basemapLabels";
const LABEL_PANE_Z_INDEX = "375";
const HEAT_OPACITY = 0.88;

const AREA_EDGE_COLOR = "#4a5058";
const FOOTPRINT_COLOR = "#f2f1ee";
const SEARCH_COLOR = "#4fc3b8";
const REPORT_COLOR = "#f0b93f";

function reliefIcon(kind: string) {
  return L.divIcon({
    className: "relief-marker",
    html: `<span class="relief-pin" style="background:${MARKER_COLORS[kind]}">${MARKER_GLYPHS[kind]}</span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function reportIcon(total: number) {
  const badge = total > 1 ? `<i class="relief-count">${total}</i>` : "";
  return L.divIcon({
    className: "relief-marker",
    html: `<span class="relief-pin relief-pin-report" style="background:${REPORT_COLOR}">${MARKER_GLYPHS.report}${badge}</span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

type HeatMapProps = {
  layer: HeatLayerId;
  zone: Zone;
  zoneTiles: number;
  visibleKinds: Set<ReliefKind>;
  searchedPlace: Place | null;
  reports: Report[];
  showReports: boolean;
  onSelect: (lat: number, lon: number) => void;
  onReady?: (tiles: TilesFile) => void;
};

export function HeatMap({
  layer,
  zone,
  zoneTiles,
  visibleKinds,
  searchedPlace,
  reports,
  showReports,
  onSelect,
  onReady,
}: HeatMapProps) {
  const state = useJson<TilesFile>("/data/tiles.json");
  const tiles = state.status === "ready" ? state.data : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const reliefRef = useRef<L.LayerGroup | null>(null);
  const searchRef = useRef<L.LayerGroup | null>(null);
  const reportsRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (tiles && onReady) onReady(tiles);
  }, [tiles, onReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !tiles) return;

    const extent = L.latLngBounds(tileExtent(tiles));

    const map = L.map(container, {
      center: extent.getCenter(),
      zoom: AREA_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      zoomControl: true,
      attributionControl: false,
      zoomSnap: 0.25,
    });

    const areaPane = map.createPane(AREA_PANE);
    areaPane.style.zIndex = AREA_PANE_Z_INDEX;
    areaPane.style.pointerEvents = "none";

    const heatPane = map.createPane(HEAT_PANE);
    heatPane.style.zIndex = HEAT_PANE_Z_INDEX;
    heatPane.style.pointerEvents = "none";

    const labelPane = map.createPane(LABEL_PANE);
    labelPane.style.zIndex = LABEL_PANE_Z_INDEX;
    labelPane.style.pointerEvents = "none";

    L.tileLayer(BASEMAP_URL, {
      maxNativeZoom: BASEMAP_MAX_NATIVE_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    }).addTo(map);

    L.tileLayer(LABELS_URL, {
      pane: LABEL_PANE,
      maxNativeZoom: BASEMAP_MAX_NATIVE_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    }).addTo(map);

    L.rectangle(tileExtent(tiles), {
      pane: AREA_PANE,
      color: AREA_EDGE_COLOR,
      weight: 1,
      fill: false,
      interactive: false,
    }).addTo(map);

    map.on("click", (event) => selectRef.current(event.latlng.lat, event.latlng.lng));

    mapRef.current = map;
    reliefRef.current = L.layerGroup().addTo(map);
    reportsRef.current = L.layerGroup().addTo(map);
    searchRef.current = L.layerGroup().addTo(map);

    let fitted = false;
    const fitToArea = () => {
      map.invalidateSize();
      if (fitted || container.clientHeight === 0) return;
      map.fitBounds(extent, { padding: AREA_FIT_PADDING });
      fitted = true;
    };

    fitToArea();
    const observer = new ResizeObserver(fitToArea);
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      reliefRef.current = null;
      reportsRef.current = null;
      searchRef.current = null;
    };
  }, [tiles]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tiles) return;

    const url = renderTileImage(tiles, layer);
    if (!url) return;

    const overlay = L.imageOverlay(url, tileExtent(tiles), {
      pane: HEAT_PANE,
      opacity: HEAT_OPACITY,
      className: "heat-overlay",
      interactive: false,
    }).addTo(map);

    return () => {
      overlay.remove();
    };
  }, [tiles, layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tiles) return;

    const bounds = zoneBounds(tiles, zoneTiles, zone.lat, zone.lon);
    const [[, west], [north, east]] = bounds;

    const footprint = L.rectangle(bounds, {
      color: FOOTPRINT_COLOR,
      weight: 2,
      fill: false,
      interactive: false,
    }).addTo(map);

    const label = L.tooltip({
      permanent: true,
      direction: "top",
      className: "map-label",
      offset: [0, -4],
    })
      .setLatLng([north, (west + east) / 2])
      .setContent(zoneLabel(zone))
      .addTo(map);

    return () => {
      footprint.remove();
      label.remove();
    };
  }, [tiles, zone, zoneTiles]);

  useEffect(() => {
    const group = reliefRef.current;
    if (!group || !tiles) return;

    group.clearLayers();

    for (const point of RELIEF_POINTS) {
      if (!visibleKinds.has(point.kind)) continue;

      L.marker([point.lat, point.lon], { icon: reliefIcon(point.kind) })
        .bindTooltip(reliefLabel(point), { direction: "top", className: "map-label" })
        .on("click", (event) => {
          L.DomEvent.stop(event);
          selectRef.current(point.lat, point.lon);
        })
        .addTo(group);
    }

    return () => {
      group.clearLayers();
    };
  }, [tiles, visibleKinds]);

  useEffect(() => {
    const group = reportsRef.current;
    if (!group || !tiles) return;

    group.clearLayers();
    if (!showReports) return;

    const counts = new Map<string, number>();
    for (const report of reports) {
      counts.set(report.zoneId, (counts.get(report.zoneId) ?? 0) + 1);
    }

    const seen = new Set<string>();
    for (const report of reports) {
      if (seen.has(report.zoneId)) continue;
      seen.add(report.zoneId);

      const total = counts.get(report.zoneId) ?? 1;
      L.marker([report.lat, report.lon], { icon: reportIcon(total) })
        .bindTooltip(total === 1 ? "1 report" : `${total} reports`, {
          direction: "top",
          className: "map-label",
        })
        .on("click", (event) => {
          L.DomEvent.stop(event);
          selectRef.current(report.lat, report.lon);
        })
        .addTo(group);
    }

    return () => {
      group.clearLayers();
    };
  }, [tiles, reports, showReports]);

  useEffect(() => {
    const group = searchRef.current;
    if (!group || !tiles) return;

    group.clearLayers();
    if (!searchedPlace) return;

    const position: [number, number] = [searchedPlace.lat, searchedPlace.lon];

    L.circleMarker(position, {
      radius: 6,
      color: SEARCH_COLOR,
      weight: 2,
      fillColor: SEARCH_COLOR,
      fillOpacity: 0.35,
    }).addTo(group);

    L.tooltip({
      permanent: true,
      direction: "bottom",
      className: "map-label map-label-accent",
      offset: [0, 6],
    })
      .setLatLng(position)
      .setContent(searchedPlace.name)
      .addTo(group);

    mapRef.current?.panTo(position);

    return () => {
      group.clearLayers();
    };
  }, [tiles, searchedPlace]);

  if (state.status === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-ink-4">
        Could not load heat tiles. Run scripts/export_web_data.py and refresh.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {tiles ? null : (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-ink-4">
          Loading heat data…
        </div>
      )}
    </div>
  );
}
