const NOTE_Y = {
    'a': -30,
    'b': -10,
    'c': 10,
    'd': 30
};
const NOTE_COLORS = {
    'a': [0.8, 0, 0],
    'b': [0, 0.8, 0],
    'c': [0, 0, 0.8],
    'd': [0.8, 0, 0.8]
};
const NOTE_COLORS_BRIGHT = {
    'a': [1, 0, 0],
    'b': [0, 1, 0],
    'c': [0, 0, 1],
    'd': [1, 0, 1]
};
const NOTE_NAMES = {
    'A': 'a',
    'B': 'b',
    'C': 'b',
    'D': 'c',
    'E': 'c',
    'F': 'd',
    'G': 'd'
};

const GOAL = 100;
const GOAL_MARGIN = 15;

kaboom.import();

init({
    width: 300,
    height: 300,
    scale: 2
});

loadSprite("title", "assets/title.png");

loadSprite("grandmaster", "assets/grandmaster.png", {
    sliceX: 16,
    sliceY: 1,
    anims: {
        "idle": [0, 15]
    }
});

loadSprite("metalhead", "assets/metalhead.png", {
    sliceX: 16,
    sliceY: 1,
    anims: {
        "idle": [0, 15]
    }
});

loadSprite("futureman", "assets/futureman.png", {
    sliceX: 32,
    sliceY: 1,
    anims: {
        "idle": [0, 31]
    }
});

loadSprite("boss", "assets/boss.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
        "idle": [0, 3]
    }
});

loadSprite("player", "assets/player.png", {
    sliceX: 2,
    sliceY: 1,
    anims: {
        "idle": [0, 1]
    }
});

loadSprite("heart", "assets/heart.png");
loadSprite("backdrop", "assets/backdrop.png");

const typeText = (text, size, delay) => {
    return {
        chars: text.split(""),
        already: '',
        draw() {
            drawText(this.already, {
                pos: this.pos,
                origin: this.origin,
                size,
                width: 250
            });
        },
        update() {
            if (this.chars.length > 0) {
                wait(delay, () => {
                    if (this.chars.length > 0) {
                        this.already += this.chars.shift();
                    }
                });
            }
        }
    };
};

scene("title", () => {
    const title = add([
        sprite("title"),
        scale(0),
        pos(width() / 2, height() / 2)
    ]);
    title.action(() => {
        title.scale = Math.abs(Math.sin(time()) / 2) + 4;
    });

    const play = add([
        text("press space to start", 10),
        pos(width() / 2, height() - 30)
    ]);
    keyPress("space", () => {
        go("intro");
    });
});    

scene("intro", () => {
    const msgs = [
        "since your childhood, you have dreamed of being a musician.",
        "you practice and practiced for years, honing your skills.",
        "you were always the life of the party, playing music for everyone.",
        "but you had dreams of going on to something bigger.",
        "now you have the chance.",
        "you have been invited by the gods of rock to journey up guitar mountain and challenge them!",
        "can you defeat them? or are you not as a good a musician as you thought?",
        "there's only one way to find out."
    ];
    let i = 0;
    let cont;

    const nextMsg = () => {
        const msg = msgs.shift();

        add([
            origin("topleft"),
            typeText(msg, 8, 0.1),
            pos(10, i * 30)
        ]);

        cont = add([
            origin("topleft"),
            text("press space to continue", 8),
            pos(10, i * 30 + 30)
        ]);
    };

    nextMsg();

    keyPress("space", () => {
        if (msgs.length > 0) {
            ++i;
            destroy(cont);
            nextMsg();
        } else {
            go("how");
        }
    });
});

scene("how", () => {
    const msgs = [
        "enemies will shoot notes at you.",
        "use the a, b, c, and d keys to play the notes on your guitar.",
        "notes will turn uppercase and change color when you can play them.",
        "if you play a note too early or too late, you lose a life.",
        "you only have three lives, so be careful!"
    ];
    let i = 0;
    let cont;

    const nextMsg = () => {
        const msg = msgs.shift();

        add([
            origin("topleft"),
            typeText(msg, 8, 0.1),
            pos(10, i * 30)
        ]);

        cont = add([
            origin("topleft"),
            text("press space to continue", 8),
            pos(10, i * 30 + 30)
        ]);
    };

    nextMsg();

    keyPress("space", () => {
        if (msgs.length > 0) {
            ++i;
            destroy(cont);
            nextMsg();
        } else {
            go("click");
        }
    });
});

scene("click", () => {
    add([
        text("please click on\nthis page to continue.", 10),
        pos(width() / 2, height() / 2)
    ]);
    mouseDown(() => {
        Tone.context.resume();
        go("level1-intro");
    });
});

scene("end", () => {
    const msgs = [
        "the gods are... impressed.",
        "you have done well.",
        "they have named you an honorary demigod of guitar!",
        "all of your childhood dreams have come true.",
        "congratulations!",
        "-- a game by sugarfi --"
    ];
    let i = 0;
    let cont;

    const nextMsg = () => {
        const msg = msgs.shift();

        add([
            origin("topleft"),
            typeText(msg, 8, 0.1),
            pos(10, i * 30)
        ]);

        cont = add([
            origin("topleft"),
            text("press space to continue", 8),
            pos(10, i * 30 + 30)
        ]);
    };

    nextMsg();

    keyPress("space", () => {
        if (msgs.length > 0) {
            ++i;
            destroy(cont);
            nextMsg();
        } else {
            go("title");
        }
    });
});

