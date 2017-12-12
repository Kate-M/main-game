'use strict';
var Wrap = Wrap || {};
Wrap.launcher = function (game) { };
Wrap.launcher.prototype = {
    init: function () {
        this.game.input.maxPointers = 1;//mobile
        this.game.stage.disableVisibilityChange = true;//map
        this.game.renderer.renderSession.roundPixels = true;//round sprite
        this.game.stage.backgroundColor = "#016F4A";

    },
    preload: function () {
        this.load.image("Logo", "images/logo.png");
        this.load.spritesheet("LoadingBars", "images/load1.png", 256);//для прогресса загрузки
    },
    create: function () {
        this.state.start("LoadingScreen");
    }

};