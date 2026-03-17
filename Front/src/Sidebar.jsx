import React from 'react'
import { Link } from "react-router-dom"
import {
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsListCheck,
  BsMenuButtonWideFill,
  BsFillGearFill
} from 'react-icons/bs';
import './Style/layout.css';

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
      
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
          <span className='icon_header'>Math Odyssey</span>
        </div>
        <span className='icon close_icon' onClick={OpenSidebar}></span>
      </div>

      <ul className='sidebar-list'>
        
        <li className='sidebar-list-item'>
          <Link to="/">
            <BsGrid1X2Fill className='icon'/> Dashboard
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/niveau">
            <BsFillArchiveFill className='icon'/> Niveau
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/badges">
            <BsFillGrid3X3GapFill className='icon'/> Badges
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/reseaux">
            <BsPeopleFill className='icon'/> Reseaux
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/quests">
            <BsListCheck className='icon'/> Quests
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/reports">
            <BsMenuButtonWideFill className='icon'/> Reports
          </Link>
        </li>

        <li className='sidebar-list-item'>
          <Link to="/setting">
            <BsFillGearFill className='icon'/> Setting
          </Link>
        </li>

      </ul>
    </aside>
  )
}

export default Sidebar
