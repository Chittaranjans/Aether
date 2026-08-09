import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StoredFiles } from '../components/StoredFiles'

export function FilesPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const selected = params.get('file')

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Archives"
        title="Stored weather files"
        description="Every successful ingest appears here. Select a file to open Insights — charts and tables always read from stored objects, not live API chatter."
      />

      <StoredFiles
        selectedFile={selected}
        onSelect={(fileName) => {
          navigate(`/insights/${encodeURIComponent(fileName)}`)
        }}
      />
    </div>
  )
}
