// this file has classes for 4 different types of collider - point, line, circle, and polygon

/**
 * Internal class for polygon bounding boxes.
 * @class
 */
class BoundingBox {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    w;
    /** @type {number} */
    h;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * Copies the bounding box.
     * @returns {BoundingBox}
     */
    copy() {
        return new BoundingBox(this.x, this.y, this.w, this.h);
    }

    /**
     * @overload
     * Returns whether the bounding box intersects with another bounding box.
     * @param {BoundingBox} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the bounding box intersects with another bounding box.
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {boolean}
     */
    intersects(x, y, w, h) {
        // overload to pass a bounding box
        if (x instanceof BoundingBox) {
            [x, y, w, h] = [x.x, x.y, x.w, x.h];
        }

        return !(
            x > this.x + this.w || x + w < this.x ||
            y > this.y + this.h || y + h < this.y
        );
    }
}

// these use arrow functions so they're (hopefully) inaccessible outside of this file
/**
 * Returns the smallest axis-aligned bounding box for a polygon - this is the smallest non-rotated
 * rectangle that it will fit inside.
 * @param {Vector[]} points
 * @returns {BoundingBox}
 */
const getBBox = (points) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const point of points) {
        if (point.x < minX) { minX = point.x; }
        if (point.x > maxX) { maxX = point.x; }
        if (point.y < minY) { minY = point.y; }
        if (point.y > maxY) { maxY = point.y; }
    }
    return new BoundingBox(minX, minY, maxX - minX, maxY - minY);
};

/**
 * Returns whether a `PointCollider` is on a `LineCollider`.
 * @param {PointCollider} point
 * @param {LineCollider} line
 * @returns {boolean}
 */
const pointOnLine = (point, line) => {
    const d1 = dist(line.start.x, line.start.y, point.x, point.y);
    const d2 = dist(line.end.x, line.end.y, point.x, point.y);
    return d1 + d2 === dist(line.start.x, line.start.y, line.end.x, line.end.y);
};

/**
 * Returns whether a `PointCollider` is inside of a `CircleCollider`.
 * @param {PointCollider} point
 * @param {CircleCollider} circle
 * @returns {boolean}
 */
const pointInCircle = (point, circle) => {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    return dx * dx + dy * dy < circle.radiusSq;
};

/**
 * Returns whether a `PointCollider` is inside of a `PolygonCollider`.
 * @param {PointCollider} point
 * @param {PolygonCollider} polygon
 * @returns {boolean}
 */
const pointInPolygon = (point, polygon) => {
    // This algorithm is actually extremely simple (at least conceptually, the math is still hard).
    // It creates a really long line extending from the point (the direction doesn't matter), then
    // checks whether that line intersects with each edge of the polygon. If the line intersects
    // with an odd number of edges, the point is inside the polygon. That's it!

    let inside = false;
    const points = polygon.getPoints();

    // mildly evil postfix operator hack
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const p1 = points[i], p2 = points[j];
        const rayHit = (
            p1.y > point.y !== p2.y > point.y &&
            point.x < ((p2.x - p1.x) * (point.y - p1.y)) / (p2.y - p1.y) + p1.x
        );

        if (rayHit) {
            // rather than incrementing a counter and then checking whether it's an odd number at
            // the end, it's simpler and slightly faster to just toggle a variable back and forth
            inside = !inside;
        }
    }
    return inside;
};

/**
 * Returns whether two `LineColliders` intersect.
 * @param {Vector} pointA
 * @param {Vector} pointB
 * @param {Vector} pointC
 * @param {Vector} pointD
 * @param {Vector} [intersection] If the lines intersect, this will be set to the point where they
 *      intersect. If the lines don't intersect, it will be set to (0, 0).
 * @returns 
 */
const lineIntersection = (pointA, pointB, pointC, pointD, intersection=null) => {
    const z1 = (pointA.x - pointB.x);
    const z2 = (pointC.x - pointD.x);
    const z3 = (pointA.y - pointB.y);
    const z4 = (pointC.y - pointD.y);
    const dist = z1 * z4 - z3 * z2;

    if (dist === 0) {
        if (intersection !== null) { intersection.set(0, 0); }
        return false;
    }

    const tempA = (pointA.x * pointB.y - pointA.y * pointB.x);
    const tempB = (pointC.x * pointD.y - pointC.y * pointD.x);
    const xCoor = (tempA * z2 - z1 * tempB) / dist;
    const yCoor = (tempA * z4 - z3 * tempB) / dist;
  
    const linesIntersect = !(
        xCoor < min(pointA.x, pointB.x) || xCoor > max(pointA.x, pointB.x) ||
        xCoor < min(pointC.x, pointD.x) || xCoor > max(pointC.x, pointD.x) ||
        yCoor < min(pointA.y, pointB.y) || yCoor > max(pointA.y, pointB.y) ||
        yCoor < min(pointC.y, pointD.y) || yCoor > max(pointC.y, pointD.y)
    );

    if (linesIntersect) {
        if (intersection !== null) { intersection.set(xCoor, yCoor); }
        return true;
    }

    if (intersection !== null) { intersection.set(0, 0); }
    return false;
};