const makeLevel = (levelName, enemySprite, enemySpeed, enemyMax, filename, next, lower, interval, trackNum, sf) => {
    scene(levelName, () => {
        add([
            origin("right"),
            pos(width(), 48),
            sprite("backdrop"),
            scale(1.5)
        ]);
        const enemy = add([
            origin("right"),
            sprite(enemySprite),
            pos(width(), 48),
            scale(1.5)
        ]);
        enemy.frame = 0;
        loop(1 / enemySpeed, () => {
            ++enemy.frame;
            enemy.frame %= enemyMax;
        });
        
        const player = add([
            origin("left"),
            sprite("player"),
            pos(0, height() - 48),
            scale(1.5)
        ]);
        player.frame = 0;
        loop(1 / 4, () => {
            ++player.frame;
            player.frame %= 2;
        });

        add([
            rect(width(), 2),
            pos(width() / 2, height() / 2 - 30),
            color(1, 1, 1)
        ]);

        add([
            rect(width(), 2),
            pos(width() / 2, height() / 2 - 10),
            color(1, 1, 1)
        ]);

        add([
            rect(width(), 2),
            pos(width() / 2, height() / 2 + 10),
            color(1, 1, 1)
        ]);

        add([
            rect(width(), 2),
            pos(width() / 2, height() / 2 + 30),
            color(1, 1, 1)
        ]);

        add([
            rect(5, height()),
            pos(GOAL, height() / 2),
            color(1, 0.5, 0)
        ]);

        let enemyHealth = 3;
        let playerHealth = 3;

        const enemyHearts = [
            add([
                pos(width() - 100, 100),
                scale(1.5),
                sprite("heart")
            ]),
            add([
                pos(width() - 70, 100),
                scale(1.5),
                sprite("heart")
            ]),
            add([
                pos(width() - 40, 100),
                scale(1.5),
                sprite("heart")
            ])
        ];
        enemyHearts.forEach((heart, i) => {
            heart.action(() => {
                if (enemyHealth < (i + 1)) {
                    destroy(heart);
                }
            });
        });

        const playerHearts = [
            add([
                pos(40, height() - 100),
                scale(1.5),
                sprite("heart")
            ]),
            add([
                pos(70, height() - 100),
                scale(1.5),
                sprite("heart")
            ]),
            add([
                pos(100, height() - 100),
                scale(1.5),
                sprite("heart")
            ])
        ];
        playerHearts.forEach((heart, i) => {
            heart.action(() => {
                if (playerHealth < (i + 1)) {
                    destroy(heart);
                }
            });
        });

        let correct = 0;
        const activeNotes = [];
        const speed = 2;
        const notes = [];

        Midi.fromUrl(filename).then(midi => {
            const ac = new AudioContext();
            console.log(midi.tracks);
            midi.tracks.forEach((track, test) => {
                if (track.instrument.name) {
                    Soundfont.instrument(ac, track.instrument.name.replace(/ /g, '_').replace(/[\(\)]/g, ''), {
                        soundfont: sf,
                    }).then(synth => {
                        let recent = [];
                        track.notes.forEach((note, i) => {
                            if (test == trackNum && (i % interval == 0)) {
                                if (!recent.includes(note.time)) {
                                    if (recent.length > 5) {
                                        recent.shift();
                                    }
                                    recent.push(note.time);
                                    Tone.Transport.schedule(time => {
                                        nextNote(NOTE_NAMES[note.name[0]]);
                                    }, note.time);
                                }
                            }
                            Tone.Transport.scheduleOnce(() => {
                                synth.play(note.midi, ac.currentTime, { duration: note.duration });
                            }, note.time);
                        });
                    });
                }
            });

            wait(10, () => {
                Tone.Transport.start();
            });
        });

        const nextNote = (noteVal) => {
            console.log('Next note');

            const note = add([
                color(...NOTE_COLORS[noteVal]),
                text(noteVal, 16),
                pos(width() + 5, height() / 2 + NOTE_Y[noteVal]),
                noteVal
            ]);
            note.action(() => {
                note.move(-speed * 10, 0);
                if (note.pos.x <= -5) {
                    destroy(activeNotes.shift());
                } else if (note.pos.x < (GOAL - (GOAL_MARGIN / 2)) && !note.is('dead')) {
                    note.use('dead');
                    --playerHealth;
                    note.text = note.text.toLowerCase();
                    note.color = rgb(...NOTE_COLORS[noteVal]);
                    if (playerHealth <= 0) {
                        go("game-over");
                    }
                    if (enemyHealth <= 0) {
                        Tone.Transport.stop();
                        Tone.Transport.cancel();
                        go(next);
                    }
                } else if (note.pos.x >= (GOAL - (GOAL_MARGIN / 2)) && note.pos.x <= (GOAL + GOAL_MARGIN)) {
                    note.text = note.text.toUpperCase();
                    note.color = rgb(...NOTE_COLORS_BRIGHT[noteVal]);
                }
            });
            activeNotes.push(note);
        };

        for (let note of ['a', 'b', 'c', 'd']) {
            keyPress(note, () => {
                if (activeNotes.length > 0) {
                    const remove = activeNotes[0];
                    if (remove.is(note) && remove.pos.x >= (GOAL - GOAL_MARGIN) && remove.pos.x <= (GOAL + GOAL_MARGIN)) {
                        ++correct;
                        if (correct >= lower) {
                            --enemyHealth;
                            correct = 0;
                        }
                        destroy(activeNotes.shift());
                    } else {
                        --playerHealth;
                        destroy(activeNotes.shift());
                    }
                }
                    if (playerHealth <= 0) {
                        go("game-over");
                    }
                    if (enemyHealth <= 0) {
                        Tone.Transport.stop();
                        Tone.Transport.cancel();
                        go(next);
                    }
            });
        }
    });
};

