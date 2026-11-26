import { useState } from 'react';
import { contentApi } from '../../services/contentApi';

export default function AttachmentDownload({ contentId, fileName }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function download() {
    setPending(true);
    setError(false);
    try {
      const blob = await contentApi.downloadAttachment(contentId);
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <span>
      <button type="button" onClick={download} disabled={pending}
        className="text-sm text-blue-700 underline break-all disabled:opacity-50">
        Descargar {fileName}
      </button>
      {error && <span role="alert" className="block text-xs text-red-600">No se pudo descargar el archivo.</span>}
    </span>
  );
}
