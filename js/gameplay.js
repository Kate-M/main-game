'use strict';
var width = window.innerWidth;
var height = window.innerHeight;


var Wrap = Wrap || {};
Wrap.gameplay = function (game) { };
Wrap.gameplay.prototype = {
    preload: function () {
        //this.candy;
        this.load.crossOrigin = true;
        this.timer = 0;
        this.score = 0;
        /*backgroung*/
        // this.back = this.add.tileSprite(0, 0, "Fon")
        this.back = this.add.sprite(0, 0, "Fon");

        this.back.height = this.world.height;
        if (width > height) {
            this.back.width = this.world.width;
        }
        /*score*/
        this.scoreText = this.add.text(32, 32, 'Score : ' + this.score, { font: "bold 32px SouthPark", fill: "#000" });
        this.scoreText.position.setTo(5);
        /*player*/
        this.player = this.add.sprite(400, -800, "Player");
        this.player.anchor.setTo(0.5);
        this.player.smoothed = false;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(this.player);
        /*bullets*/
        this.bullets = customMethods.newGroup(16, "Bullet");
        /*enemy*/
        this.enemyCreator = new EnemyFactory();
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        //this.latestEnemy = "turkey";

        /*boss*/
        this.boss = this.add.group();
        this.boss.enableBody = true;
        this.boss.physicsBodyType = Phaser.Physics.ARCADE;

        /*move*/
        this.cursor = this.input.keyboard.createCursorKeys();


        /*end of game*/
        this.gameOverMessage = this.add.text(this.game.width * 0.5, this.game.height * 0.5, "Game Over", { font: "bold 100px SouthPark", fill: "crimson" })
        this.gameOverMessage.stroke = "#000000";
        this.gameOverMessage.strokeThickness = 20;
        this.gameOverMessage.setShadow(2, 2, "#DCB8BF", 2, true, true);
        this.gameOverMessage.exists = false;
        this.gameOverMessage.visible = false;
        this.gameOverMessage.anchor.setTo(0.5);

        this.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN, 1, 1);
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
        this.winMessage = this.add.text(this.game.width * 0.5, this.game.height * 0.5, ' ', { font: '84px SouthPark', fill: '#fff' });
        this.winMessage.stroke = "#A0D631";
        this.winMessage.strokeThickness = 16;
        this.winMessage.setShadow(2, 2, "#333333", 2, true, true);
        this.winMessage.anchor.setTo(0.5);
        this.winMessage.visible = false;
        this.winMessage.exists = false;

        /*audio*/
        this.music = this.add.audio('Music', 1, true, true);
        this.music.play('', 0, 1, true);
        this.music.volume = 0.5;
        this.voiceKill = this.add.audio('Killed', 1, true, true);
        this.voiceDamage = this.add.audio('Damage', 1, true, true);
        this.inSmallBoss = this.add.audio('Fight', 1, true, true);
        this.goal = this.add.audio('Goal', 1, true, true);
        this.won = this.add.audio('Won', 1, true, true);
        this.deathSmallBoss = this.add.audio('DeathSmallBoss', 1, true, true);
        this.inBigBoss = this.add.audio('BigBoss', 1, true, true);
        this.bigBossSong = this.add.audio('BigBossSong', 1, true, true);
        this.playerWound = this.add.audio('Wound', 1, true, true);
        this.playerCry = this.add.audio('Cry', 1, true, true);
        this.smallBossVoice = this.add.audio('Laughing', 1, true, true);
        this.eatCandy = this.add.audio('Candy', 1, true, true);
    },
    createEnemies: function () {
        this.latestEnemy = this.enemyCreator.createNext();

        if (this.latestEnemy === "turkey") {
            this.createCreep();
        }
        if (this.latestEnemy === "kenny") {
            this.createSmallBoss();
            this.time.events.add(Phaser.Timer.SECOND * 2, this.createCandy, this);
            this.time.events.add(Phaser.Timer.SECOND * 10, this.disappearanceCandy, this);
        }
        if (this.latestEnemy === "chief") {
            this.time.events.add(Phaser.Timer.SECOND * 2.5, this.createBigBoss, this);
        }
        this.timer = this.time.now + this.game.rnd.integerInRange(150, 1000);
    },
    createCreep: function () {
        var leftEnemyConfig = {
            startPoint: { x: width + 170, y: this.world.randomY * 0.3 + 300 },
            endPoint: { x: -170 }
        };

        var rightEnemyConfig = {
            startPoint: { x: -170, y: this.world.randomY * 0.3 + 300 },
            endPoint: { x: width + 200 }
        };

        var currentConfig;

        if (this.game.rnd.integerInRange(0, 1) == 1) {
            currentConfig = leftEnemyConfig;
        } else {
            currentConfig = rightEnemyConfig;
        };

        var enemy = this.enemies.create(currentConfig.startPoint.x, currentConfig.startPoint.y, 'Enemy');
        enemy.body.mass = 1,
            enemy.animations.add('walk');
        enemy.animations.play('walk', 10, true);

        this.add.tween(enemy).to(currentConfig.endPoint, 5000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        if (enemy.y > 400) {
            enemy.scale.setTo(0.7);
        }
        else if (enemy.y < 400) {
            enemy.scale.setTo(0.4);
        }
    },
    damageEnemy: function (bullet, enemy) {
        bullet.kill();
        enemy.kill();
        this.score++;
        this.scoreText.text = "Score : " + this.score;
        this.goal.play('', 0, 0.75, false);

    },
    createSmallBoss: function () {
        var smallBoss = this.boss.create(width + 5, this.world.randomY * 0.3 + 400, 'SmallBoss');
        smallBoss.animations.add('walk');
        smallBoss.animations.play('walk', 10, true);
        smallBoss.smoothed = false;
        smallBoss.health = 20;
        customMethods.randomMovement(this.player, 1500, smallBoss, 0.37, 2500);
        this.time.events.add(Phaser.Timer.SECOND * 5, soundOfBosses, this);
        function soundOfBosses() {
            if (smallBoss.health > 0) {
                this.smallBossVoice.play('', 0, 0.6, false);
            }
        }
    },
    createBigBoss: function () {
        var bigBoss = this.boss.create(width + 5, this.world.randomY * 0.3 + 400, 'BigBoss');
        bigBoss.animations.add('walk');
        bigBoss.animations.play('walk', 10, true);
        this.add.tween(bigBoss).to({ x: 0 }, 4000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        bigBoss.health = 35;
        customMethods.randomMovement(this.player, 1700, bigBoss, 0.3, 2000);
        bigBoss.smoothed = false;
        this.inBigBoss.play('', 0, 0.75, false);
        this.time.events.add(Phaser.Timer.SECOND * 7, soundOfBosses, this);
        function soundOfBosses() {
            if (bigBoss.health > 0) {
                this.bigBossSong.play('', 0, 0.75, false);
            }
        }
    },

    damageBoss: function (bullet, boss) {
        var bosses = this.boss.getFirstExists();
        bosses.damage(2);
        var health = bosses.health;
        this.score += 2;
        if (bosses.key === 'SmallBoss') {
            if (health <= 0) {
                this.deathSmallBoss.play('', 0, 0.75, false);
            }
        }
        if (bosses.key === 'BigBoss') {

            if (health <= 0) {
                this.endOfGame();
                this.winMessage.exists = true;
                this.winMessage.text = ' You Won, \n Click "R" \n to restart';
                this.winMessage.visible = true;
                this.music.fadeOut(1000);
                this.won.play('', 0, 0.75, true);
                this.won.fadeOut(9000);
                this.candy.kill();
                //this.bosses.kill();
                //this.music.fadeOut(1000);
            }
        }
        bullet.kill();
        this.scoreText.text = "Score : " + this.score;
        this.goal.play('', 0, 0.75, false);
    },
    createCandy: function () {
        this.candy = this.add.sprite(this.world.randomX, this.worldюheight - 5, 'Candy');
        this.add.tween(this.candy).to({ y: 550 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(this.candy);
        this.candy.body.collideWorldBounds = true;
        this.candy.body.collideWorldBounds = true;
        this.add.tween(this.candy).to({ alpha: 0 }, 800, Phaser.Easing.Quadratic.In, true, 7000, 0, false);
    },
    takeCandy: function () {
        this.candy.kill();
        if (this.player.health < 10) {
            this.player.health = 10;
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);
        }
        this.eatCandy.play('', 0, 20, false);
    },
    disappearanceCandy: function () {
        this.candy.kill();
    },
    createPlayer: function () {
        this.player.scale.setTo(0.6);
        this.player.body.mass = 0,
        this.add.tween(this.player).to({ y: 500 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);
        //walk
        this.player.animations.add("WalkUp", [9,10,11], 20, false, true);
        this.player.animations.add("WalkDown", [3,4,2], 20, false, true);
        this.player.animations.add("WalkRight", [3,4,2], 20, false, true);
        this.player.animations.add("WalkLeft", [3,4,2], 20, false, true);
        /*health*/
        this.player.health = this.player.maxHealth = 10;
        this.emptyHB = this.add.sprite((width - 195), 5, "HealthEmpty");
        this.fullHB = this.add.sprite((width - 195), 5, "HealthFull", 1);
        this.life = this.add.sprite((this.emptyHB.x - 15), 15, "Life", 2);
        this.HBRect = new Phaser.Rectangle(0, 0, this.emptyHB.width, this.emptyHB.height);
        this.time.events.add(Phaser.Timer.SECOND * 1, applyBounds, this);
        function applyBounds() {
            this.player.body.collideWorldBounds = true;
        }
    },
    createBullets: function () {
        /*bullet*/
        this.bulletTimer = 0;
        this.bullets.setAll("outOfBoundsKill", true);
        this.bullets.setAll("checkWorldBounds", true);
    },
    damagePlayer: function (player, enemy) {
        if (enemy.key == "Enemy") {
            player.damage(2);
            this.playerWound.play("", 0, 0.5, false);
            this.voiceDamage.play("", 0, 0.5, false);
        }
        if (enemy.key == "SmallBoss") {
            player.damage(3);
        }
        if (enemy.key == "BigBoss") {
            player.damage(10);
        }
        if (!this.game.paused || this.enemies.countLiving() > 0) {
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);
            this.gameOverMessage.exists = (this.player.health <= 0);
        }
        if (this.gameOverMessage.exists) {
            this.endOfGame();
            this.enemies.kill();
            this.playerCry.fadeIn(1000);
        }

    },
    create: function () {
        this.input.mouse.capture = true;
        this.createPlayer();
        this.createBullets();
        this.time.events.add(Phaser.Timer.SECOND * 10, playerStartSound, this);
        function playerStartSound() {
            this.voiceKill.play('', 0, 1, false);
        }

    },
    update: function () {
        //this.back.tilePosition.x -= 0.25;
        this.enemies.sort('y', Phaser.Group.SORT_ASCENDING);
        this.world.bringToTop(this.boss);

        //keyboard
        this.player.body.velocity.setTo(0);
        var upperBound = 450;
        if ((this.cursor.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.UP)) && (this.player.y > upperBound)) {
            this.player.body.velocity.y = -200;
            this.player.animations.play("WalkUp", true);
        }
        else if (this.cursor.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.body.velocity.y = 200;
            this.player.animations.play("WalkDown", true);
        }
        if (this.cursor.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.body.velocity.x = -200;
            this.player.animations.play("WalkLeft", true);
        }
        else if (this.cursor.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.body.velocity.x = 200;
            this.player.animations.play("WalkRight", true);
        }
        else if (this.cursor.right.isDown || this.input.mousePointer.isDown) {
            //this.player.animations.play("WalkRight", true);
            if (this.player.alive) {
                this.fire();
            }
        }
        //sequence of creating enemies
        var shouldWait = this.timer != 0 && this.time.now <= this.timer;
        var currentEnemiesAreDead = this.enemies.countLiving() == 0;
        var noMoreCurrentEnemies = this.enemyCreator.remaining[this.latestEnemy] == 0;

        if (!shouldWait && (!noMoreCurrentEnemies || (noMoreCurrentEnemies && (currentEnemiesAreDead && this.boss.countLiving() === 0)))) {
            this.createEnemies();
        }

        this.physics.arcade.collide(this.player, [this.enemies, this.boss], this.damagePlayer, null, this);
        this.physics.arcade.overlap(this.player, this.candy, this.takeCandy, null, this);
        this.physics.arcade.overlap(this.bullets, this.boss, this.damageBoss, null, this);
        this.physics.arcade.overlap(this.bullets, this.enemies, this.damageEnemy, null, this);

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
    pauseGame: function () {
        this.back.tint = 0xffffff;
        if (!this.gameOverMessage.exists && !this.winMessage.exists) {
            this.game.paused = !this.game.paused;
            this.pauseText.visible = this.unPauseText.visible = this.restartText.visible = this.game.paused;
        }
        if (this.game.paused) {
            this.back.tint = 0xACACAC;
        }
    },
    restartGame: function () {
        this.state.start("Gameplay");
        this.game.paused = false;
    },
    endOfGame: function () {
        this.music.fadeOut(2000);
        this.voiceDamage.stop();
        this.player.kill();
    }
};