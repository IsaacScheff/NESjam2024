export function makeRandomMove(chess) {
    const legalMoves = chess.moves();  // Get all legal moves
    if (legalMoves.length === 0) return null;  // No moves available

    const randomIndex = Math.floor(Math.random() * legalMoves.length);  // Pick a random index
    const move = legalMoves[randomIndex];  // Get the move
    return chess.move(move);  // Make the move and return the move object
}