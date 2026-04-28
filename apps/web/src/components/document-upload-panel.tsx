"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type DocumentRecord = {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  createdAt: string;
};

type DocumentUploadPanelProps = {
  ownerType: "student" | "staff" | "rto-case";
  ownerId: string;
  documentTypes: string[];
};

const apiOrigin = apiBaseUrl.replace(/\/api$/, "");

export function DocumentUploadPanel({ ownerType, ownerId, documentTypes }: DocumentUploadPanelProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [type, setType] = useState(documentTypes[0] ?? "DOCUMENT");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function loadDocuments() {
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/documents/${ownerType}/${ownerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) setDocuments(await response.json());
  }

  useEffect(() => {
    loadDocuments();
  }, [ownerId, ownerType]);

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("Select a file first.");
      return;
    }

    const token = localStorage.getItem("shiv_suman_token");
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);

    setMessage("Uploading document...");
    const response = await fetch(`${apiBaseUrl}/documents/${ownerType}/${ownerId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      setMessage("Upload failed. Please check file and login.");
      return;
    }

    setFile(null);
    setMessage("Document uploaded.");
    await loadDocuments();
  }

  return (
    <div className="grid gap-4 rounded-md border border-brand-teal/20 bg-brand-mist/40 p-4">
      <form className="grid gap-3 md:grid-cols-[220px_1fr_auto]" onSubmit={uploadDocument}>
        <select className="rounded-md border border-black/15 px-3 py-2" value={type} onChange={(event) => setType(event.target.value)}>
          {documentTypes.map((documentType) => (
            <option key={documentType} value={documentType}>{documentType.replaceAll("_", " ")}</option>
          ))}
        </select>
        <input className="rounded-md border border-black/15 bg-white px-3 py-2" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button className="rounded-md bg-brand-teal px-4 py-2 font-semibold text-white" type="submit">Upload</button>
      </form>
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
      <div className="grid gap-2">
        {documents.map((document) => (
          <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-3 text-sm">
            <div>
              <p className="font-semibold text-brand-ink">{document.type.replaceAll("_", " ")}</p>
              <p className="text-black/55">{document.fileName ?? "Uploaded file"} · {new Date(document.createdAt).toLocaleString()}</p>
            </div>
            <a className="rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal" href={`${apiOrigin}${document.fileUrl}`} target="_blank" rel="noreferrer">
              View
            </a>
          </div>
        ))}
        {!documents.length ? <p className="text-sm text-black/60">No documents uploaded yet.</p> : null}
      </div>
    </div>
  );
}
