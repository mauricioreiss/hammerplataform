import { describe, expect, it } from "vitest";

import { avatarExtensionFor, isOwnAvatarPublicUrl } from "@/lib/avatar-url";

const SUPABASE_URL = "https://abcd.supabase.co";
const USER_ID = "81d0d421-c3d4-4227-af8e-5518b929ccde";
const OTHER_USER_ID = "d51a036b-7e56-434f-8fd1-9ab2eb9e2d86";

describe("isOwnAvatarPublicUrl", () => {
  it.each([
    ["sem cache-buster", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["com cache-buster", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.webp?t=1761840000000"],
  ])("aceita a URL pública do próprio avatar %s", (_scenario, url) => {
    expect(isOwnAvatarPublicUrl({ url, supabaseUrl: SUPABASE_URL, userId: USER_ID })).toBe(true);
  });

  it("aceita quando a URL do Supabase termina com barra", () => {
    const url = "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.png";
    expect(isOwnAvatarPublicUrl({ url, supabaseUrl: "https://abcd.supabase.co/", userId: USER_ID })).toBe(true);
  });

  it.each([
    ["avatar de outro aluno", "https://abcd.supabase.co/storage/v1/object/public/avatars/d51a036b-7e56-434f-8fd1-9ab2eb9e2d86.jpg"],
    ["outro host", "https://evil.example/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["host com prefixo igual", "https://abcd.supabase.co.evil.example/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["outro esquema", "http://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["outro bucket", "https://abcd.supabase.co/storage/v1/object/public/exercicios-illustracoes/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["objeto privado", "https://abcd.supabase.co/storage/v1/object/sign/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["extensão dupla", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.x.jpg"],
    ["extensão maiúscula", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.JPG"],
    ["sem extensão", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde"],
    ["subpasta", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde/x.jpg"],
    ["caminho com ..", "https://abcd.supabase.co/storage/v1/object/public/avatars/../avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg"],
    ["outro parâmetro", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg?t=1&download="],
    ["cache-buster não numérico", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg?t=abc"],
    ["fragmento", "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg#x"],
    ["texto vazio", ""],
  ])("recusa %s", (_scenario, url) => {
    expect(isOwnAvatarPublicUrl({ url, supabaseUrl: SUPABASE_URL, userId: USER_ID })).toBe(false);
  });

  it("recusa o próprio avatar quando o pedido vem de outro aluno", () => {
    const url = "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg";
    expect(isOwnAvatarPublicUrl({ url, supabaseUrl: SUPABASE_URL, userId: OTHER_USER_ID })).toBe(false);
  });

  it("recusa tudo quando a URL do Supabase não está configurada", () => {
    const url = "https://abcd.supabase.co/storage/v1/object/public/avatars/81d0d421-c3d4-4227-af8e-5518b929ccde.jpg";
    expect(isOwnAvatarPublicUrl({ url, supabaseUrl: "", userId: USER_ID })).toBe(false);
  });
});

describe("avatarExtensionFor", () => {
  it.each([
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/gif", "gif"],
    ["image/webp", "webp"],
  ])("usa a extensão minúscula de %s", (mimeType, extension) => {
    expect(avatarExtensionFor(mimeType)).toBe(extension);
  });

  it.each([["image/svg+xml"], ["text/html"], [""]])("recusa o tipo %s", (mimeType) => {
    expect(avatarExtensionFor(mimeType)).toBeNull();
  });
});
