export default function TeamDetails({
  team,
  selectedMembers,
  toggleTeamStatus,
  deleteTeam,
  isUpdatingStatus,
  isDeleting,
}) {
  return (
    <div className="w-4/12 rounded-lg overflow-hidden border border-gray-300 bg-white">
      <table className="table-auto w-full overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th colSpan={2} className="p-2 text-center text-lg font-bold">
              {team.teamName || "No Name"}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-2 font-semibold">Team Code:</td>
            <td className="p-2 ">{team.teamCode || "N/A"}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="p-2 font-semibold">Team Name:</td>
            <td className="p-2 ">{team.teamName || "N/A"}</td>
          </tr>
          <tr>
            <td className="p-2 font-semibold">Members:</td>
            <td className="p-2">{selectedMembers.length} members</td>
          </tr>
          <tr>
            <td colSpan={2} className="p-2 ">
              <button
                onClick={toggleTeamStatus}
                className={`w-full rounded py-2 text-white flex justify-center items-center ${
                  team.teamStatus === "Active" ? "bg-green-500" : "bg-gray-500"
                }`}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  team.teamStatus || "Active"
                )}
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="p-2 ">
              <button
                onClick={deleteTeam}
                className="w-full bg-red-400 text-white py-2 rounded flex justify-center items-center"
                disabled={isDeleting} // Disable button while deleting
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Delete Team"
                )}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
