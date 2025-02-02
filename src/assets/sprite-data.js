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
            g.arc(0, -20, 40, 10, 0, 180); // Left
            g.arc(0, 20, 40, 10, -180, 0); // Right
            
            // Plate line on head
            g.beginShape();
            g.vertex(-23, 17);
            g.bezierVertex(-18, 12, -10, 10, 2, 10);
            g.vertex(10, 0);
            g.vertex(2, -10);
            g.bezierVertex(-10, -10, -18, -12, -23, -17);
            g.endShape();
            
            // Mouth
            g.arc(29, 0, 15, 15, 90, -90);
            
            // Inside of Mouth
            g.fill("#304250");
            g.arc(29, 0, 7, 7, 90, -90);
            
            // Color of eyes
            g.fill("#81ff4d");
            
            // His right eye
            g.push();
                g.translate(13, 12);
                g.rotate(25);
                
                g.rect(0, 0, 8, 14, 0, 1, 5, 1);
            g.pop();
            
            // His left eye
            g.push();
                g.translate(13, -12);
                g.rotate(-25);
                
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
            for (var i = 0; i < 12; i++) {
                g.push();
                    g.translate(0, 30);
                    g.rotate(-67 + i * 12);
                    g.point(0, -15 - sin(-i * 6 * 3) * 5);
                g.pop();
            }
            
            // Bolts on left of head
            for (var i = 0; i < 12; i++) {
                g.push();
                    g.translate(0, -30);
                    g.rotate(113 + i * 12);
                    
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
    }
};