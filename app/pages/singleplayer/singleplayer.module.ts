import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SinglePlayerComponent } from "./singleplayer.component";
import { StateImagePipe } from "~/assets/pipes/state-image.pipe";

const routes: Routes = [
    { path: "", component: SinglePlayerComponent }
];

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes)
    ],
    declarations: [
      SinglePlayerComponent,
      StateImagePipe
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    exports: [
        NativeScriptRouterModule
    ]
})
export class SinglePlayerModule { }
