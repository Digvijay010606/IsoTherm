import { getSupabase, supabaseReady } from "./supabase";
import { ZONES } from "./realData";
import type { Report, ReportCategoryId } from "./types";

const TABLE = "reports";
const PHOTO_BUCKET = "report-photos";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_DETAIL_LENGTH = 600;

type ReportRow = {
  id: string;
  created_at: string;
  category_id: string;
  detail: string | null;
  zone_id: string;
  lat: number;
  lon: number;
  photo_path: string | null;
};

type SubmitReportInput = {
  categoryId: ReportCategoryId;
  detail: string;
  zoneId: string;
  photo?: File | null;
};

function photoUrl(client: NonNullable<Awaited<ReturnType<typeof getSupabase>>>, path: string | null) {
  if (!path) return null;
  return client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toReport(
  row: ReportRow,
  client: NonNullable<Awaited<ReturnType<typeof getSupabase>>>,
): Report {
  return {
    id: row.id,
    createdAt: row.created_at,
    categoryId: row.category_id as ReportCategoryId,
    detail: row.detail,
    zoneId: row.zone_id,
    lat: row.lat,
    lon: row.lon,
    photoUrl: photoUrl(client, row.photo_path),
  };
}

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return "jpg";
  return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function submitReport(input: SubmitReportInput): Promise<Report> {
  const client = await getSupabase();
  if (!client) throw new Error("Reporting is not configured");

  const zone = ZONES.find((item) => item.id === input.zoneId);
  if (!zone) throw new Error("Unknown zone");

  const photo = input.photo ?? null;
  if (photo) {
    if (!photo.type.startsWith("image/")) throw new Error("Only image files can be attached");
    if (photo.size > MAX_PHOTO_BYTES) throw new Error("That photo is larger than 5 MB");
  }

  const id = crypto.randomUUID();
  let storedPath: string | null = null;

  if (photo) {
    storedPath = `${id}/photo.${fileExtension(photo.name)}`;
    const upload = await client.storage
      .from(PHOTO_BUCKET)
      .upload(storedPath, photo, { contentType: photo.type, upsert: false });
    if (upload.error) throw new Error("The photo could not be uploaded");
  }

  const inserted = await client
    .from(TABLE)
    .insert({
      id,
      category_id: input.categoryId,
      detail: input.detail.trim().slice(0, MAX_DETAIL_LENGTH) || null,
      zone_id: zone.id,
      lat: zone.lat,
      lon: zone.lon,
      photo_path: storedPath,
    })
    .select()
    .single();

  if (inserted.error) throw new Error("The report could not be saved");

  return toReport(inserted.data as ReportRow, client);
}

export async function fetchReports(): Promise<Report[]> {
  const client = await getSupabase();
  if (!client) return [];

  const result = await client
    .from(TABLE)
    .select()
    .order("created_at", { ascending: false })
    .limit(200);

  if (result.error || !result.data) return [];
  return (result.data as ReportRow[]).map((row) => toReport(row, client));
}

export function subscribeToReports(onChange: (reports: Report[]) => void) {
  if (!supabaseReady) return () => {};

  let cancelled = false;
  let unsubscribe = () => {};

  (async () => {
    const client = await getSupabase();
    if (!client || cancelled) return;

    const initial = await fetchReports();
    if (cancelled) return;

    let current = initial;
    onChange(current);

    const channel = client
      .channel("reports-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const incoming = toReport(payload.new as ReportRow, client);
          if (current.some((report) => report.id === incoming.id)) return;
          current = [incoming, ...current];
          onChange(current);
        },
      )
      .subscribe();

    unsubscribe = () => {
      client.removeChannel(channel);
    };
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
