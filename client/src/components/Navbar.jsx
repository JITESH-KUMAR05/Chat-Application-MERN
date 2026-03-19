import { useState } from "react";
import { Search, X, LogOut } from "lucide-react"; // Imported 'X' for a clear button
import api from "../services/api";

import logo from "../assets/logo.png";
import profile from "../assets/profile.png";
import { useNavigate } from "react-router";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const setSelectedUser = useMessageStore(state => state.setSelectedUser);
  const currentUser = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.get('/user-api/logout');
      logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearch = async (e) => {
    const text = e.target.value;
    setQuery(text);

    // 1. If input is empty, clear everything and stop
    if (text.trim() === "") {
      setUsers([]);
      return;
    }

    // 2. Fetch data
    setIsLoading(true);
    try {
      let res = await api.get(`/user-api/user?search=${text}`,{withCredentials:true});
    
      // Safely set users, fallback to an empty array if payload is missing
      setUsers(res.data); 
    } catch (err) {
      console.error("Search failed:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to wipe the search bar clean
  const clearSearch = () => {
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#020617] border-b border-blue-900 relative">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Spark Logo" className="w-10 h-10 rounded-full" />
        <span className="text-white font-semibold text-lg">Spark</span>
      </div>

      {/* --- MIDDLE: SEARCH BAR --- */}
      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search users..."
            className="w-[400px] px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          
          {/* Toggle between the Search icon and the 'X' Clear icon */}
          {query ? (
            <X
              size={18}
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 cursor-pointer hover:text-white transition-colors"
            />
          ) : (
            <Search size={18} className="absolute right-3 text-gray-400" />
          )}
        </div>

        {/* --- SEARCH RESULTS DROPDOWN --- */}
        {/* Added z-50 here to fix the overlapping bug! */}
        {query.trim() !== "" && (
          <div className="absolute z-50 top-12 w-full bg-slate-900 rounded-lg shadow-2xl border border-slate-700 max-h-60 overflow-y-auto">
            
            {isLoading ? (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">Searching...</div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0 flex items-center gap-3"
                  onClick={() => {
                     // 1. Tell Zustand this user is active
                     setSelectedUser(user);
                     // 2. Navigate to that chat view
                     navigate(`/chat/${user._id}`, { state: user });
                     // 3. Clear the search dropdown
                     clearSearch(); 
                  }}
                >
                  <img
                    src={user.profilePic || profile}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">
                      {user.firstName} {user.lastName || ""}
                    </span>
                    {user.username && <span className="text-xs text-gray-400">@{user.username}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">No users found.</div>
            )}

          </div>
        )}
      </div>

      {/* --- RIGHT SIDE: PROFILE & LOGOUT --- */}
      <div className="flex items-center gap-4">
        <img
  src={currentUser?.profilePic || profile}
  alt="My Profile"
  onClick={() => navigate("/profile")}
  className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all object-cover"
/>
        {currentUser && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
