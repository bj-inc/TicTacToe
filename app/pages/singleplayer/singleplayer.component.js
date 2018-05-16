"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform = require("platform");
var page_1 = require("ui/page");
var services_1 = require("~/assets/services");
var domain_1 = require("~/assets/domain");
var SinglePlayerComponent = /** @class */ (function () {
    function SinglePlayerComponent(spService, audioService, _page, _navigationService, _popupService) {
        this.spService = spService;
        this.audioService = audioService;
        this._page = _page;
        this._navigationService = _navigationService;
        this._popupService = _popupService;
        // human
        this.huPlayer = "X";
        // ai
        this.aiPlayer = "O";
    }
    SinglePlayerComponent.prototype.ngOnInit = function () {
        this._page.actionBarHidden = true;
        this.makeBoardGridSquared();
    };
    SinglePlayerComponent.prototype.mark = function (square) {
        var _this = this;
        if (!this.spService.sessionGameWon
            && this.spService.board.currentState === domain_1.State.Cross
            && square.state === domain_1.State.Blank) {
            this.audioService.clickSound();
            this.spService.board.mark(square);
            this.updateState(square)
                .then(function () {
                _this.botMark();
            });
        }
    };
    SinglePlayerComponent.prototype.newGame = function (miliSeconds) {
        if (miliSeconds === void 0) { miliSeconds = 2000; }
        this.spService.newGame(miliSeconds);
    };
    Object.defineProperty(SinglePlayerComponent.prototype, "boardSideSpecification", {
        get: function () {
            var specs = [];
            for (var i = 0; i < this.spService.board.boardSize; i++) {
                specs.push('*');
            }
            return specs.join(',');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SinglePlayerComponent.prototype, "gamePanelStateImageVisibility", {
        get: function () {
            return this.spService.gamePanelStateImageVisibility;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SinglePlayerComponent.prototype, "gamePanelCaption", {
        get: function () {
            return this.spService.gamePanelCaption;
        },
        enumerable: true,
        configurable: true
    });
    SinglePlayerComponent.prototype.classOf = function (square) {
        return (square.xPosition + square.yPosition) % 2 == 0 ? 'light-square' : 'dark-square';
    };
    SinglePlayerComponent.prototype.restartDialog = function () {
        var _this = this;
        this._popupService.confirm('Restart', 'Are you sure you want to restart the game?', 'Yes', 'No')
            .then(function (result) {
            if (result) {
                _this.spService.restart();
            }
        });
    };
    SinglePlayerComponent.prototype.updateState = function (square) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var winningIndexes = _this.spService.board.getWinningIndexesFor(square);
            if (winningIndexes) {
                _this.spService.sessionGameWon = true;
                for (var _i = 0, winningIndexes_1 = winningIndexes; _i < winningIndexes_1.length; _i++) {
                    var index = winningIndexes_1[_i];
                    var view = _this.squareViews[index];
                    view.animate({ backgroundColor: new page_1.Color("#BA4A00"), duration: 1000 });
                }
                resolve(_this.newGame(2000));
            }
            else if (_this.spService.board.isDraw) {
                var drawScore = _this.spService.board.drawScore;
                drawScore++;
                _this.spService.board.setDrawScore(drawScore);
                resolve(_this.newGame());
            }
            resolve();
        });
    };
    SinglePlayerComponent.prototype.botMark = function () {
        var _this = this;
        var bestSpot = this.miniMax(this.spService.board.calculateBoard(), this.aiPlayer);
        var foundSquare;
        if (this.shouldUseMiniMax()) {
            foundSquare = this.spService.board.getBestSpot(bestSpot.index);
        }
        else {
            foundSquare = this.spService.foundSquare;
        }
        if (foundSquare && !this.spService.sessionGameWon) {
            setTimeout(function () {
                _this.audioService.clickSound();
                _this.spService.board.mark(foundSquare);
                _this.updateState(foundSquare);
            }, 1000);
        }
    };
    SinglePlayerComponent.prototype.shouldUseMiniMax = function () {
        var array = [5, 5, 5, 95];
        var randomChosenNumber = array[Math.floor(Math.random() * (4 - 0))];
        return randomChosenNumber === 5 ? true : false;
    };
    SinglePlayerComponent.prototype.miniMax = function (newBoard, player) {
        //check which spots are available and store them in an object.
        var availSpots = this.emptyIndexies(newBoard);
        if (this.winning(newBoard, this.huPlayer)) {
            return { score: -10 };
        }
        else if (this.winning(newBoard, this.aiPlayer)) {
            return { score: 10 };
        }
        else if (availSpots.length === 0) {
            return { score: 0 };
        }
        var moves = [];
        for (var i = 0; i < availSpots.length; i++) {
            var move = { index: 0, score: 0 };
            move.index = newBoard[availSpots[i]];
            newBoard[availSpots[i]] = player;
            if (player == this.aiPlayer) {
                var result = this.miniMax(newBoard, this.huPlayer);
                move.score = result.score;
            }
            else {
                var result = this.miniMax(newBoard, this.aiPlayer);
                move.score = result.score;
            }
            //reset the spot to empty
            newBoard[availSpots[i]] = move.index;
            // push the object to the array
            moves.push(move);
        }
        var bestMove = this.checkBestMove(player, moves);
        return moves[bestMove];
    };
    SinglePlayerComponent.prototype.checkBestMove = function (player, moves) {
        var bestMove;
        if (player === this.aiPlayer) {
            var bestScore = -10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        else {
            // else loop over the moves and choose the move with the lowest score
            var bestScore = 10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };
    SinglePlayerComponent.prototype.emptyIndexies = function (board) {
        return board.filter(function (s) { return s != "O" && s != "X"; });
    };
    SinglePlayerComponent.prototype.winning = function (board, player) {
        if ((board[0] == player && board[1] == player && board[2] == player) ||
            (board[3] == player && board[4] == player && board[5] == player) ||
            (board[6] == player && board[7] == player && board[8] == player) ||
            (board[0] == player && board[3] == player && board[6] == player) ||
            (board[1] == player && board[4] == player && board[7] == player) ||
            (board[2] == player && board[5] == player && board[8] == player) ||
            (board[0] == player && board[4] == player && board[8] == player) ||
            (board[2] == player && board[4] == player && board[6] == player)) {
            return true;
        }
        else {
            return false;
        }
    };
    Object.defineProperty(SinglePlayerComponent.prototype, "boardGridView", {
        get: function () {
            return this.boardGrid.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    SinglePlayerComponent.prototype.makeBoardGridSquared = function () {
        var heightOverflow = 120;
        var height = this.screenHeight - heightOverflow;
        var minimumSideDimension = Math.min(this.screenWidth, height);
        this.boardGridView.height = minimumSideDimension;
        this.boardGridView.width = minimumSideDimension;
    };
    Object.defineProperty(SinglePlayerComponent.prototype, "screenWidth", {
        get: function () {
            return platform.screen.mainScreen.widthDIPs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SinglePlayerComponent.prototype, "screenHeight", {
        get: function () {
            return platform.screen.mainScreen.heightDIPs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SinglePlayerComponent.prototype, "squareViews", {
        get: function () {
            return this.squares.map(function (s) { return s.nativeElement; });
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.ViewChild('boardGrid'),
        __metadata("design:type", core_1.ElementRef)
    ], SinglePlayerComponent.prototype, "boardGrid", void 0);
    __decorate([
        core_1.ViewChildren('square'),
        __metadata("design:type", core_1.QueryList)
    ], SinglePlayerComponent.prototype, "squares", void 0);
    SinglePlayerComponent = __decorate([
        core_1.Component({
            selector: "Singleplayer",
            moduleId: module.id,
            templateUrl: "./singleplayer.component.html"
        }),
        __metadata("design:paramtypes", [services_1.SinglePlayerService,
            services_1.AudioService,
            page_1.Page,
            services_1.NavigationService,
            services_1.PopupService])
    ], SinglePlayerComponent);
    return SinglePlayerComponent;
}());
exports.SinglePlayerComponent = SinglePlayerComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlcGxheWVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbmdsZXBsYXllci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBa0c7QUFDbEcsbUNBQXFDO0FBSXJDLGdDQUFzQztBQUV0Qyw4Q0FBdUc7QUFDdkcsMENBQXFFO0FBT3JFO0lBU0UsK0JBQ1MsU0FBOEIsRUFDOUIsWUFBMEIsRUFDekIsS0FBVyxFQUNYLGtCQUFxQyxFQUNyQyxhQUEyQjtRQUo1QixjQUFTLEdBQVQsU0FBUyxDQUFxQjtRQUM5QixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUN6QixVQUFLLEdBQUwsS0FBSyxDQUFNO1FBQ1gsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyxrQkFBYSxHQUFiLGFBQWEsQ0FBYztRQVZyQyxRQUFRO1FBQ0QsYUFBUSxHQUFXLEdBQUcsQ0FBQztRQUM5QixLQUFLO1FBQ0UsYUFBUSxHQUFXLEdBQUcsQ0FBQztJQVExQixDQUFDO0lBRUwsd0NBQVEsR0FBUjtRQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRU0sb0NBQUksR0FBWCxVQUFZLE1BQWM7UUFBMUIsaUJBV0M7UUFWQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYztlQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLEtBQUssY0FBSyxDQUFDLEtBQUs7ZUFDakQsTUFBTSxDQUFDLEtBQUssS0FBSyxjQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNs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Q0FBb0IsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTyx1Q0FBTyxHQUFmLFVBQWdCLEtBQUssRUFBRSxNQUFNO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7WUFDaEUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUNoRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1lBQ2hFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7WUFDaEUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUNoRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1lBQ2hFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7WUFDaEUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2YsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQWFGLHNCQUFZLGdEQUFhO2FBQXpCO1lBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1FBQ3RDLENBQUM7OztPQUFBO0lBRU8sb0RBQW9CLEdBQTVCO1FBQ0UsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO1FBQzNCLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDO1FBQ2xELElBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDO1FBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLG9CQUFvQixDQUFDO0lBQ2xELENBQUM7SUFFRCxzQkFBWSw4Q0FBVzthQUF2QjtZQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDOUMsQ0FBQzs7O09BQUE7SUFFRCxzQkFBWSwrQ0FBWTthQUF4QjtZQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDL0MsQ0FBQzs7O09BQUE7SUFFRCxzQkFBWSw4Q0FBVzthQUF2QjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxhQUFhLEVBQWYsQ0FBZSxDQUFDLENBQUM7UUFDaEQsQ0FBQzs7O09BQUE7SUE3T3VCO1FBQXZCLGdCQUFTLENBQUMsV0FBVyxDQUFDO2tDQUFtQixpQkFBVTs0REFBQztJQUM3QjtRQUF2QixtQkFBWSxDQUFDLFFBQVEsQ0FBQztrQ0FBVSxnQkFBUzswREFBYTtJQUY1QyxxQkFBcUI7UUFMakMsZ0JBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxjQUFjO1lBQ3hCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNuQixXQUFXLEVBQUUsK0JBQStCO1NBQy9DLENBQUM7eUNBV29CLDhCQUFtQjtZQUNoQix1QkFBWTtZQUNsQixXQUFJO1lBQ1MsNEJBQWlCO1lBQ3RCLHVCQUFZO09BZDFCLHFCQUFxQixDQStPakM7SUFBRCw0QkFBQztDQUFBLEFBL09ELElBK09DO0FBL09ZLHNEQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIFZpZXdDaGlsZHJlbiwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gJ3BsYXRmb3JtJztcbmltcG9ydCB7IEdyaWRMYXlvdXQgfSBmcm9tICd1aS9sYXlvdXRzL2dyaWQtbGF5b3V0JztcbmltcG9ydCB7IFN0YWNrTGF5b3V0IH0gZnJvbSAndWkvbGF5b3V0cy9zdGFjay1sYXlvdXQnO1xuaW1wb3J0IHsgRXZlbnREYXRhIH0gZnJvbSAnZGF0YS9vYnNlcnZhYmxlJztcbmltcG9ydCB7IFBhZ2UsIENvbG9yIH0gZnJvbSBcInVpL3BhZ2VcIjtcblxuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UsIFBvcHVwU2VydmljZSwgU2luZ2xlUGxheWVyU2VydmljZSwgQXVkaW9TZXJ2aWNlIH0gZnJvbSBcIn4vYXNzZXRzL3NlcnZpY2VzXCI7XG5pbXBvcnQgeyBCb2FyZCwgTWVudUl0ZW1OYW1lLCBTcXVhcmUsIFN0YXRlIH0gZnJvbSBcIn4vYXNzZXRzL2RvbWFpblwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogXCJTaW5nbGVwbGF5ZXJcIixcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHRlbXBsYXRlVXJsOiBcIi4vc2luZ2xlcGxheWVyLmNvbXBvbmVudC5odG1sXCJcbn0pXG5leHBvcnQgY2xhc3MgU2luZ2xlUGxheWVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZCgnYm9hcmRHcmlkJykgcHVibGljIGJvYXJkR3JpZDogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZHJlbignc3F1YXJlJykgc3F1YXJlczogUXVlcnlMaXN0PEVsZW1lbnRSZWY+O1xuXG4gIC8vIGh1bWFuXG4gIHB1YmxpYyBodVBsYXllcjogc3RyaW5nID0gXCJYXCI7XG4gIC8vIGFpXG4gIHB1YmxpYyBhaVBsYXllcjogc3RyaW5nID0gXCJPXCI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHNwU2VydmljZTogU2luZ2xlUGxheWVyU2VydmljZSxcbiAgICBwdWJsaWMgYXVkaW9TZXJ2aWNlOiBBdWRpb1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBfcGFnZTogUGFnZSxcbiAgICBwcml2YXRlIF9uYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBfcG9wdXBTZXJ2aWNlOiBQb3B1cFNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wYWdlLmFjdGlvbkJhckhpZGRlbiA9IHRydWU7XG4gICAgdGhpcy5tYWtlQm9hcmRHcmlkU3F1YXJlZCgpO1xuICB9XG5cbiAgcHVibGljIG1hcmsoc3F1YXJlOiBTcXVhcmUpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3BTZXJ2aWNlLnNlc3Npb25HYW1lV29uXG4gICAgICAgICYmIHRoaXMuc3BTZXJ2aWNlLmJvYXJkLmN1cnJlbnRTdGF0ZSA9PT0gU3RhdGUuQ3Jvc3NcbiAgICAgICAgJiYgc3F1YXJlLnN0YXRlID09PSBTdGF0ZS5CbGFuaykge1xuICAgICAgdGhpcy5hdWRpb1NlcnZpY2UuY2xpY2tTb3VuZCgpO1xuICAgICAgdGhpcy5zcFNlcnZpY2UuYm9hcmQubWFyayhzcXVhcmUpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZShzcXVhcmUpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmJvdE1hcmsoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5ld0dhbWUobWlsaVNlY29uZHM6IG51bWJlciA9IDIwMDApOiB2b2lkIHtcbiAgICB0aGlzLnNwU2VydmljZS5uZXdHYW1lKG1pbGlTZWNvbmRzKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYm9hcmRTaWRlU3BlY2lmaWNhdGlvbigpOiBzdHJpbmcge1xuICAgIGxldCBzcGVjcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zcFNlcnZpY2UuYm9hcmQuYm9hcmRTaXplOyBpKyspIHtcbiAgICAgIHNwZWNzLnB1c2goJyonKTtcbiAgICB9XG4gXG4gICAgcmV0dXJuIHNwZWNzLmpvaW4oJywnKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZ2FtZVBhbmVsU3RhdGVJbWFnZVZpc2liaWxpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zcFNlcnZpY2UuZ2FtZVBhbmVsU3RhdGVJbWFnZVZpc2liaWxpdHk7XG4gIH1cbiBcbiAgcHVibGljIGdldCBnYW1lUGFuZWxDYXB0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3BTZXJ2aWNlLmdhbWVQYW5lbENhcHRpb247XG4gIH1cblxuICBwdWJsaWMgY2xhc3NPZihzcXVhcmU6IFNxdWFyZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIChzcXVhcmUueFBvc2l0aW9uICsgc3F1YXJlLnlQb3NpdGlvbikgJSAyID09IDAgPyAnbGlnaHQtc3F1YXJlJyA6ICdkYXJrLXNxdWFyZSc7XG4gIH1cblxuICBwdWJsaWMgcmVzdGFydERpYWxvZygpOiB2b2lkIHtcbiAgICB0aGlzLl9wb3B1cFNlcnZpY2UuY29uZmlybSgnUmVzdGFydCcsICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzdGFydCB0aGUgZ2FtZT8nLCAnWWVzJywgJ05vJylcbiAgICAgIC50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgdGhpcy5zcFNlcnZpY2UucmVzdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU3RhdGUoc3F1YXJlOiBTcXVhcmUpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB3aW5uaW5nSW5kZXhlczogbnVtYmVyW10gPSB0aGlzLnNwU2VydmljZS5ib2FyZC5nZXRXaW5uaW5nSW5kZXhlc0ZvcihzcXVhcmUpO1xuXG4gICAgICBpZiAod2lubmluZ0luZGV4ZXMpIHtcbiAgICAgICAgdGhpcy5zcFNlcnZpY2Uuc2Vzc2lvbkdhbWVXb24gPSB0cnVlO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4IG9mIHdpbm5pbmdJbmRleGVzKSB7XG4gICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLnNxdWFyZVZpZXdzW2luZGV4XTtcbiAgICAgICAgICB2aWV3LmFuaW1hdGUoeyBiYWNrZ3JvdW5kQ29sb3I6IG5ldyBDb2xvcihcIiNCQTRBMDBcIiksIGR1cmF0aW9uOiAxMDAwIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXNvbHZlKHRoaXMubmV3R2FtZSgyMDAwKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3BTZXJ2aWNlLmJvYXJkLmlzRHJhdykge1xuICAgICAgICBsZXQgZHJhd1Njb3JlID0gdGhpcy5zcFNlcnZpY2UuYm9hcmQuZHJhd1Njb3JlO1xuICAgICAgICBkcmF3U2NvcmUrKztcbiAgICAgICAgdGhpcy5zcFNlcnZpY2UuYm9hcmQuc2V0RHJhd1Njb3JlKGRyYXdTY29yZSk7XG4gICAgICAgIHJlc29sdmUodGhpcy5uZXdHYW1lKCkpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBib3RNYXJrKCk6IHZvaWQge1xuICAgIGNvbnN0IGJlc3RTcG90ID0gdGhpcy5taW5pTWF4KHRoaXMuc3BTZXJ2aWNlLmJvYXJkLmNhbGN1bGF0ZUJvYXJkKCksIHRoaXMuYWlQbGF5ZXIpO1xuICAgIGxldCBmb3VuZFNxdWFyZTogU3F1YXJlO1xuICAgIFxuICAgIGlmKHRoaXMuc2hvdWxkVXNlTWluaU1heCgpKSB7XG4gICAgICBmb3VuZFNxdWFyZSA9IHRoaXMuc3BTZXJ2aWNlLmJvYXJkLmdldEJlc3RTcG90KGJlc3RTcG90LmluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm91bmRTcXVhcmUgPSB0aGlzLnNwU2VydmljZS5mb3VuZFNxdWFyZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGZvdW5kU3F1YXJlICYmIXRoaXMuc3BTZXJ2aWNlLnNlc3Npb25HYW1lV29uKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdWRpb1NlcnZpY2UuY2xpY2tTb3VuZCgpO1xuICAgICAgICB0aGlzLnNwU2VydmljZS5ib2FyZC5tYXJrKGZvdW5kU3F1YXJlKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShmb3VuZFNxdWFyZSk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9XG4gICAgXG4gIH1cblxuICBwcml2YXRlIHNob3VsZFVzZU1pbmlNYXgoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgYXJyYXk6IG51bWJlcltdID0gWzUsIDUsIDUsIDk1XTtcbiAgICBjb25zdCByYW5kb21DaG9zZW5OdW1iZXI6IG51bWJlciA9IGFycmF5W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICg0LTApKV07XG5cbiAgICByZXR1cm4gcmFuZG9tQ2hvc2VuTnVtYmVyID09PSA1ID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBtaW5pTWF4KG5ld0JvYXJkOiBhbnlbXSwgcGxheWVyOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vY2hlY2sgd2hpY2ggc3BvdHMgYXJlIGF2YWlsYWJsZSBhbmQgc3RvcmUgdGhlbSBpbiBhbiBvYmplY3QuXG4gICAgY29uc3QgYXZhaWxTcG90cyA9IHRoaXMuZW1wdHlJbmRleGllcyhuZXdCb2FyZCk7XG5cbiAgICBpZiAodGhpcy53aW5uaW5nKG5ld0JvYXJkLCB0aGlzLmh1UGxheWVyKSl7XG4gICAgICAgIHJldHVybiB7c2NvcmU6LTEwfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy53aW5uaW5nKG5ld0JvYXJkLCB0aGlzLmFpUGxheWVyKSl7XG4gICAgICByZXR1cm4ge3Njb3JlOjEwfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYXZhaWxTcG90cy5sZW5ndGggPT09IDApe1xuICAgICAgcmV0dXJuIHtzY29yZTowfTtcbiAgICB9XG5cbiAgICBsZXQgbW92ZXM6IGFueVtdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF2YWlsU3BvdHMubGVuZ3RoOyBpKyspe1xuICAgICAgbGV0IG1vdmUgPSB7aW5kZXg6IDAsIHNjb3JlOiAwfTtcbiAgICAgIG1vdmUuaW5kZXggPSBuZXdCb2FyZFthdmFpbFNwb3RzW2ldXTtcblxuICAgICAgbmV3Qm9hcmRbYXZhaWxTcG90c1tpXV0gPSBwbGF5ZXI7XG5cbiAgICAgIGlmIChwbGF5ZXIgPT0gdGhpcy5haVBsYXllcil7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm1pbmlNYXgobmV3Qm9hcmQsIHRoaXMuaHVQbGF5ZXIpO1xuICAgICAgICBtb3ZlLnNjb3JlID0gcmVzdWx0LnNjb3JlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMubWluaU1heChuZXdCb2FyZCwgdGhpcy5haVBsYXllcik7XG4gICAgICAgIG1vdmUuc2NvcmUgPSByZXN1bHQuc2NvcmU7XG4gICAgICB9XG5cbiAgICAgIC8vcmVzZXQgdGhlIHNwb3QgdG8gZW1wdHlcbiAgICAgIG5ld0JvYXJkW2F2YWlsU3BvdHNbaV1dID0gbW92ZS5pbmRleDtcblxuICAgICAgLy8gcHVzaCB0aGUgb2JqZWN0IHRvIHRoZSBhcnJheVxuICAgICAgbW92ZXMucHVzaChtb3ZlKTtcbiAgICB9XG5cbiAgICBjb25zdCBiZXN0TW92ZSA9IHRoaXMuY2hlY2tCZXN0TW92ZShwbGF5ZXIsIG1vdmVzKTtcblxuICAgIHJldHVybiBtb3Zlc1tiZXN0TW92ZV07XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQmVzdE1vdmUocGxheWVyOiBhbnksIG1vdmVzOiBhbnkpOiBhbnkge1xuICAgIGxldCBiZXN0TW92ZTtcblxuICAgIGlmKHBsYXllciA9PT0gdGhpcy5haVBsYXllcil7XG4gICAgICBsZXQgYmVzdFNjb3JlID0gLTEwMDAwO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG1vdmVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYobW92ZXNbaV0uc2NvcmUgPiBiZXN0U2NvcmUpe1xuICAgICAgICAgIGJlc3RTY29yZSA9IG1vdmVzW2ldLnNjb3JlO1xuICAgICAgICAgIGJlc3RNb3ZlID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlbHNlIGxvb3Agb3ZlciB0aGUgbW92ZXMgYW5kIGNob29zZSB0aGUgbW92ZSB3aXRoIHRoZSBsb3dlc3Qgc2NvcmVcbiAgICAgIGxldCBiZXN0U2NvcmUgPSAxMDAwMDtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBtb3Zlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobW92ZXNbaV0uc2NvcmUgPCBiZXN0U2NvcmUpIHtcbiAgICAgICAgICBiZXN0U2NvcmUgPSBtb3Zlc1tpXS5zY29yZTtcbiAgICAgICAgICBiZXN0TW92ZSA9IGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdE1vdmU7XG4gIH1cblxuICBwcml2YXRlIGVtcHR5SW5kZXhpZXMoYm9hcmQ6IGFueVtdKTogYW55W10ge1xuICAgIHJldHVybiBib2FyZC5maWx0ZXIocyA9PiBzICE9IFwiT1wiICYmIHMgIT0gXCJYXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSB3aW5uaW5nKGJvYXJkLCBwbGF5ZXIpe1xuICAgIGlmICgoYm9hcmRbMF0gPT0gcGxheWVyICYmIGJvYXJkWzFdID09IHBsYXllciAmJiBib2FyZFsyXSA9PSBwbGF5ZXIpIHx8XG4gICAgICAgIChib2FyZFszXSA9PSBwbGF5ZXIgJiYgYm9hcmRbNF0gPT0gcGxheWVyICYmIGJvYXJkWzVdID09IHBsYXllcikgfHxcbiAgICAgICAgKGJvYXJkWzZdID09IHBsYXllciAmJiBib2FyZFs3XSA9PSBwbGF5ZXIgJiYgYm9hcmRbOF0gPT0gcGxheWVyKSB8fFxuICAgICAgICAoYm9hcmRbMF0gPT0gcGxheWVyICYmIGJvYXJkWzNdID09IHBsYXllciAmJiBib2FyZFs2XSA9PSBwbGF5ZXIpIHx8XG4gICAgICAgIChib2FyZFsxXSA9PSBwbGF5ZXIgJiYgYm9hcmRbNF0gPT0gcGxheWVyICYmIGJvYXJkWzddID09IHBsYXllcikgfHxcbiAgICAgICAgKGJvYXJkWzJdID09IHBsYXllciAmJiBib2FyZFs1XSA9PSBwbGF5ZXIgJiYgYm9hcmRbOF0gPT0gcGxheWVyKSB8fFxuICAgICAgICAoYm9hcmRbMF0gPT0gcGxheWVyICYmIGJvYXJkWzRdID09IHBsYXllciAmJiBib2FyZFs4XSA9PSBwbGF5ZXIpIHx8XG4gICAgICAgIChib2FyZFsyXSA9PSBwbGF5ZXIgJiYgYm9hcmRbNF0gPT0gcGxheWVyICYmIGJvYXJkWzZdID09IHBsYXllcikpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICB9XG4gICB9XG5cblxuXG5cblxuXG5cblxuXG5cblxuIFxuICBwcml2YXRlIGdldCBib2FyZEdyaWRWaWV3KCk6IEdyaWRMYXlvdXQge1xuICAgIHJldHVybiB0aGlzLmJvYXJkR3JpZC5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBtYWtlQm9hcmRHcmlkU3F1YXJlZCgpOiB2b2lkIHtcbiAgICBjb25zdCBoZWlnaHRPdmVyZmxvdyA9IDEyMDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnNjcmVlbkhlaWdodCAtIGhlaWdodE92ZXJmbG93O1xuICAgIGNvbnN0IG1pbmltdW1TaWRlRGltZW5zaW9uID0gTWF0aC5taW4odGhpcy5zY3JlZW5XaWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLmJvYXJkR3JpZFZpZXcuaGVpZ2h0ID0gbWluaW11bVNpZGVEaW1lbnNpb247XG4gICAgdGhpcy5ib2FyZEdyaWRWaWV3LndpZHRoID0gbWluaW11bVNpZGVEaW1lbnNpb247XG4gIH1cblxuICBwcml2YXRlIGdldCBzY3JlZW5XaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi53aWR0aERJUHM7XG4gIH1cbiBcbiAgcHJpdmF0ZSBnZXQgc2NyZWVuSGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLmhlaWdodERJUHM7XG4gIH1cblxuICBwcml2YXRlIGdldCBzcXVhcmVWaWV3cygpOiBBcnJheTxTdGFja0xheW91dD4ge1xuICAgIHJldHVybiB0aGlzLnNxdWFyZXMubWFwKHMgPT4gcy5uYXRpdmVFbGVtZW50KTtcbiAgfVxufVxuIl19