import { useState } from "react";
import axios from "axios";

export default function ChatPage({ logout }) {

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const searchUser = async () => {
    try {

      const res = await axios.get(
        `http://localhost:4000/user-api/search?name=${search}`
      );

      setUsers(res.data.payload);

    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div className="flex h-screen">

      {/* Sidebar */}

      <div className="w-72 bg-blue-900 text-white p-4">

        <h2 className="text-xl font-bold mb-4">
          Search Users
        </h2>

        <div className="flex mb-4">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username"
            className="flex-1 p-2 text-black rounded-l"
          />

          <button
            onClick={searchUser}
            className="bg-blue-500 px-3 rounded-r"
          >
            Go
          </button>

        </div>

        <div>

          {users.map((user) => (

            <div
              key={user._id}
              className="p-2 border-b border-blue-700"
            >
              {user.name}
            </div>

          ))}

        </div>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>

      {/* Chat Window */}

      <div className="flex-1 bg-slate-100 flex items-center justify-center">

        <h1 className="text-3xl text-gray-600">
          Select a user to start chatting
        </h1>

      </div>

    </div>

  );
}