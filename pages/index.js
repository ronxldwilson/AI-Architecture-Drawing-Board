import dynamic from 'next/dynamic'
const Editor = dynamic(() => import('../components/Editor'), { ssr: false })
import Palette from '../components/Palette'
import PropertyPanel from '../components/PropertyPanel'
import DatasetUploader from '../components/DatasetUploader'
import Toolbar from '../components/Toolbar'

export default function Home() {
  return (
    <>
      <div className="header">
        <h3>AI Architect — Editor</h3>
      </div>
      <div className="container">
        <div className="sidebar left">
          <Toolbar />
          <Palette />
          <div style={{ marginTop: 16 }}>
            <DatasetUploader />
          </div>
        </div>
        <div className="canvas">
          <Editor />
        </div>
        <div className="sidebar right">
          <PropertyPanel />
        </div>
      </div>
    </>
  )
}
