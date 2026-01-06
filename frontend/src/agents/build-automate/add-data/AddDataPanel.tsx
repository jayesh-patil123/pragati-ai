import React, { useContext, useEffect, useRef, useState } from "react"
import axios from "axios"
import { BuildContext } from "../build-context"

export default function AddDataPanel() {
  const ctx = useContext(BuildContext)

  // hooks must run on every render (no early return before hooks)
  const [datasetName, setDatasetName] = useState(() => ctx?.dataset?.name ?? "")
  const [datasetType, setDatasetType] = useState<"text" | "image" | "tabular">(
    () => (ctx?.dataset?.type as "text" | "image" | "tabular") ?? "text"
  )
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  // keep dataset in context when name/type change (only if ctx available)
  useEffect(() => {
    if (!ctx) return
    ctx.setDataset({ name: datasetName, type: datasetType })
    // intentionally not adding ctx to deps beyond the guard; if your BuildContext
    // setter identity changes, consider including `ctx` explicitly.
  }, [datasetName, datasetType, ctx])

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }

  // presign + upload each file, then call backend to register files and create training job
  async function uploadFilesAndStartTraining() {
    if (!datasetName || files.length === 0) {
      alert("Provide dataset name and select files")
      return
    }

    setUploading(true)
    try {
      // 1) ask backend for presigned URLs for each file
      const presignResp = await axios.post("/api/presign", {
        files: files.map((f) => ({ name: f.name, size: f.size, contentType: f.type })),
        datasetName,
        datasetType,
      })
      const presignedList: { url: string; key: string; name: string; method?: string }[] =
        presignResp.data.urls

      // 2) upload each file using the presigned URL (PUT)
      await Promise.all(
        presignedList.map((p) => {
          const file = files.find((f) => f.name === p.name)
          if (!file) return Promise.resolve()
          return axios.put(p.url, file, {
            headers: {
              "Content-Type": file.type,
            },
            // drop the unused param entirely to avoid eslint unused-var
            onUploadProgress: () => {
              // optionally show per-file progress here if you later need it
            },
          })
        })
      )

      // 3) register the uploaded files and start a training job on the backend
      const register = await axios.post("/api/train", {
        datasetName,
        datasetType,
        files: presignedList.map((p) => ({ key: p.key, name: p.name })),
        // additional params: model, hyperparams, autoRetrain etc.
      })

      const job = register.data.jobId as string
      setJobId(job)
      setProgress(0)

      // open SSE to receive job progress (server should stream to /api/train/status/:jobId)
      if (sseRef.current) {
        sseRef.current.close()
      }
      const es = new EventSource(`/api/train/status/${job}`)
      sseRef.current = es
      es.onmessage = (ev) => {
        // server streams JSON or plain progress number
        try {
          const parsed = JSON.parse(ev.data)
          if (parsed.progress !== undefined) setProgress(parsed.progress)
          if (parsed.status === "done") {
            // job finished: add version to context (guard ctx)
            if (ctx) {
              ctx.addVersion({
                version: `v${(ctx.dataset.versions?.length || 0) + 1}.0`,
                records: parsed.records ?? Math.floor(Math.random() * 1000 + 200),
                timestamp: new Date().toLocaleString(),
              })
            }
            setUploading(false)
            // open workflow after a short delay (optional chaining)
            setTimeout(() => ctx?.openPanel?.("workflow-automations"), 350)
          }
        } catch (parseErr) {
          // fallback if server sends a plain number
          const p = Number(ev.data)
          if (!Number.isNaN(p)) setProgress(p)
          else {
            // log parse error for visibility
            console.error("Failed to parse SSE message:", ev.data, parseErr)
          }
        }
      }
      es.onerror = (sseErr) => {
        console.error("SSE error", sseErr)
        es.close()
        sseRef.current = null
        setUploading(false)
      }
    } catch (uploadErr) {
      // ensure the caught error variable is used so eslint doesn't complain
      console.error("Upload/Train error", uploadErr)
      alert("Upload or training start failed. See console.")
      setUploading(false)
    }
  }

  // ensure we render a helpful message if ctx is missing (after hooks were run)
  if (!ctx) {
    return <div className="text-sm text-red-600">Build context not available</div>
  }

  return (
    <section className="w-full rounded-2xl border bg-white p-6 space-y-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">AI Dataset Studio — Upload & Train</h3>
        <p className="text-xs text-gray-600">
          Upload training data (presigned-URL flow), start training jobs and watch live progress.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium">Dataset Name</label>
          <input
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            className="w-full rounded border px-3 py-2 text-xs"
            placeholder="Student Essay Classifier"
          />
        </div>
        <div>
          <label className="text-xs font-medium">Dataset Type</label>
          <select
            value={datasetType}
            onChange={(e) =>
              setDatasetType(e.target.value as "text" | "image" | "tabular")
            }
            className="w-full rounded border px-3 py-2 text-xs"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="tabular">Tabular</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-gray-50 p-3">
        <label className="text-xs font-medium">Files</label>
        <input type="file" multiple onChange={onFilesSelected} className="mt-2 text-xs" />
        <div className="mt-2 text-xs text-slate-600">
          {files.length === 0 ? (
            <span>No files selected</span>
          ) : (
            <div>{files.map((f) => <div key={f.name}>{f.name} — {(f.size / 1024).toFixed(1)} KB</div>)}</div>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={uploadFilesAndStartTraining}
          disabled={uploading || files.length === 0}
          className="rounded-full bg-black text-grey px-4 py-2 text-xs disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload & Start Training"}
        </button>

        <button
          onClick={() => {
            setFiles([])
            setProgress(null)
          }}
          className="rounded-full border px-3 py-2 text-xs"
        >
          Reset
        </button>

        <div className="text-xs text-slate-600">
          Job: <span className="font-semibold">{jobId ?? "—"}</span>
        </div>
      </div>

      <div className="rounded-xl border p-3 bg-white text-xs">
        <p className="font-semibold">Live Progress</p>
        {progress === null ? (
          <p className="text-slate-500">No active job</p>
        ) : (
          <div className="mt-2">
            <div className="text-[11px]">Progress: {Math.round(progress)}%</div>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded">
              <div
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                className="h-full bg-slate-900 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}