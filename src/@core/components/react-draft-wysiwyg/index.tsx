// ** Next Import
import dynamic from 'next/dynamic'

// ! To avoid 'Window is not defined' error
// @ts-ignore - Bypassing React type conflicts between react-draft-wysiwyg and main React types
const ReactDraftWysiwyg = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false
}) as any

export default ReactDraftWysiwyg
