import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

const SideLink = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-100 sb__link${
          isActive ? " is-active" : ""
        }`
      }
    >
      <FontAwesomeIcon icon={icon} className="mr-2" />
      {label}
    </NavLink>
  );
};

export default SideLink;
