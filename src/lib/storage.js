// src/lib/storage.js
import { supabase } from "./supabaseClient";

const BUCKET = "media";

/** формируем путь: drafts/<uid>|venues/<id>/(images|videos|posters)/<name> */
export function buildPath(kind, base, file) {
  const folder =
    kind === "image" ? "images" : kind === "video" ? "videos" : "posters";
  const ext = (file?.name || "file").split(".").pop().toLowerCase();
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return `${base.replace(/\/+$/, "")}/${folder}/${name}`;
}

export function publicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data?.publicUrl || "" };
}

/** загрузка файла в бакет, возвращает { path, url } (публичный) */
export async function uploadToMedia(path, file) {
  const contentType = file?.type || guessTypeByName(file?.name);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600", contentType });
  if (error) throw error;
  const { url } = publicUrl(path);
  return { path, url };
}

/** перемещение внутри бакета (copy+remove), возвращает { path, url } */
export async function moveInMedia(fromPath, toPath) {
  if (!fromPath || fromPath === toPath) {
    const { url } = publicUrl(toPath || fromPath || "");
    return { path: toPath || fromPath, url };
  }
  const { error } = await supabase.storage.from(BUCKET).copy(fromPath, toPath);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([fromPath]);
  const { url } = publicUrl(toPath);
  return { path: toPath, url };
}

export async function removeFromMedia(path) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

function guessTypeByName(name = "") {
  if (/\.(mp4|webm|mov)$/i.test(name)) return "video/mp4";
  if (/\.(png)$/i.test(name)) return "image/png";
  if (/\.(jpe?g)$/i.test(name)) return "image/jpeg";
  return "application/octet-stream";
}
