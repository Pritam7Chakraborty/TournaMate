import { useParams } from "react-router-dom";
function TournamentDetailPage(){
    const {tournamentId} = useParams();
    return(
        <div>
            <h2 className="text-3xl font-bold text-pink-500">
                Tournament Details
            </h2>
            <p className="mt-4 text-white">
                 You are viewing the details for tournament ID: {tournamentId}
            </p>
        </div>
    );
}
export default TournamentDetailPage;