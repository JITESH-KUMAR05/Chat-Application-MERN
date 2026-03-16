export default function Sidebar({ users, selectUser }) {
  return (
    <div className="w-64 bg-[#1b3a8a] text-white h-screen p-4">

      <h2 className="text-xl font-bold mb-4">
        Direct Messages
      </h2>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => selectUser(user)}
          className="cursor-pointer p-2 hover:bg-blue-700 rounded"
        >
          {user.name}
        </div>
      ))}

    </div>
  );
}