/**
 * Returns the closest point on a line to another point.
 * @param {Vector} lineStart
 * @param {Vector} lineEnd
 * @param {Vector} pos
 */
const getClosestPoint = (lineStart, lineEnd, pos) => {
    const atp = p5.Vector.sub(pos, lineStart);
    const atb = p5.Vector.sub(lineEnd, lineStart);
    const t = constrain(p5.Vector.dot(atp, atb) / atb.magSq(), 0, 1);

    return createVector(lineStart.x + atb.x * t, lineStart.y + atb.y * t);
};

/**
 * Returns whether a line crosses a circle.
 * @param {Vector} lineStart 
 * @param {Vector} lineEnd 
 * @param {Vector} circlePos 
 * @param {number} radius 
 * @param {Vector} closest Will be set to the closest point on the line to the center of the circle.
 * @returns {boolean}
 */
const lineInCircle = (lineStart, lineEnd, circlePos, radius, closest) => {
    // find the closest point on the line to the center of the circle, then just check if it's
    // inside the circle
    closest.set(getClosestPoint(lineStart, lineEnd, circlePos));
    return p5.Vector.sub(closest, circlePos).magSq() < sq(radius);
};

/**
 * Returns whether a `LineCollider` intersects with or is inside of a `PolygonCollider`.
 * @param {LineCollider} line
 * @param {PolygonCollider} polygon
 * @returns {boolean}
 */
const lineInPolygon = (line, polygon) => {
    // check whether the line is completely inside the polygon
    if (pointInPolygon(line.start, polygon) || pointInPolygon(line.end, polygon)) {
        return true;
    }
    
    const points = polygon.getPoints();
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        if (lineIntersection(points[i],  points[j], line.start, line.end)) {
            return true;
        }
    }
    return false;
};

/**
 * Determines if two `CircleColliders` intersect.
 * @param {CircleCollider} circle1
 * @param {CircleCollider} circle2
 * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum translation
 *      vector", which is the shortest vector that will move the first circle completely out of the
 *      other one. If there is no collision, it will be set to (0, 0).
 * @returns {boolean}
 */
const circleToCircleCollide = (circle1, circle2, transVec=null) => {
    // difference between circle centers
    const delta = p5.Vector.sub(circle1.position, circle2.position);
    
    if (delta.magSq() < pow(circle1.radius + circle2.radius, 2)) {
        if (transVec) {
            // hehe method chaining go brrrt
            transVec.set(delta.copy().setMag(circle1.radius + circle2.radius).sub(delta));
        }
        return true;
    }
    
    if (transVec !== null) { transVec.set(0, 0); }
    return false;
};

/**
 * Determines if a `PolygonCollider` intersects with a `CircleCollider`.
 * @param {CircleCollider} circle 
 * @param {PolygonCollider} polygon 
 * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum translation
 *      vector", which is the shortest vector that will move the circle completely out of the
 *      polygon. If there is no collision, this will be set to (0, 0).
 * @param {boolean} [invert=false] If true, `transVec` will be set to the shortest vector that moves
 *      the polygon out of the circle, instead of the vector that moves the circle out of the
 *      polygon.
 * @returns {boolean}
 */
