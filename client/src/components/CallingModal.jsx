export default function CallingModal({
  receiver,
  onCancel,
  type,
}) {

  return (

    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">

      <div className="bg-white w-[350px] p-6 rounded-2xl text-center">

        <h2 className="text-2xl font-bold mb-3">
          Calling...
        </h2>

        <p className="text-gray-600 mb-6">
          Calling {receiver?.firstName}
        </p>

        <div className="mb-6">

          {type === "video"
            ? "📹 Video Call"
            : "📞 Audio Call"}

        </div>

        <div className="animate-pulse text-green-600 mb-6">
          Ringing...
        </div>

        <button
          onClick={onCancel}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}