"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var sound = require('nativescript-sound');
var SinglePlayerService = /** @class */ (function () {
    function SinglePlayerService() {
        this.sessionGameWon = false;
        this._clickSound = sound.create('~/assets/sound/click.mp3');
    }
    SinglePlayerService.prototype.clickSound = function () {
        this._clickSound.reset();
        this._clickSound.play();
    };
    SinglePlayerService = __decorate([
        core_1.Injectable()
    ], SinglePlayerService);
    return SinglePlayerService;
}());
exports.SinglePlayerService = SinglePlayerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlcGxheWVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaW5nbGVwbGF5ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUF5QztBQUN6QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUcxQztJQURBO1FBRVMsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFFL0IsZ0JBQVcsR0FBUSxLQUFLLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFNdEUsQ0FBQztJQUpRLHdDQUFVLEdBQWpCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFSVSxtQkFBbUI7UUFEL0IsaUJBQVUsRUFBRTtPQUNBLG1CQUFtQixDQVMvQjtJQUFELDBCQUFDO0NBQUEsQUFURCxJQVNDO0FBVFksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxubGV0IHNvdW5kID0gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LXNvdW5kJyk7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTaW5nbGVQbGF5ZXJTZXJ2aWNlIHtcclxuICBwdWJsaWMgc2Vzc2lvbkdhbWVXb246IGJvb2xlYW4gPSBmYWxzZTtcclxuICBcclxuICBwcml2YXRlIF9jbGlja1NvdW5kOiBhbnkgPSBzb3VuZC5jcmVhdGUoJ34vYXNzZXRzL3NvdW5kL2NsaWNrLm1wMycpO1xyXG5cclxuICBwdWJsaWMgY2xpY2tTb3VuZCgpOiB2b2lkIHtcclxuICAgICAgdGhpcy5fY2xpY2tTb3VuZC5yZXNldCgpO1xyXG4gICAgICB0aGlzLl9jbGlja1NvdW5kLnBsYXkoKTtcclxuICB9XHJcbn0iXX0=