import { useLocation } from "react-router-dom";
import type Topbar from "../components/Topbar";

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
    </div>
  );
};

export default SearchPage;