scene("game-over", () => {
    Tone.Transport.cancel();
    Tone.Transport.stop();
    add([
        text("game over", 20),
        pos(width() / 2, height() / 2 - 50),
        color(1, 1, 1)
    ]);
    add([
        text("press space to try again", 10),
        pos(width() / 2, height() / 2 + 50),
        color(1, 1, 1)
    ]);
    keyPress("space", () => {
        go("title");
    });
});

makeLevel("level1", "grandmaster", 8, 16, "assets/thats-all.mid", "level2-intro", 20, 4, 3, "FluidR3_GM");
makeLevel("level2", "metalhead", 8, 16, "assets/war-pigs.mid", "level3-intro", 25, 1, 3, "FatBoy");
makeLevel("level3", "futureman", 8, 32, "assets/the-model.mid", "boss-intro", 30, 2, 1, "FluidR3_GM");
makeLevel("boss", "boss", 6, 4, "assets/never-gonna-give-you-up.mid", "end", 40, 2, 15, "FatBoy");

scene("level1-intro", () => {
    const grandmaster = add([
        sprite("grandmaster"),
        pos(width() / 2, height() / 2),
        scale(4)
    ]);
    grandmaster.frame = 0;
    loop(1 / 8, () => {
        ++grandmaster.frame;
        grandmaster.frame %= 16;
    });

    add([
        pos(width() / 2, 10),
        text("level 1", 8)
    ]);
    add([
        pos(width() / 2, height() - 10),
        text("press space to continue", 8)
    ]);

    add([
        pos(width() / 2, 30),
        text("piano", 25)
    ]);
    add([
        pos(width() / 2, 60),
        text("grandmaster", 25)
    ]);

    keyPress("space", () => {
        go("level1");
    });
});

scene("level2-intro", () => {
    add([
        pos(width() / 2, height() / 2),
        rect(width() / 2, 210),
        color(1, 1, 1)
    ]);
    const metalhead = add([
        sprite("metalhead"),
        pos(width() / 2, height() / 2),
        scale(4)
    ]);
    metalhead.frame = 0;
    loop(1 / 8, () => {
        ++metalhead.frame;
        metalhead.frame %= 16;
    });

    add([
        pos(width() / 2, 10),
        text("level 2", 8)
    ]);
    add([
        pos(width() / 2, height() - 10),
        text("press space to continue", 8)
    ]);

    add([
        pos(width() / 2, 30),
        text("metalhead", 25)
    ]);

    keyPress("space", () => {
        go("level2");
    });
});

scene("level3-intro", () => {
    add([
        pos(width() / 2, height() / 2),
        rect(width() / 2, 210),
        color(1, 1, 1)
    ]);
    const futureman = add([
        sprite("futureman"),
        pos(width() / 2, height() / 2),
        scale(4)
    ]);
    futureman.frame = 0;
    loop(1 / 8, () => {
        ++futureman.frame;
        futureman.frame %= 32;
    });

    add([
        pos(width() / 2, 10),
        text("level 3", 8)
    ]);
    add([
        pos(width() / 2, height() - 10),
        text("press space to continue", 8)
    ]);

    add([
        pos(width() / 2, 30),
        text("futureman", 25)
    ]);

    keyPress("space", () => {
        go("level3");
    });
});

scene("boss-intro", () => {
    add([
        pos(width() / 2, height() / 2),
        rect(width() / 2, 210),
        color(1, 1, 1)
    ]);
    const boss = add([
        sprite("boss"),
        pos(width() / 2, height() / 2),
        scale(4)
    ]);
    boss.frame = 0;
    loop(1 / 6, () => {
        ++boss.frame;
        boss.frame %= 4;
    });

    add([
        pos(width() / 2, 10),
        text("final boss", 8)
    ]);
    add([
        pos(width() / 2, height() - 10),
        text("press space to continue", 8)
    ]);

    add([
        pos(width() / 2, 30),
        text("rick astley", 25)
    ]);

    keyPress("space", () => {
        go("boss");
    });
});

start("title");
//start("end");
