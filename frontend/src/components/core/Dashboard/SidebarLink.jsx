import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"



export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-8 py-3 text-sm font-medium transition-all duration-300 ${matchRoute(link.path)
        ? "bg-livecode-900/40 text-livecode-300"
        : "text-richblack-300 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.25rem] bg-livecode-400 transition-all duration-300 ${matchRoute(link.path) ? "opacity-100" : "opacity-0"
          }`}
      >
      </span>

      <div className="flex items-center gap-x-2">
        <Icon className="text-lg" />
        <span>{link.name}</span>
      </div>

    </NavLink>
  )
}