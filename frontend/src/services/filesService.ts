// frontend/src/services/filesService.ts

export async function fetchFileText(fileId: string) {
  const res = await fetch(`/api/files/${fileId}/text`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch file text")
  }

  return res.json()
}
