// ** React Imports
import { useEffect, useState } from 'react'

// ** Axios Import
import axios from 'axios'

// ** Type Import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const ServerSideNavItems = () => {
  // ** State
  const [menuItems, setMenuItems] = useState<HorizontalNavItemsType>([])

  // Commented out automatic API call to prevent it from running on login
  // useEffect(() => {
  //   axios.get('/api/horizontal-nav/data').then(response => {
  //     const menuArray = response.data

  //     setMenuArray(menuArray)
  //   })
  // }, [])

  return { menuItems }
}

export default ServerSideNavItems