const circleToPolygonCollide = (circle, polygon, transVec=null, invert=false) => {
    const circleBBox = new BoundingBox(
        circle.position.x - circle.radius,
        circle.position.y - circle.radius,
        circle.radius * 2,
        circle.radius * 2
    );
    
    if (!circleBBox.intersects(polygon.getBBox())) {
        if (transVec !== null) { transVec.set(0, 0); }
        return false;
    }
    
    // this collision algorithm won't detect a collision if the circle is completely inside the
    // polygon, so we check for that here
    const pos = circle.position.copy();
    if (pointInPolygon(pos, polygon)) {
        let closestPoint = createVector();
        let closestDistance = Infinity;

        const points = polygon.getPoints();
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const p1 = points[i], p2 = points[j];

            const c = getClosestPoint(p1, p2, circle.position);
            if (c.dist(circle.position) < closestDistance) {
                closestDistance = c.dist(circle.position);
                closestPoint.set(c);
            }
        }

        pos.set(closestPoint);
        if (transVec !== null) {
            const delta = p5.Vector.sub(pos, circle.position);
            delta.setMag(delta.mag() + circle.radius);
            if (invert) {
                delta.set(-delta.x, -delta.y);
            }
            transVec.set(delta);
        }
        return true;
    }

    // check if any of the edges on the polygon intersect the ircle, and find the closest
    // intersection point
    let closest = createVector();
    let closestDistance = Infinity;

    const points = polygon.getPoints();
    for (let i = 0, j = points.length - 1; i < points.length; j = i++ ) {
        const p1 = points[i], p2 = points[j];

        // return true if the edge intersects with the circle, and the intersection point is the
        // closest one found
        const p = createVector();
        if (lineInCircle(p1, p2, pos, circle.radius, p)) {
            const d = p.dist(pos);
            if (d < closestDistance) {
                closestDistance = d;
                closest.set(p);
            }
        }
    }

    if (closestDistance < Infinity) {
        // find a translation vector - if invert is true, the vector moves the polygon out of the
        // circle, otherwise it moves the circle out of the polygon
        if (transVec) {
            let delta = p5.Vector.sub(closest, circle.position);
            let moveDistance = circle.radius - delta.mag();
            delta.setMag(-moveDistance);

            if (invert) {
                delta.set(-delta.x, -delta.y);
            }
            transVec.set(delta);
        }
        return true;
    }
    return false;
};

/**
 * Projects a polygon onto an axis and returns the interval it creates on that axis - think of this
 * as squashing the polygon onto a line, then returning the area it covers.
 * @param {PolygonCollider} polygon
 * @param {Vector} axis
 * @returns {[number, number]}
 */
const projectOntoAxis = (polygon, axis) => {
    let min = Infinity;
    let max = -Infinity;

    // find the minimum and maximum points in the projection -
    // these are the two endpoints of the squashed line
    const points = polygon.getPoints()
    for (const p of points) {
        const projection = p.dot(axis);
        if (projection < min) {
            min = projection;
        }
        if (projection > max) {
            max = projection;
        }
    }

    return [min, max];
};

/**
 * Returns the distance/gap between two intervals - if this is < 0, the intervals overlap.
 * @param {[number, number]} i1 
 * @param {[number, number]} i2 
 * @returns {number}
 */
const intervalDistance = (i1, i2) => {
    if (i1[0] < i2[0]) {
        return i2[0] - i1[1];
    }
    else {
        return i1[0] - i2[1];
    }
};

/**
 * Converts the vertices of a polygon into edge vectors; used for SAT collision.
 * @param {PolygonCollider} polygon 
 * @returns {Vector[]}
 */
const getEdges = (polygon) => {
    const edges = [];
    const points = polygon.getPoints();
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      edges.push(createVector(points[i].x - points[j].x, points[i].y - points[j].y));
    }
    return edges;
};

/**
 * Determines whether two `PolygonColliders` intersect. This implementation uses the "Separating
 * Axis Theorem", which is really just an overly fancy way of saying "If you can draw a line between
 * two things, they don't overlap."
 * @param {PolygonCollider} poly1
 * @param {PolygonCollider} poly2
 * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum translation
 *      vector", which is the shortest vector that will move the first polygon completely out of the
 *      other one. If there is no collision, it will be set to (0, 0).
 * @returns {boolean}
 */
