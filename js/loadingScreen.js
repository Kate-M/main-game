'use strict';
var Wrap = Wrap || {};
Wrap.loadingScreen = function (game) { };
Wrap.loadingScreen.prototype = {
    preload: function () {
        this.load.image("Fon", "images/back.jpg");
        this.load.image('Eric', "images/snow_ball.png");
        this.load.image('Bullet', "images/snow_ball.png");
        this.load.image('HealthFull', "images/health_full.png");
        this.load.image('HealthEmpty', "images/health_empty.png");
        this.load.image('Life', "images/life.png");

        //this.load.image('Enemy', "images/enemy.png");
        this.load.spritesheet('Candy', "images/candy.png", 25, 7);
        this.load.spritesheet('Enemy', 'images/enemy3.png', 165, 200, 10);
        this.load.spritesheet('SmallBoss', "images/small_boss.png", 40, 49,2);
        this.load.spritesheet('BigBoss', "images/big_boss.png", 88, 100);
        this.load.spritesheet("Player", "images/eric.png", 40, 44);
        this.load.spritesheet('Button', "images/button.png", 193, 71);
        
        

        this.load.audio('Music', 'audio/main_music.mp3');
        this.load.audio('Killed', 'audio/die.mp3');
        this.load.audio('Damage', 'audio/damage.mp3');
        this.load.audio('Fight', 'audio/fight.mp3');
        this.load.audio('Wound', 'audio/hit.mp3');
        this.load.audio('DeathLittleBoss', 'audio/kenny.mp3');
        this.load.audio('BigBoss', 'audio/chief.mp3');
        this.load.audio('Cry', 'audio/cry.mp3');
        //x,y, key, index,group -game sprites
        this.logo = this.add.sprite(this.game.width * 0.5, this.game.height * 0.5, "Logo");
        this.emptyBar = this.add.sprite(this.game.width * 0.5, (this.game.height * 0.5) + 123, "LoadingBars");
        this.fullBar = this.add.sprite(this.emptyBar.x, this.emptyBar.y, "LoadingBars", 1);
        this.percentage = this.add.text(this.emptyBar.x, (this.emptyBar.y + 3), "0%", { font: "32px 'SouthPark'", fill: "#000" })

        this.logo.anchor.setTo(0.5); //center
        this.emptyBar.anchor.setTo(0.5);
        this.fullBar.anchor.setTo(0.5);
        this.percentage.anchor.setTo(0.5);

        //this.load.setPreloadSprite(this.fullBar);
    },
    create: function () {
        this.state.start("Gameplay");
    },
    loadUpdate: function () {
        this.percentage.text = this.load.progress + "%", { font: "32px SouthPark", fill: "#000" };
    }
};