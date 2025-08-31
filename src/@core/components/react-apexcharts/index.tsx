// ** React Imports
import React, { useImperativeHandle, useRef, ComponentType } from 'react'

// ** Next Import
import dynamic from 'next/dynamic'

// ! To avoid 'Window is not defined' error
const ReactApexchartsImport = dynamic(
  () => import('react-apexcharts').then(mod => {
    const Component = mod.default
    return React.forwardRef<any, any>((props, ref) => {
      return React.createElement(Component as ComponentType<any>, { ...props, ref })
    })
  }), 
  { 
    ssr: false,
    loading: () => <div>Loading chart...</div>
  }
)

const ReactApexcharts = React.forwardRef<any, any>((props, ref) => {
  return <ReactApexchartsImport {...props} ref={ref} />
})

ReactApexcharts.displayName = 'ReactApexcharts'

export default ReactApexcharts