function polygonToPolygonCollide(poly1, poly2, transVec=null) {
    // SAT is really fast relative to other collision algorithms, but "really fast" is still pretty
    // slow compared to the rest of the program. Bounding box checks are *actually* really fast and
    // will rule out a lot of polygons that definitely don't overlap with this one.
    if (!poly1.getBBox().intersects(poly2.getBBox())) {
        if (transVec !== null) { transVec.set(0, 0); }
      return false;
    }

    // find the edges of both polygons and merge them into a single array
    const poly1Edges = getEdges(poly1);
    const poly2Edges = getEdges(poly2);
    const allEdges = poly1Edges.concat(poly2Edges);

    // used for constructing the MTV (the "minimum translation vector", not the weird tv station)
    let mtvLength = Infinity;
    let mtvAxis = createVector(0, 0);

    // build all axes (axes? axises?) and project both polygons onto them
    for (let i = 0; i < allEdges.length; ++i) {
        const edge = allEdges[i];
        const edgeLength = edge.mag();

        // create an axis that is perpendicular to the edge and normalized
        const axis = createVector(-edge.y / edgeLength, edge.x / edgeLength);

        // project both polygons onto the axis
        const proj1 = projectOntoAxis(poly1, axis);
        const proj2 = projectOntoAxis(poly2, axis);

        // polygons are only overlapping if *all* their rojections overlap, so we can immediately
        // return if we find a projection where they don't overlap (this is why SAT is so fast)
        const overlap = intervalDistance(proj1, proj2);
        if (overlap > 0) {
            return false;
        }
        else {
            // update the MTV if this is the smallest overlap found so far
            if (abs(overlap) < mtvLength) {
                mtvLength = abs(overlap);
                if (proj1[0] < proj2[0]) {
                    mtvAxis.set(-axis.x, -axis.y);
                }
                else {
                    mtvAxis.set(axis.x, axis.y);
                }
            }
        }
    }

    // set transVec to the mtv if it isn't null
    if (transVec !== null) {
      transVec.set(p5.Vector.mult(mtvAxis, mtvLength));
    }
    return true;
}

/**
 * A collider for a single point.
 * @class
 */
