'use strict';
var width = window.innerWidth;
var height = window.innerHeight;
var score = 0;
var total = 0;
var timer;
var candy;
var Wrap = Wrap || {};
Phaser.Cache.SOUND = 4;
Wrap.gameplay = function (game) { };
Wrap.gameplay.prototype = {
    preload: function () {

        /*backgroung*/
        this.back = this.add.tileSprite(0, 0, width, height, "Fon");
        this.back.position.setTo(0, 0, 1);
        this.back.anchor.setTo(0);

        /*score*/
        this.scoreText = this.add.text(32, 32, 'Score : ' + score, { font: "bold 32px SouthPark", fill: "#000" });
        this.scoreText.position.setTo(5);

        /*enemy*/
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.createEnemies();
        /*boss*/
        this.boss = this.add.group();
        this.boss.enableBody = true;
        this.boss.physicsBodyType = Phaser.Physics.ARCADE;

        /*player*/
        this.player = this.add.sprite(44, 85, "Player");
        this.player.anchor.setTo(0.5);
        // this.player.smoothed = false;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(this.player);
        this.player.body.collideWorldBounds = true;

        this.add.tween(this.player).to({ y: 450 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);
        //this.physics.arcade.gravity.y = 40000;
        //this.physics.arcade.TITLE_BIAS = 32;
        //this.player.body.mass = 40;
        //this.player.body.angularVelocity = 200;
        //this.player.body.bounce.x = 0.35;
        //walk
        this.player.animations.add("WalkRight", [], 5, false, true);

        /*move*/
        this.cursor = this.input.keyboard.createCursorKeys();
        /*bullet*/
        this.bulletTimer = 0;

        this.bullets = customMethods.newGroup(16, "Bullet");
        this.bullets.setAll("outOfBoundsKill", true);
        this.bullets.setAll("checkWorldBounds", true);
        /*health*/
        this.player.health = this.player.maxHealth = 10;
        this.input.keyboard.addKey(Phaser.Keyboard.B).onDown.add(this.damagePlayer, this);
        this.emptyHB = this.add.sprite((width - 195), 5, "HealthEmpty");
        this.fullHB = this.add.sprite((width - 195), 5, "HealthFull", 1);
        this.life = this.add.sprite((this.emptyHB.x - 15), 15, "Life", 2);
        this.HBRect = new Phaser.Rectangle(0, 0, this.emptyHB.width, this.emptyHB.height);
        /*end of game*/
        this.gameOver = this.add.text(this.game.width * 0.5, this.game.height * 0.5, "Game Over", { font: "bold 100px SouthPark", fill: "crimson" })
        this.gameOver.stroke = "#000000";
        this.gameOver.strokeThickness = 20;
        this.gameOver.setShadow(2, 2, "#DCB8BF", 2, true, true);
        this.gameOver.exists = false;
        this.gameOver.visible = false;
        this.gameOver.anchor.setTo(0.5);

        // this.camera.follow(this.player,Phaser.Camera.FOLLOW_TOPDOWN,1,1);
        /*game control*/
        //this.pauseButton = this.add.button(this.game.height * 0.5,(this.game.height * 0.5)-55,"Button",this.pauseGame,this,1, 2, 0);

        this.pauseText = this.add.text(this.game.width * 0.5, (this.game.height * 0.5) - 55, "Pause", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.unPauseText = this.add.text(this.pauseText.x, (this.game.height * 0.5), "P/Esc", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.restartText = this.add.text(this.pauseText.x, (this.game.height * 0.5) + 55, "R-Restart", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.pauseText.visible = this.unPauseText.visible = this.restartText.visible = false;
        this.pauseText.anchor.setTo(0.5);
        this.unPauseText.anchor.setTo(0.5);
        this.restartText.anchor.setTo(0.5);


        this.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(this.pauseGame, this);
        this.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(this.pauseGame, this);
        this.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(this.restartGame, this);



        //won text
        this.stateText = this.add.text(this.game.width * 0.5, this.game.height * 0.5, ' ', { font: '84px SouthPark', fill: '#fff' });
        this.stateText.stroke = "#A0D631";
        this.stateText.strokeThickness = 16;
        this.stateText.setShadow(2, 2, "#333333", 2, true, true);
        this.stateText.anchor.setTo(0.5);
        this.stateText.visible = false;

        /*audio*/
        this.music = this.add.audio('Music', 1, true, true);
        //this.music.play('',0 ,1,true);
        this.music.volume = 0.5;
        this.voiceKill = this.add.audio('Killed', 1, true, true);
        this.voiceDamage = this.add.audio('Damage', 1, true, true);
        this.inLittleBoss = this.add.audio('Fight', 10000, true, true);
        this.deathLittleBoss = this.add.audio('DeathLittleBoss', 10000, true, true);
        this.inBigBoss = this.add.audio('BigBoss', 10000, true, true);
        this.playerWound = this.add.audio('Wound', 1, true, true);
        this.playerCry = this.add.audio('Cry', 1, true, true);


    },
    createEnemies: function () {
        var enemy = this.enemies.create(width + 150, this.world.randomY * 0.3 + 400, 'Enemy');
        var enemy2 = this.enemies.create(- 150, this.world.randomY * 0.3 + 400, 'Enemy');
        enemy.animations.add('walk');
        enemy.animations.play('walk', 10, true);
        enemy2.animations.add('walk');
        enemy2.animations.play('walk', 10, true);
        this.add.tween(enemy).to({ x: width - 1600 }, 50000, Phaser.Easing.Linear.None, true);
        this.add.tween(enemy2).to({ x: width + 1600 }, 50000, Phaser.Easing.Linear.None, true);
        total++;
        timer = this.time.now + 1000;
        enemy.body.moves = enemy2.body.moves = false;
        enemy.body.immovable = enemy2.body.immovable = true;
        enemy.body.collideWorldBounds = enemy2.body.collideWorldBounds = true;

    },
    collisionHandler: function (bullet, enemy) {

        bullet.kill();
        enemy.kill();



        score++;
        this.scoreText.text = "Score : " + score;
        if (this.enemies.countLiving() == 0) {
            this.createLittleBoss();
            console.log(this.player.health);
            this.createCandy();
            this.voiceKill.play("", 0, 0.5, false);
            //this.voiceKill.volume = 0.5;
        }


    },
    createLittleBoss: function () {

        var littleBoss = this.boss.create(width + 5, this.world.randomY * 0.3 + 400, 'LittleBoss');
        littleBoss.animations.add('walk');
        littleBoss.animations.play('walk', 10, true);
        this.add.tween(littleBoss).to({ x: 0 }, 5000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        littleBoss.health = 5;
        littleBoss.body.immovable = true;
        littleBoss.body.collideWorldBounds = true;
        littleBoss.body.bounce.setTo(1, 1);

        this.inLittleBoss.fadeIn(1000);
        this.inLittleBoss.fadeOut(2000);

    },
    createBigBoss: function () {

        var bigBoss = this.boss.create(width + 5, this.world.randomY * 0.4 + 400, 'BigBoss');
        bigBoss.animations.add('walk');
        bigBoss.animations.play('walk', 10, true);
        this.add.tween(bigBoss).to({ x: 0 }, 4000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        bigBoss.health = 10;
        bigBoss.body.immovable = true;
        bigBoss.body.collideWorldBounds = true;
        bigBoss.body.bounce.setTo(1, 1);

        this.inBigBoss.fadeIn(2000);
        this.inBigBoss.fadeOut(2000);

    },

    damageLittleBoss: function (bullet, boss) {
        var bosses = this.boss.getFirstExists();
        if (bosses.key === 'LittleBoss') {
            bosses.damage(2);
            var health = bosses.health;
            score += 2;
            if (health <= 0) {
                this.deathLittleBoss.fadeIn(1200);
                this.createBigBoss();
            }
        }
        if (bosses.key === 'BigBoss') {
            bosses.damage(2);
            var health = bosses.health;
            score += 2;
            if (health <= 0) {
                this.stateText.text = ' You Won, \n Click "R" \n to restart';
                this.player.kill();
                this.stateText.visible = true;
                this.music.fadeOut(1000);
            }
        }
        bullet.kill();


        this.scoreText.text = "Score : " + score;
    },
    createCandy: function () {
        candy = this.add.sprite(200, 450, 'Candy');
        //this.add.tween(candy).to({ y: 550 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(candy);
        candy.body.collideWorldBounds = true;
        // candy.body.moves = false;
        // candy.body.immovable = true;
        candy.body.collideWorldBounds = true;
    },
    takeCandy: function () {
        candy.kill();
        if (this.player.health < 10) {
            this.player.health = 10
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);
        }
    },

    create: function () {
        // this.bg = this.add.tileSprite(0, 0,width,height,"fon")
        this.input.mouse.capture = true;
    },
    update: function () {
        this.back.tilePosition.x -= 0.25;

        //keyboard
        this.player.body.velocity.setTo(0);
        var upperBound = 450;
        if ((this.cursor.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.UP)) && (this.player.y > upperBound)) {
            this.player.body.velocity.y = -200;
        }
        else if (this.cursor.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.body.velocity.y = 200;
        }
        if (this.cursor.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.body.velocity.x = -200;
        }
        else if (this.cursor.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.body.velocity.x = 200;
            this.player.animations.play("WalkRight", true);
        }
        else if (this.cursor.right.isDown || this.input.mousePointer.isDown) {
            this.player.animations.play("WalkRight", true);
            if (this.player.alive) {
                this.fire();
            }
        }
        if (total < 2 && this.time.now > timer) {
            this.createEnemies();
        }
        this.physics.arcade.collide(this.player, [this.enemies, this.boss], this.damagePlayer, null, this);
        this.physics.arcade.overlap(this.player, candy, this.takeCandy, null, this);
        this.physics.arcade.overlap(this.bullets, this.boss, this.damageLittleBoss, null, this);
        this.physics.arcade.overlap(this.bullets, this.enemies, this.collisionHandler, null, this);

    },
    fire: function () {
        if (this.time.now > this.bulletTimer) {
            var bullet = this.bullets.getFirstExists(false, false, this.player.x, this.player.y);
            if (bullet) {
                bullet.angle = this.player.angle + 50;
                this.physics.arcade.moveToPointer(bullet, customValues.bulletProjectileSpeed);
                this.bulletTimer = this.time.now + customValues.playerFireRate;
            }
        }
    },
    damagePlayer: function (a, b) {
        var villains = b.key;
        var player = a;
        if (villains == "Enemy") {
            player.damage(2);
            this.playerWound.play("", 0, 0.5, false);
            this.voiceDamage.play("", 0, 0.5, false);
        }
        if (villains == "LittleBoss") {
            player.damage(4);
        }
        if (villains == "BigBoss") {
            player.damage(10);
        }
        if (!this.game.paused || this.enemies.countLiving() > 0) {
            this.player.y = this.player.y - 40;
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);

            // this.emptyHB.exists = this.fullHB.exists = this.life.exists = (this.player.health > 0);
            this.gameOver.exists = (this.player.health <= 0);

        }
        if (this.gameOver.exists) {
            //this.camera.fade(0x000000,2000,true);
            this.music.fadeOut(2000);
            this.enemies.kill();
            this.voiceDamage.stop();
            this.playerCry.fadeIn(1000);
        }

    },

    pauseGame: function () {
        if (this.enemies.countLiving() > 0 && !this.gameOver.exists) {
            this.game.paused = !this.game.paused;
            this.pauseText.visible = this.unPauseText.visible = this.restartText.visible = this.game.paused;
        }
    },
    restartGame: function () {
        this.state.start("Gameplay");
        this.game.paused = false;
        score = 0;
        this.scoreText.text = "Score : " + score;
    }
};