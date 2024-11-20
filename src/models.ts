import { Chess } from "chess.js";

import {
  INPUT_EVENT_TYPE,
  COLOR,
  Chessboard,
  BORDER_TYPE,
} from "cm-chessboard/src/Chessboard.js";

import {
  MARKER_TYPE,
  Markers,
} from "cm-chessboard/src/extensions/markers/Markers.js";
import {
  PROMOTION_DIALOG_RESULT_TYPE,
  PromotionDialog,
} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";

// Custom types
export type Message = {
  text: string;
  user: string;
  createdAt: string;
};

export type WsContext = {
  ws: WebSocket | undefined;
  href: string;
  onMessage: (event: MessageEvent<string>) => void;
  log: (user: string, ...args: Array<string>) => void;
  clear: () => void;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  board: Chessboard;
  game: Chess;
};

// WebSocket related
export function wsConnect(ctx: WsContext) {
  if (ctx.ws) {
    ctx.log("ws", "Closing previous connection before reconnecting…");
    ctx.ws.close();
    ctx.ws = undefined;
    ctx.clear();
  }

  ctx.log("ws", "Connecting to", ctx.href);
  const ws = new WebSocket(ctx.href);

  ws.addEventListener("message", ctx.onMessage);
  ws.addEventListener("open", () => {
    ctx.ws = ws;
    ctx.log("ws", "Connected!");
  });
}
async function makeEngineMove(wsContext: WsContext) {
  console.log("makeEngineMove");

  //  const possibleMoves = chess.moves({ verbose: true });
  const req = {
    action: "onMove",
    fen: wsContext.game.fen(),
  };

  //pgnOutput!.innerText = game.pgn();

  wsContext.send(JSON.stringify(req));
}

const inputHandler = (wsContext: WsContext, event: any) => {
  console.log("inputHandler", event);
  const cboard = event.chessboard;
  if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
    return; // ignore this event
  }
  if (event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
    cboard.removeLegalMovesMarkers();
  }
  if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
    // mark legal moves
    const moves = wsContext.game.moves({
      square: event.squareFrom,
      verbose: true,
    });
    cboard.addLegalMovesMarkers(moves);
    return moves.length > 0;
  } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
    const move = {
      from: event.squareFrom,
      to: event.squareTo,
      promotion: event.promotion,
    };
    const result = wsContext.game.move(move);
    if (result) {
      cboard.state.moveInputProcess.then(() => {
        // wait for the move input process has finished
        //const fen_before_move = wsContext.game.fen();
        cboard.setPosition(wsContext.game.fen(), true).then(() => {
          // update position, maybe castled and wait for animation has finished
          makeEngineMove(wsContext);
        });
      });
    } else {
      // promotion?
      let possibleMoves = wsContext.game.moves({
        square: event.squareFrom,
        verbose: true,
      });
      for (const possibleMove of possibleMoves) {
        if (possibleMove.promotion && possibleMove.to === event.squareTo) {
          cboard.showPromotionDialog(
            event.squareTo,
            COLOR.white,
            (result: any) => {
              console.log("promotion result", result);
              if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                wsContext.game.move({
                  from: event.squareFrom,
                  to: event.squareTo,
                  promotion: result.piece.charAt(1),
                });
                cboard.setPosition(wsContext.game.fen(), true);
                makeEngineMove(wsContext);
              } else {
                // promotion canceled
                cboard.enableMoveInput(inputHandler, COLOR.white);
                cboard.setPosition(wsContext.game.fen(), true);
              }
            }
          );
          return true;
        }
      }
    }
    return result;
  } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
    if (event.legalMove) {
      cboard.disableMoveInput();
    }
  }
};
export async function move_on_board(wsContext: WsContext, move: string) {
  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  wsContext.game.move({ from, to });
  wsContext.board.setPosition(wsContext.game.fen(), true);
  wsContext.board.enableMoveInput(inputHandler, COLOR.white);
}

export const ping = (wsContext: WsContext) => {
  if (!wsContext.ws) return;

  console.log("ws", "Sending ping");
  wsContext.send("ping");
};

export const makeBoard = (): WsContext => {
  const board = new Chessboard(document.getElementById("board"), {
    position: game.fen(),
    assetsUrl: "./node_modules/cm-chessboard/assets/",
    style: {
      borderType: BORDER_TYPE.none,
      pieces: { file: "pieces/staunty.svg" },
      animationDuration: 300,
    },
    orientation: COLOR.white,
    extensions: [
      { class: Markers, props: { autoMarkers: MARKER_TYPE.square } },
      { class: PromotionDialog },
      { class: Accessibility, props: { visuallyHidden: true } },
    ],
  });
  board.enableMoveInput(inputHandler, COLOR.white);
  const wsContext = {
    ws: undefined,
    href: hrefToWs,
    onMessage,
    log,
    clear,
    send: (data) => wsContext.ws?.send(data),
    board: board,
    game: game,
  };

  return wsContext;
};