globalThis.PointCollider = class {
    /** @type {number} */
    x;
    /** @type {number} */
    y;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @overload
     * Returns whether the point is at the same position as another `PointCollider`.
     * @param {PointCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the point is on a `LineCollider`.
     * @param {LineCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the point is inside a `CircleCollider`.
     * @param {CircleCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the point is inside a `PolygonCollider`.
     * @param {PolygonCollider} other
     * @returns {boolean}
     */
    isColliding(other) {
        if (other instanceof PointCollider) {
            return (this.x === other.x && this.y === other.y);
        }
        else if (other instanceof LineCollider) {
            return pointOnLine(this, other);
        }
        else if (other instanceof CircleCollider) {
            return pointInCircle(this, other);
        }
        else if (other instanceof PolygonCollider) {
            return pointInPolygon(this, other);
        }
        else {
            throw new TypeError(
                `[Collider] Invalid argument to isColliding()! (Expected a PointCollider, ` +
                `LineCollider, CircleCollider, or PolygonCollider; recieved "${typeof other}")`
            );
        }
    }

    /**
     * Draws the collider; useful for debugging.
     * @param {color} color
     */
    render(color) {
        noStroke();
        fill(color);
        circle(this.x, this.y, 6);
    }
};

/**
 * A collider for a straight line.
 * @class
 */
globalThis.LineCollider = class {
    /** @type {Vector} */
    start;

    /** @type {Vector} */
    end;

    /**
     * @overload
     * @param {number} startX
     * @param {number} startY
     * @param {number} endX
     * @param {number} endY
     * 
     * @overload
     * @param {Vector} start
     * @param {Vector} end
     */
    constructor(startX, startY, endX, endY) {
        if (startX instanceof p5.Vector && startY instanceof p5.Vector) {
            this.start = startX.copy();
            this.end = startY.copy();
        }
        else {
            this.start = createVector(startX, startY);
            this.end = createVector(endX, endY);
        }
    }

    /**
     * @overload
     * Returns whether a `PointCollider` is on the line.
     * @param {PointCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the line intersects with another `LineCollider`.
     * @param {LineCollider} other
     * @param {Vector} [intersection] If the lines intersect, this will be set to the point where
     *      they intersect. If the lines don't intersect, it will be set to (0, 0).
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the line crosses or is inside of a `CircleCollider`.
     * @param {CircleCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the line crosses or is inside of a `PolygonCollider`.
     * @param {PolygonCollider} other
     * @returns {boolean}
     */
    isColliding(other, intersection=null) {
        if (other instanceof PointCollider) {
            return pointOnLine(other, this);
        }
        else if (other instanceof LineCollider) {
            return lineIntersection(this.start, this.end, other.start, other.end, intersection);
        }
        else if (other instanceof CircleCollider) {
            // lineInCircle() requires a reference to a vector for technical reasons, so we create a
            // throwaway and use that. We don't pass "intersection" because the value it gets set to
            // is useless in this context.
            return lineInCircle(this.start, this.end, other.position, other.radius, createVector());  
        }
        else if (other instanceof PolygonCollider) {
            return lineInPolygon(this, other);
        }
        else {
            throw new TypeError(
                `[Collider] Invalid argument to isColliding()! (Expected a PointCollider, ` +
                `LineCollider, CircleCollider, or PolygonCollider; recieved "${typeof other}")`
            );
        }
    }

    /**
     * Draws the collider; useful for debugging.
     * @param {color} color
     */
    render(color) {
        stroke(color);
        strokeWeight(6);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
};

/**
 * A collider for a circle.
 * @class
 */
globalThis.CircleCollider = class {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    radius;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    /**
     * The radius of the circle squared. Useful for improving performance in some situations.
     * @readonly
     * @type {number}
     */
    get radiusSq() { return this.radius * this.radius; }

    /**
     * The position of the circle as a Vector.
     * @readonly
     * @type {Vector}
     */
    get position() { return createVector(this.x, this.y); }

    /**
     * @overload
     * Returns whether a `PointCollider` is inside the circle.
     * @param {PointCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether a `LineCollider` crosses or is inside of the circle.
     * @param {LineCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the circle intersects with another `CircleCollider`.
     * @param {CircleCollider} other
     * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum
     *      translation vector", which is the shortest vector that will move this circle completely
     *      out of the other one. If there is no collision, it will be set to (0, 0).
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the circle intersects with a `PolygonCollider`.
     * @param {PolygonCollider} other
     * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum
     *      translation vector", which is the shortest vector that will move the circle completely
     *      out of the polygon. If there is no collision, it will be set to (0, 0).
     * @returns {boolean}
     */
    isColliding(other, transVec=null) {
        if (other instanceof PointCollider) {
            return pointInCircle(other, this);
        }
        else if (other instanceof LineCollider) {
            // lineInCircle() requires a reference to a vector for technical reasons, so we create a
            // throwaway and use that. We don't pass transVec because the value it gets set to is
            // useless in this context.
            return lineInCircle(other.start, other.end, this.position, this.radius, createVector());
        }
        else if (other instanceof CircleCollider) {
            return circleToCircleCollide(this, other, transVec);
        }
        else if (other instanceof PolygonCollider) {
            return circleToPolygonCollide(this, other, transVec, false);
        }
        else {
            throw new TypeError(
                `[Collider] Invalid argument to isColliding()! (Expected a PointCollider, ` +
                `LineCollider, CircleCollider, or PolygonCollider; recieved "${typeof other}")`
            );
        }
    }

    /**
     * Draws the collider; useful for debugging.
     * @param {color} color
     */
    render(color) {
        noFill();
        stroke(color);
        strokeWeight(6);
        circle(this.x, this.y, this.radius * 2);
    }
};

/**
 * A collider for a convex polygon.
 * @class
 */
globalThis.PolygonCollider = class {
    /** @type {Vector} */
    #position;

    /** @type {number} */
    #angle;

    /**
     * The polygon's vertices, rotated to the current angle and offset to the current position.
     * @type {Vector[]}
     */
    #points;

    /**
     * The polygon's vertices, rotated to the current angle but not offset to the current position.
     * @type {Vector[]}
     */
    #rotatedPoints;

    /**
     * The polygon's vertices, without any rotation or offset applied.
     * @type {Vector[]}
     */
    #absolutePoints;

    /**
     * The polygon's bounding box, offset to the current position.
     * @type {BoundingBox}
     */
    #bbox;

    /**
     * The polygon's bounding box, without the current position applied.
     * @type {BoundingBox}
     */
    #rotatedBBox;

    /**
     * @param {[number, number][]} points The polygon's vertices, as an array of points. Polygons
     *      must have at least three points.
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    constructor(points, x=0, y=0) {
        this.#position = createVector();
        if (points.length < 3) {
            // normally i'd create some kind of "InvalidArgumentError" class, but that seems
            // overkill for a KA project that has to fit in 1 file
            throw new Error("[Collider] PolygonColliders must have at least three points!");
        }

        // convert vertices to vectors
        this.#points = [];
        this.#rotatedPoints = [];
        this.#absolutePoints = [];

        for (const point of points) {
            this.#points.push(createVector(point[0], point[1]));
            this.#rotatedPoints.push(createVector(point[0], point[1]));
            this.#absolutePoints.push(createVector(point[0], point[1]));
        }

        this.#rotatedBBox = getBBox(this.#rotatedPoints);
        this.#bbox = this.#rotatedBBox.copy();

        // call setPos to update everything
        this.setPos(x, y);
        this.#angle = 0;
    }

    /**
     * Returns the polygon's bounding box.
     * @returns {BoundingBox}
     */
    getBBox() { return this.#bbox.copy(); }

    /**
     * Returns an array of all the polygon's vertices.
     * @returns {Vector[]}
     */
    getPoints() {
        // do some funky stuff to deep copy the array so we don't run into issues if somebody
        // modifies anything in this array
        return this.#points.map(p => p.copy());
    };

    /**
     * Returns the polygon's current position.
     * @returns {Vector}
     */
    getPos() { return this.#position.copy(); }

    /**
     * @overload
     * Sets the polygon's current position.
     * @param {number} x
     * @param {number} y
     * 
     * @overload
     * Sets the polygon's current position.
     * @param {Vector} pos
     */
    setPos(x, y) {
        if (x instanceof p5.Vector) {
            this.#position.set(x);
        }
        else {
            this.#position.set(x, y);
        }

        // the rotated points never have the position applied to them
        for (let i = 0; i < this.#rotatedPoints.length; ++i) {
            this.#points[i].set(p5.Vector.add(this.#rotatedPoints[i], this.#position));
        }

        // also move the bounding box
        this.#bbox.x = this.#rotatedBBox.x + this.#position.x;
        this.#bbox.y = this.#rotatedBBox.y + this.#position.y;
    }

    /**
     * @overload
     * Moves the polygon by some amount.
     * @param {number} x
     * @param {number} y
     * 
     * @overload
     * Moves the polygon by some amount.
     * @param {Vector} pos
     */
    modPos(x, y) {
        if (x instanceof p5.Vector) {
            y = x.y;
            x = x.x;
        }

        this.#position.add(x, y);
        for (const p of this.#points) {
            p.x += x;
            p.y += y;
        }

        this.#bbox.x += x;
        this.#bbox.y += y;
    }

    /**
     * Returns the polygon's current angle.
     * @returns {number}
     */
    getAngle() { return this.#angle; }

    /**
     * Sets the polygon's current angle.
     * @param {number} angle
     */
    setAngle(angle) {
        this.#angle = angle;
        // this is why we have three arrays of points - it's much easier to rotate these and copy
        // them instead of trying to offset by the position
        for (let i = 0; i < this.#absolutePoints.length; ++i) {
            const p = this.#absolutePoints[i].copy();
            p.setHeading(angle + p.heading());
            this.#rotatedPoints[i] = p;
        }

        this.#rotatedBBox = getBBox(this.#rotatedPoints);
        this.#bbox = this.#rotatedBBox.copy();

        // call setPos() to rebuild the main array
        this.setPos(this.#position);
    }

    /**
     * Rotates the polygon by some amount.
     * @param {number} angle
     */
    modAngle(angle) { this.setAngle(this.#angle + angle); }

    /**
     * @overload
     * Returns whether a `PointCollider` is inside the polygon.
     * @param {PointCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether a `LineCollider` crosses or is inside of the polygon.
     * @param {LineCollider} other
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the circle intersects with another `CircleCollider`.
     * @param {CircleCollider} other
     * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum
     *      translation vector", which is the shortest vector that will move the polygon completely
     *      out of the circle. If there is no collision, it will be set to (0, 0).
     * @returns {boolean}
     * 
     * @overload
     * Returns whether the circle intersects with a `PolygonCollider`.
     * @param {PolygonCollider} other
     * @param {Vector} [transVec] If there is a collision, this will be set to the "minimum
     *      translation vector", which is the shortest vector that will move this polygon completely
     *      out of the other one. If there is no collision, it will be set to (0, 0).
     * @returns {boolean}
     */
    isColliding(other, transVec=null) {
        if (other instanceof PointCollider) {
            return pointInPolygon(other, this);
        }
        else if (other instanceof LineCollider) {
            return lineInPolygon(other, this);
        }
        else if (other instanceof CircleCollider) {
            return circleToPolygonCollide(other, this, transVec, true);
        }
        else if (other instanceof PolygonCollider) {
            return polygonToPolygonCollide(this, other, transVec);
        }
        else {
            throw new TypeError(
                `[Collider] Invalid argument to isColliding()! (Expected a PointCollider, ` +
                `LineCollider, CircleCollider, or PolygonCollider; recieved "${typeof other}")`
            );
        }
    }

    /**
     * Draws the collider; useful for debugging.
     * @param {color} color
     */
    render(color) {
        noFill();
        stroke(color);
        
        strokeWeight(3);
        rect(this.#bbox.x, this.#bbox.y, this.#bbox.w, this.#bbox.h);

        strokeWeight(6);
        beginShape();
        for (const p of this.#points) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }
};