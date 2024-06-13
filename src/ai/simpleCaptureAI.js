export function makeSimpleMove(game) {

    var newGameMoves = game.moves({ verbose: true });
    var bestMove = null;
    //use any negative large number
    var bestValue = -9999;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i];
        game.move(newGameMove);

        //take the negative as AI plays as black
        var boardValue = -evaluateBoard(game.board())
        game.undo();
        if(boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = newGameMove
        }
    }

    return game.move(bestMove);

};

var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
};

var getPieceValue = function (piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 35;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};