/**
 * @typedef {Object} SpriteData
 * @property {number} width
 * @property {number} height
 * @property {[number, number]} origin The point the sprite rotates around, relative to the top left
 *      corner of the image.
 * @property {(Graphics)=>void} draw Function that draws the sprite. The sprite should be translated
 *      so that (0, 0) is at the point it rotates around, and all p5js functions should be called on
 *      the object passed to this function.
 */

/**
 * Data objects used for constructing sprites.
 * @type {Object<string, SpriteData>}
 */
globalThis.SPRITE_DATA = {
    player: {
        width: 92,
        height: 92,
        origin: [31, 46],
        draw: (g) => {
            // Aligning the rects to the center
            g.rectMode(CENTER);
            
            g.stroke("#304250");
            g.strokeWeight(2);
            g.fill("#96a6bc");
            
            g.circle(0, 30, 30); // His right shoulder
            g.circle(0, -30, 30); // His left shoulder
            
            // His right arm
            g.rect(28, 32, 30, 14);
            
            // His left arm
            g.rect(28, -32, 30, 14);
            
            g.circle(0, 0, 60); // His body
            
            // His Right ear
            g.rect(0, 30, 14, 5);
            
            // His left ear
            g.rect(0, -30, 14, 5);
            
            // Arcs on side of body
            g.noFill();
            g.arc(0, -20, 40, 10, 0, 3.15); // Left
            g.arc(0, 20, 40, 10, -3.15, 0); // Right
            
            // Plate line on head
            g.beginShape();
            g.vertex(-23, 17);
            g.bezierVertex(-18, 12, -10, 10, 2, 10);
            g.vertex(10, 0);
            g.vertex(2, -10);
            g.bezierVertex(-10, -10, -18, -12, -23, -17);
            g.endShape();
            
            // Mouth
            g.arc(29, 0, 15, 15, 1.8, -1.8);
            
            // Inside of Mouth
            g.fill("#304250");
            g.arc(29, 0, 7, 7, 1.8, -1.8);
            
            // Color of eyes
            g.fill("#81ff4d");
            
            // His right eye
            g.push();
                g.translate(13, 12);
                g.rotate(0.5);
                
                g.rect(0, 0, 8, 14, 0, 1, 5, 1);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(13, -12);
                g.rotate(-0.5);
                
                g.rect(0, 0, 8, 14, 1, 5, 1, 0);
            g.pop();
            
            // Machine guns on right arm
            g.fill("#d7ebef");
            g.rect(40, 38, 40, 4);
            g.rect(40, 32, 40, 4);
            g.rect(40, 26, 40, 4);
            
            // Machine guns on left arm
            g.fill("#d7ebef");
            g.rect(40, -38, 40, 4);
            g.rect(40, -32, 40, 4);
            g.rect(40, -26, 40, 4);
            
            // Machine gun connecters thingy
            g.fill("#96a6bc");
            
            // Right
            g.rect(28, 32, 8, 20); // Thicker
            g.rect(36, 32, 3, 20); // Thinner
            
            // Left
            g.rect(28, -32, 8, 20); // Thicker
            g.rect(36, -32, 3, 20); // Thinner
            
            // Bolts on right of head
            for (var i = 0; i < 10; i++) {
                g.push();
                    g.translate(0, 30);
                    g.rotate(5.2 + i * 0.25);
                    g.point(0, -15 - sin(-i * 6 * 3) * 5);
                g.pop();
            }
            
            // Bolts on left of head
            for (var i = 0; i < 10; i++) {
                g.push();
                    g.translate(0, -30);
                    g.rotate(2.05 + i * 0.25);
                    
                    g.point(0, -15 - sin(-i * 6 * 3) * 5);
                    
                g.pop();
            }
            
            g.strokeWeight(5);
            for (var i = 0; i < 3; i++) {
                g.line(-5 - i * 7, -2 - i * 2, -5 - i * 7, 2 + i * 2);
            }
            
            g.stroke("#3bb9ef");
            g.strokeWeight(3);
            for (var i = 0; i < 3; i++) {
                g.line(-5 - i * 7, -2 - i * 2, -5 - i * 7, 2 + i * 2);
            }
        }
    },
    gunnerEnemy: {
        width: 120,
        height: 120,
        origin: [60, 60],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Color of metal
            g.fill("#a9a9a9");
            
            // Right arm
            g.rect(35, 3, 16, 30, 0, 0, 10, 0);
            
            // Left arm
            g.rect(-35, 3, 16, 30, 0, 0, 0, 10);
            
            // Shoulders
            g.circle(-30, -20, 30); // Left
            g.circle(30, -20, 30); // Right
            
            // Body
            g.circle(0, -20, 60);
            g.arc(0, -18, 20, 54, -3.2, 0);
            
            // Ears
            g.rect(29, -20, 5, 14); // Right
            g.rect(-30, -20, 5, 14); // Left
            
            // Red
            g.fill("#ff0000");
            
            // Center red thingy
            g.ellipse(0, -18, 20, 11);
            
            // Red dots on right of head
            for (var i = 0; i < 3; i++) {
                g.push();
                    g.translate(5, -28);
                    g.rotate(0.79 + i * 0.36);
                    
                    g.circle(0 + i * 4, -15, 4 + i);
                    
                g.pop();
            }
            
            // Red dots on left of head
            for (var i = 0; i < 3; i++) {
                g.push();
                    g.translate(-5, -28);
                    g.rotate(-0.79 - i * 0.36);
                    
                    g.circle(0 - i * 4, -15, 4 + i);
                    
                g.pop();
            }
            
            // His right eye
            g.push();
                g.translate(-12, -4);
                g.rotate(0.6);
                
                g.rect(0, 0, 14, 8, 0, 1, 1, 5);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(12, -4);
                g.rotate(-0.6);
                
                g.rect(0, 0, 14, 8, 1, 0, 5, 1);
            g.pop();
            
            // Blaster barrol
            g.fill("#f5f5f5");
            
            // Right
            g.rect(33, 29, 8, 20);
            g.rect(38, 20, 8, 30);
            
            // Left
            g.rect(-33, 29, 8, 20);
            g.rect(-38, 20, 8, 30);
            
            // Covers
            g.fill("#a9a9a9");
            g.arc(38, 8, 10, 14, -3.2, 0); // Right
            g.arc(38, 8, 10, 4, 0, 3.2); // Right
            g.arc(-38, 8, 10, 14, -3.2, 0); // left
            g.arc(-38, 8, 10, 4, 0, 3.2); // left
            
        }
    },
    shotgunEnemy: {
        width: 90,
        height: 90,
        origin: [45, 45],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Dark gray
            g.fill("#353535");
            g.rect(-10, -13, 16, 30, 20);
            g.rect(10, -13, 16, 30, 20);
            
            // Ammo box
            g.fill("#696969");
            g.rect(0, 12, 18, 20);
            
            // Barrols
            g.fill("#f5f5f5");
            g.rect(-4, 17, 6, 15);
            g.rect(4, 17, 6, 15);
            
            // Color of metal
            g.fill("#a9a9a9");
            
            // Body
            g.arc(5, 0, 60, 60, -0.92, 1.39); // Right
            g.arc(5, 0, 50, 50, -0.92, -0.02); // Right
            g.arc(-5, 0, 60, 60, 1.76, 4.16); // Left
            g.arc(-5, 0, 50, 50, 3.29, 4.16); // Left
            g.arc(0, 10, 60, 60, -2.10, -0.99); // Center
            g.arc(0, -14, 32, 53, 0, 3.16); // Center
            g.line(6, 13, 10, 29);
            g.line(16, -16, 22, -24);
            g.line(-6, 13, -10, 29);
            g.line(-16, -16, -20, -25);
            
            // Yellow
            g.fill("#ffff00");
            
            // His right eye
            g.push();
                g.translate(-18, 15);
                g.rotate(0.6);
                
                g.rect(0, 0, 14, 8, 0, 1, 1, 5);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(18, 15);
                g.rotate(-0.6);
                
                g.rect(0, 0, 14, 8, 1, 0, 5, 1);
            g.pop();
            
            // Black arc outline
            g.noFill();
            g.stroke("#000000");
            g.strokeWeight(5);
            for (var i = 0; i < 4; i++) {
                g.arc(0, 9 - i * 5, 7 + i * 7, 7 + i * 3, -2.2, -0.9);
            }
            
            // Yellow arcs
            g.stroke("#ffff00");
            g.strokeWeight(2);
            for (var i = 0; i < 4; i++) {
                g.arc(0, 9 - i * 5, 7 + i * 7, 7 + i * 3, -2.2, -0.9);
            }
            
        }
    },
    sniperEnemy: {
        width: 120,
        height: 120,
        origin: [60, 60],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Dark gray
            g.fill("#353535");
            g.rect(25, -10, 15, 50, 3); // Right wheel
            g.rect(-25, -10, 15, 50, 3); // Left wheel
            
            // Color of metal
            g.fill("#708090");
            
            // Right wheel cover
            g.rect(20, -10, 15, 40, 0, 0, 0, 10);
            // Left wheel cover
            g.rect(-19, -10, 15, 40, 0, 0, 10, 0);
            
            // Center circle
            g.circle(0, -15, 40);
            
            // Barrel stand
            g.quad(-10, -27, -5, -20, -5, -8, -10, -8);
            g.quad(10, -27, 5, -20, 5, -8, 10, -8);
            
            // Barrel
            g.rect(0, -3, 18, 10);
            g.rect(-4, 19, 6, 35);
            g.rect(6, 12, 6, 20);
            g.rect(0, 23, 19, 5);
            g.rect(6, 28, 6, 5);
            g.rect(-4, 42, 8, 10);
            
            // Supports
            
            // Right top
            g.push();
                g.translate(26, -26);
                g.rotate(-0.57);
                
                g.circle(20, 0, 10);
                g.rect(10, 0, 20, 6);
                
            g.pop();
            
            // Left top
            g.push();
                g.translate(-25, -26);
                g.rotate(-2.53);
                
                g.circle(20, 0, 10);
                g.rect(10, 0, 20, 6);
                
            g.pop();
            
            // Right bottom
            g.push();
                g.translate(26, 6);
                g.rotate(0.57);
                
                g.circle(20, 0, 10);
                g.rect(10, 0, 20, 6);
                
            g.pop();
            
            // Left bottom
            g.push();
                g.translate(-25, 6);
                g.rotate(2.53);
                
                g.circle(20, 0, 10);
                g.rect(10, 0, 20, 6);
                
            g.pop();
            
            // Screen
            g.fill("#ff00ff");
            g.quad(10, -27, 5, -20, -5, -20, -9, -27);
            
        }
    },
    shieldBuffEnemy: {
        width: 80,
        height: 80,
        origin: [40, 40],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Color of metal
            g.fill("#696969");
            
            // Body
            g.circle(0, 0, 60);
            
            // Armor
            g.fill("#a9a9a9");
            
            for (var i = 0; i < 4; i++) {
                g.push();
                    g.translate(0, 0);
                    g.rotate(0 + i * 1.57);
                    
                    g.arc(5, -5, 60, 60, -1.55, 0);
                    g.line(5, -5, 5, -35);
                    g.line(5, -5, 35, -5);
                    
                g.pop();
            }
            
            // Center
            g.circle(0, 0, 30);
            
            // Blue
            g.fill("#0000ff");
            g.circle(0, 0, 14);
            
            // His right eye
            g.push();
                g.translate(-18, 20);
                g.rotate(0.6);
                
                g.rect(0, 0, 14, 8, 0, 1, 1, 5);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(18, 20);
                g.rotate(-0.6);
                
                g.rect(0, 0, 14, 8, 1, 0, 5, 1);
            g.pop();
            
            // Little dots
            for (var i = 0; i < 4; i++) {
                g.push();
                    g.translate(0, 0);
                    g.rotate(0 + i * 1.57);
                    
                    g.circle(0, -23, 5);
                    
                g.pop();
            }
            
        }
    },
    speedBuffEnemy: {
        width: 80,
        height: 80,
        origin: [40, 40],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Color of metal
            g.fill("#696969");
            
            // Body
            g.circle(0, 0, 60);
            
            // Armor
            g.fill("#a9a9a9");
            
            for (var i = 0; i < 4; i++) {
                g.push();
                    g.translate(0, 0);
                    g.rotate(0 + i * 1.57);
                    
                    g.arc(5, -5, 60, 60, -1.55, 0);
                    g.line(5, -5, 5, -35);
                    g.line(5, -5, 35, -5);
                    
                g.pop();
            }
            
            // Center
            g.circle(0, 0, 30);
            
            // Purple
            g.fill("#8b008b");
            g.circle(0, 0, 14);
            
            // His right eye
            g.push();
                g.translate(-18, 20);
                g.rotate(0.6);
                
                g.rect(0, 0, 14, 8, 0, 1, 1, 5);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(18, 20);
                g.rotate(-0.6);
                
                g.rect(0, 0, 14, 8, 1, 0, 5, 1);
            g.pop();
            
            for (var i = 0; i < 4; i++) {
                g.push();
                    g.translate(0, 0);
                    g.rotate(0 + i * 1.57);
                    
                    g.circle(0, -23, 5);
                    
                g.pop();
            }
            
        }
    },
    pyroTankEnemy: {
        width: 200,
        height: 200,
        origin: [100, 100],
        draw: (g) => {
            
            // Rect alignment
            g.rectMode(CENTER);
            
            // Set up
            g.stroke("#000000");
            g.strokeWeight(2);
            
            // Color of metal
            g.fill("#a9a9a9");
            
            // Right arm
            g.push();
                g.translate(55, 0);
                g.rotate(-0.4);
                
                g.rect(0, 0, 12, 30);
                g.circle(0, 20, 20);
                
            g.pop();
            
            // Left arm
            g.push();
                g.translate(-55, 0);
                g.rotate(0.4);
                
                g.rect(0, 0, 12, 30);
                g.circle(0, 20, 20);
                
            g.pop();
            
            // Tanks
            g.circle(-22, -60, 45); // Left
            g.circle(22, -60, 45); // Right
            
            // Color of armor
            g.fill("#228b22");
            
            // Right tank holder
            g.push();
                g.translate(29, -69);
                g.rotate(0.6);
                
                g.rect(0, 0, 12, 24);
                
            g.pop();
            
            // Left tank holder
            g.push();
                g.translate(-29, -69);
                g.rotate(-0.6);
                
                g.rect(0, 0, 12, 24);
                
            g.pop();
            
            // Shoulders
            g.circle(-40, -30, 40); // Left
            g.circle(40, -30, 40); // Right
            
            // Body
            g.circle(0, -30, 80);
            
            // Ears
            g.rect(-40, -30, 4, 16); // Left
            g.rect(40, -30, 4, 16); // Right
            
            g.noFill();
            // Lines on sides of head
            g.arc(-36, -31, 20, 50, -1, 0); // Left
            g.arc(36, -31, 20, 50, 3.1, 4.3); // Right
            
            // Triangle on forehead
            g.triangle(-14, -24, 0, -11, 14, -24);
            
            // Eye color
            g.fill("#ff8c00");
            
            // His right eye
            g.push();
                g.translate(-16, -11);
                g.rotate(0.8);
                
                g.rect(0, 0, 18, 10, 0, 1, 1, 5);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(16, -11);
                g.rotate(-0.8);
                
                g.rect(0, 0, 18, 10, 1, 0, 5, 1);
            g.pop();
            
            // Mouth lines
            g.line(-5, 3, -5, 8); // Left
            g.line(0, 0, 0, 8); // Center
            g.line(5, 3, 5, 8); // Right
            
            // Vent
            g.fill("#a9a9a9");
            g.rect(0, -43, 40, 25);
            
            // Vent lines
            g.fill("#000000");
            for (var i = 0; i < 4; i++) {
                g.rect(-13 + i * 8.4, -43, 2, 14);
            }
            
            // Tubes
            g.noFill();
            g.strokeWeight(7);
            g.arc(42, 26, 70, 177, -1.5, 0); // Right outline
            g.arc(-42, 26, 70, 177, 3.15, 4.6); // Left outline
            
            g.stroke("#696969");
            g.strokeWeight(3);
            g.arc(42, 26, 70, 177, -1.5, 0); // Right
            g.arc(-42, 26, 70, 177, 3.15, 4.6); // Left
            
            // Reseting the old stroke and strokeWeight
            g.strokeWeight(2);
            g.stroke("#000000");
            
            // Right blaster
            g.fill("#a9a9a9"); // Gray
            g.rect(62, 74, 14, 35);
            g.rect(74, 54, 10, 55);
            
            g.fill("#228b22"); // Green
            g.rect(62, 39, 24, 35);
            g.rect(57, 39, 14, 25);
            
            g.fill("#353535"); // Dark gray
            for (var i = 0; i < 3; i++) {
                g.arc(62, 65 + i * 9, 6, 3, 0, 6); // Barrel holes
            }
            
            // Left blaster
            g.fill("#a9a9a9"); // Gray
            g.rect(-62, 74, 14, 35);
            g.rect(-74, 54, 10, 55);
            
            g.fill("#228b22"); // Green
            g.rect(-62, 39, 24, 35);
            g.rect(-57, 39, 14, 25);
            
            g.fill("#353535"); // Dark gray
            for (var i = 0; i < 3; i++) {
                g.arc(-62, 65 + i * 9, 6, 3, 0, 6); // Barrel holes
            }
            
        }
    }
};