import { SPECS, BCAbstractRobot } from 'battlecode';

function attackFirst(self) {
  // Get all visible robots within the robots vision radius
  const visibleRobots = self.getVisibleRobots();
  // Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range
  const listLength = visibleRobots.length;
  // let x = 0; // keep track of number of robots in attackableRobots array
  let i;
  const robotToAttack = new Array(2);
  let priorityRobot = -1;
  for (i = 0; i < listLength; ++i) {
    const rob = visibleRobots[i];
    // Check if the robot just showed up because of radio broadcast
    if (!self.isVisible(rob)) {
      continue;
    }
    // Check if robot is friendly
    if (self.me.team === rob.team) {
      continue;
    }
    self.log('ROBOT: ' + rob.id + ' is an enemy within vision');
    const dist =
      Math.pow(rob.x - self.me.x, 2) + Math.pow(rob.y - self.me.y, 2);
    if (
      SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist &&
      dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1]
    ) {
      self.log('CAN ATTACK ROBOT:' + rob.id);
      // the priority of the robot that is within attacking vision if it is higher than the current one switch over to that robot
      let priority = 0;
      switch (rob.unit) {
        case SPECS.PILGRIM: {
          priority = 0;
        }
        case SPECS.CASTLE: {
          priority = 1;
        }
        case SPECS.CRUSADER: {
          priority = 2;
        }
        case SPECS.PREACHER: {
          priority = 3;
        }
        case SPECS.PROPHET: {
          priority = 4;
        }
      }
      if (priority > priorityRobot) {
        robotToAttack[0] = rob.x - self.me.x;
        robotToAttack[1] = rob.y - self.me.y;
        priorityRobot = priority;
      }
    }
  }
  if (priorityRobot === -1) {
    return null;
  }
  return robotToAttack;
}
/**
 * Rushes robot castle
 * @param self
 * @param dest
 * @param destQ
 */
function rushCastle(self, dest, destQ) {
  let nextMove;
  const toMove = new Array(2);
  nextMove = destQ.pop();
  self.log('LOOOK HERE' + nextMove[0] + ', ' + nextMove[1]);
  self.log('DDSADASD ' + self.me.x + ', ' + self.me.y);
  if (
    destQ.length !== 0 &&
    (self.me.x === nextMove[0] && self.me.y === nextMove[1])
  ) {
    // If the destination queue has coordinates and my current location is the
    // same as my next move's location, then pop next destination and set nextMove to it.
    nextMove = destQ.pop();
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    const visibleRobots = self.getVisibleRobots();
    const listLength = visibleRobots.length;
    let i;
    for (i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.x === nextMove[0] && rob.y === nextMove[1]) {
        return null;
      }
    }
    self.log(`* * * * * MOVING ${moveX}, ${moveY} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    // return self.move(moveX, moveY);
  } else {
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    const visibleRobots = self.getVisibleRobots();
    const listLength = visibleRobots.length;
    let i;
    for (i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.x === nextMove[0] && rob.y === nextMove[1]) {
        return null;
      }
    }
    self.log(`**** ME (${self.me.x}, ${self.me.y}) > > >`);
    self.log(`***** nextMove ${nextMove} > > >`);
    self.log(`*(**** MOVING (${moveX}, ${moveY}) > > >`);
    self.log(`****DEST ${dest} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    // return self.move(moveX, moveY);
  }
}

class PriorityQueue {
  constructor(comparator = (a, b) => a.priority > b.priority) {
    this.top = 0;
    this.parent = i => ((i + 1) >>> 1) - 1;
    this.left = i => (i << 1) + 1;
    this.right = i => (i + 1) << 1;
    this.heap = [];
    // TODO: use the heuristic function for comparison(?)
    this.comparator = comparator;
  }
  size() {
    return this.heap.length;
  }
  insert(...values) {
    values.forEach(value => {
      this.heap.push(value);
      this.sortUp();
    });
  }
  empty() {
    this.heap = [];
  }
  peek() {
    return this.heap[this.top];
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this.top) {
      this.swap(this.top, bottom);
    }
    this.heap.pop(); // Literally remove the item from the array.
    this.sortDown();
    return poppedValue;
  }
  replace(val) {
    const replacedValue = this.peek();
    this.heap[this.top] = val;
    this.sortDown();
    return replacedValue;
  }
  greater(i, j) {
    return this.comparator(this.heap[i], this.heap[j]);
  }
  lesser(i, j) {
    return !this.comparator(this.heap[i], this.heap[j]);
  }
  sortUp() {
    let node = this.size() - 1;
    while (node > this.top && this.lesser(node, this.parent(node))) {
      const parent = this.parent(node);
      this.swap(node, parent);
      node = parent;
    }
  }
  sortDown() {
    let node = this.top;
    while (
      (this.left(node) < this.size() && this.lesser(this.left(node), node)) ||
      (this.right(node) < this.size() && this.lesser(this.right(node), node))
    ) {
      const minChild =
        this.right(node) < this.size() &&
        this.lesser(this.right(node), this.left(node))
          ? this.right(node)
          : this.left(node);
      this.swap(node, minChild);
      node = minChild;
    }
  }
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

const adjChoices = [
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
];
/**
 * Finds an in-bounds open location adjacent to our robot
 * @param { number } our x-coord, { number } our y-coord, { number[][] } our visionMap, { boolean [][] } this.map
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function availableLoc(selfX, selfY, visionMap, passableMap) {
  // let avail: number[] = [];
  for (const avail of adjChoices) {
    const xCoord = avail[0] + selfX;
    const yCoord = avail[1] + selfY;
    const inBounds = checkBounds([selfX, selfY], avail, visionMap[0].length);
    let passable;
    if (inBounds) {
      passable = passableMap[yCoord][xCoord];
    }
    if (visionMap[yCoord][xCoord] === 0 && inBounds && passable) {
      return avail;
    }
  }
  // No available adjacent location
  return null;
}
/**
 * Finds closest mining location for the given map
 * @param { number [] } myLocation, { boolean [][] } resourceMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function closestMiningLocation(loc, map, visibleRobotMap) {
  let closestDist = Infinity;
  let closestLoc;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map.length; x++) {
      if (map[y][x] === true && visibleRobotMap[y][x] <= 0) {
        if (manhatDist([x, y], loc) < closestDist) {
          closestDist = manhatDist([x, y], loc);
          closestLoc = [x, y];
        }
      }
    }
  }
  return closestLoc;
}
/**
 * Finds manhattan distance between two locations
 * @param { number [] } locationA, { number [] } locationB
 * @returns { number } Manhattan distance between A and B
 */
function manhatDist(a, b) {
  // Manhattan distance on a square grid.
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}
/**
 * Finds closest coordinates in an array of locations to a starting point
 * @param { number [] } start, { number [][] } locations
 * @returns { number []} coordinates of closest location
 */
function closestCoords(start, coords) {
  const distances = [];
  for (const coord of coords) {
    distances.push({
      distance: manhatDist(start, coord),
      coord,
    });
  }
  let min = distances[0];
  for (const dist of distances) {
    if (dist.distance < min.distance) {
      min = dist;
    }
  }
  return min.coord;
}
function fillArray(max, el) {
  const temp = new Array(max);
  const result = new Array(max);
  for (let i = 0; i < max; ++i) {
    temp[i] = el;
  }
  for (let i = 0; i < max; ++i) {
    result[i] = temp.slice(0);
  }
  return result;
}
/**
 * Checks if a location is within map bounds
 * @param { number [] } start, { number [] } [dx, dy], { number } mapDimensions
 * @returns { boolean[]} true/false if location is/not within bounds
 */
function checkBounds(start, toAdd, mapDim) {
  const xCoord = start[0] + toAdd[0];
  const yCoord = start[1] + toAdd[1];
  // Check for new x-coordinate
  if (xCoord >= mapDim || xCoord < 0) {
    return false;
  }
  // Check for new y-coordinate
  if (yCoord >= mapDim || yCoord < 0) {
    return false;
  }
  return true;
}
function simplePathFinder(passableMap, visionMap, start, dest) {
  // Simple BFS pathfinder
  // Really bad.
  const visited = fillArray(passableMap[0].length, false);
  // const gScore: number[][] = fillArray(map[0].length, Infinity);
  // const fScore: number[][] = fillArray(map[0].length, Infinity);
  const parentCoord = fillArray(passableMap[0].length, []);
  const moveQueue = [];
  const queue = new PriorityQueue();
  const directions = adjChoices;
  let pathEnd;
  queue.insert({
    coord: start,
    priority: manhatDist(start, dest),
  });
  // gScore[start[1]][start[0]] = 0;
  // fScore[start[1]][start[0]] = manhatDist(start, dest);
  parentCoord[start[1]][start[0]] = start;
  while (queue.size() !== 0) {
    const nextHeapitem = queue.pop();
    const loc = nextHeapitem.coord;
    visited[loc[1]][loc[0]] = true;
    if (loc[0] === dest[0] && loc[1] === dest[1]) {
      pathEnd = loc;
      break;
    }
    // Add to queue only if not visited already and closest.
    const candidates = directions.map(val => {
      return [val[0] + loc[0], val[1] + loc[1]];
    });
    for (const candidate of candidates) {
      // Check bounds
      if (
        candidate[1] >= 0 &&
        candidate[1] < passableMap[0].length &&
        (candidate[0] >= 0 && candidate[0] < passableMap[0].length)
      ) {
        // Check visit and passable
        if (
          visited[candidate[1]][candidate[0]] !== true &&
          passableMap[candidate[1]][candidate[0]] === true &&
          visionMap[candidate[1]][candidate[0]] <= 0
        ) {
          // If not visited, is passable, and has no robots, push to queue.
          parentCoord[candidate[1]][candidate[0]] = loc;
          // const test = manhatDist(candidate, dest);
          queue.insert({
            coord: candidate,
            priority: manhatDist(candidate, dest),
          });
        }
      }
    }
  }
  // Grabs shortest path starting from pathEnd
  while (pathEnd !== undefined) {
    moveQueue.push(pathEnd);
    pathEnd = parentCoord[pathEnd[1]][pathEnd[0]];
    if (pathEnd[0] === start[0] && pathEnd[1] === start[1]) {
      pathEnd = undefined;
      moveQueue.push(start);
    }
  }
  // moveQueue.reverse();
  return moveQueue;
}
/**
 * Finds the closest team castle
 * @param { BCAbstractRobot } self
 * @returns { number [][]} coordinates of closest castle
 */
function findClosestFriendlyCastles(self) {
  const storageLocs = [];
  const visibleRobots = self.getVisibleRobots();
  const castles = visibleRobots.filter(robot => {
    if (robot.team === self.me.team && robot.unit === SPECS.CASTLE) {
      return robot;
    }
  });
  for (const loc of castles) {
    storageLocs.push([loc.x, loc.y]);
  }
  return closestCoords([self.me.x, self.me.y], storageLocs);
}
/**
 * Finds the number of visible pilgrims
 * @param { BCAbstractRobot } self
 * @returns { number } number of pilgrims in vision radius, -1 if none
 */
function visiblePilgrims(self) {
  const visibleRobots = self.getVisibleRobots();
  function isPilgrim(robot) {
    return robot.team === self.me.team && robot.unit === SPECS.PILGRIM;
  }
  return visibleRobots.filter(isPilgrim).length;
}
// Function will take in one of our castles and reflect its position to obtain
// the location of an enemy castle
function enemyCastle(selfLoc, map, horizontal) {
  // vertical reflection on the castle
  const mapLength = map.length;
  const xcor = selfLoc[0];
  const ycor = selfLoc[1];
  /*
    const coordinateVertical: number[] = [mapLength - xcor - 1, ycor];
    const coordinateHorizontal: number[] = [xcor, mapLength - ycor - 1];
  
    if (!map[coordinateVertical[1]][coordinateVertical[0]]) { return coordinateVertical; }
    else { return coordinateHorizontal; }
    */
  const coordinateVertical = [mapLength - xcor - 1, ycor];
  const coordinateHorizontal = [xcor, mapLength - ycor - 1];
  if (!horizontal) {
    return coordinateHorizontal;
  } else {
    return coordinateVertical;
  }
}
function horizontalFlip(self) {
  const length = self.map.length;
  for (let x = 0; x < length; ++x) {
    for (let y = 0; y < length; ++y) {
      if (!(self.map[y][x] === self.map[y][length - x - 1])) {
        return false;
      }
    }
  }
  return true;
}
/**
 * Checks if there are any enemy robots in vision radius
 * @param visibleRobots
 * @param team
 */
function visibleEnemy(visibleRobots, team) {
  for (const bot of visibleRobots) {
    if (bot.team !== team) {
      return true;
    }
  }
  return false;
}

function castleBuild(self) {
  const visionMap = self.getVisibleRobotMap();
  const buildLoc = availableLoc(self.me.x, self.me.y, visionMap, self.map);
  self.log(`Castle health: ${self.me.health}`);
  // Pilgrims have been killed off, build new ones
  const pilgrimNum = visiblePilgrims(self);
  if (pilgrimNum < 2 && buildLoc) {
    self.log(
      `PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${
        buildLoc[1]
      }) turn (${self.me.turn})`,
    );
    return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
  }
  // Check if open location and if enough karb for prophet
  if (self.karbonite >= 25 && buildLoc) {
    // Temporarily only build 1 prophet
    self.log(
      `Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
        self.me.turn
      })`,
    );
    return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
  }
  // Check if open location and enough karb for pilgrim
  else if (self.karbonite >= 10 && buildLoc && self.me.turn % 1000) {
    self.log(
      `Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
        self.me.turn
      })`,
    );
    return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
  }
}

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.resourceLocation = undefined;
    this.goMining = false;
    this.destinationQueue = [];
    this.destination = undefined;
    this.nextMove = undefined;
    this.enemyCastleLoc = [];
    this.enemyCastleNum = 0;
    this.runPathAgain = 0;
    this.unitCount = {
      prophet: 0,
      pilgrim: 0,
    };
  }
  turn() {
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return this.handlePilgrim();
      }
      case SPECS.CRUSADER: {
        const choice = availableLoc(
          this.me.x,
          this.me.y,
          this.getVisibleRobotMap(),
          this.map,
        );
        // this.log(`Crusader health: ${this.me.health}`);
        // move torwards enemy castle
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.PROPHET: {
        this.log('> > PROPHET > >');
        return this.handleProphet();
      }
      case SPECS.PREACHER: {
        // this.log(`Preacher health: ${this.me.health}`);
        const choice = availableLoc(
          this.me.x,
          this.me.y,
          this.getVisibleRobotMap(),
          this.map,
        );
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.CASTLE: {
        // get castle coordinates
        if (this.me.turn === 1) {
          const horizontal = horizontalFlip(this);
          this.enemyCastleLoc.push(
            enemyCastle([this.me.x, this.me.y], this.map, horizontal),
          );
          this.log(
            'CASTLE LOCATION' +
              this.enemyCastleLoc[this.enemyCastleNum][0] +
              ', ' +
              this.enemyCastleLoc[this.enemyCastleNum][1],
          );
        }
        return this.handleCastle();
      }
    }
  }
  handleCastle() {
    // Castle build pilgrims at first 2 turns
    if (this.me.turn < 3) {
      this.log(`TURN: ${this.me.turn}`);
      const buildLoc = availableLoc(
        this.me.x,
        this.me.y,
        this.getVisibleRobotMap(),
        this.map,
      );
      // Have each castle build pilgrims in first 2 turns
      if (buildLoc) {
        this.log(
          `Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
            this.me.turn
          })`,
        );
        return this.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
      }
    }
    // Check for enemies first
    if (visibleEnemy(this.getVisibleRobots(), this.me.team)) {
      const attackCoords = attackFirst(this);
      if (attackCoords) {
        this.log(
          `Visible enemy robot in attack range at (${attackCoords[0]}, ${
            attackCoords[0]
          })`,
        );
        this.log(`ATTACKING!`);
        return this.attack(attackCoords[0], attackCoords[1]);
      }
      this.log(`Visible enemy robot is out of attack range`);
    }
    // Check if enough karb to build
    if (this.karbonite >= 10) {
      this.log(`Enough karb to build..`);
      return castleBuild(this);
    }
  }
  handlePilgrim() {
    this.log(' > > > PILGRIM TIME > > >');
    // let action: Action | Falsy = undefined;
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }
    if (this.destination === undefined) {
      if (this.resourceLocation === undefined) {
        this.findDiffMining();
      }
      this.log(`MY DEST IS ${this.resourceLocation}`);
      this.destination = this.resourceLocation;
      const robotMap = this.getVisibleRobotMap();
      this.destinationQueue = simplePathFinder(
        this.map,
        robotMap,
        [this.me.x, this.me.y],
        this.destination,
      );
      this.nextMove = this.destinationQueue.pop();
      this.goMining = true;
      this.log(` > > > CLOSEST MINING SPOT AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`);
    }
    let full;
    if (this.me.karbonite === 20 || this.me.fuel === 100) {
      full = true;
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log('---FULL INVENTORY, RETURNING TO BASE---');
      this.goMining = false;
      const closestCastle = findClosestFriendlyCastles(this);
      const dx = closestCastle[0] - this.me.x;
      const dy = closestCastle[1] - this.me.y;
      const dist = Math.pow(dx, 2) + Math.pow(dy, 2);
      // If castle is in adjacent square, give resources
      if (dist <= 2) {
        this.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
        return this.give(dx, dy, this.me.karbonite, this.me.fuel);
      }
      // Not near castle, set destination queue to nav to base
      const visibleRobots = this.getVisibleRobotMap();
      const validLoc = availableLoc(
        this.me.x,
        this.me.y,
        visibleRobots,
        this.map,
      );
      this.destination = [
        closestCastle[0] + validLoc[0],
        closestCastle[1] + validLoc[1],
      ];
      this.destinationQueue = simplePathFinder(
        this.map,
        visibleRobots,
        [this.me.x, this.me.y],
        this.destination,
      );
      this.nextMove = this.destinationQueue.pop();
      this.log(` > > > MY LOCATION (${this.me.x}, ${this.me.y})> > >`);
      this.log(` > > > CLOSEST CASTLE AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`);
    }
    // Mine or set mining location to destination if not full and at location
    if (
      this.me.x === this.destination[0] &&
      this.me.y === this.destination[1] &&
      !full
    ) {
      // If on destination and is going mining, mine.
      if (this.goMining === true) {
        this.log('CURRENTLY MINING');
        return this.mine();
      }
      this.destination = undefined;
    }
    if (this.me.turn % 2 === 0);
    // Move to destination
    if (this.me.x !== this.nextMove[0] && this.me.y !== this.nextMove[1]) {
      const visibleRobots = this.getVisibleRobotMap();
      if (visibleRobots[this.nextMove[1]][this.nextMove[0]] !== 0) {
        this.destinationQueue = [];
        this.initializePilgrim();
      } else {
        const moveX = this.nextMove[0] - this.me.x;
        const moveY = this.nextMove[1] - this.me.y;
        return this.move(moveX, moveY);
      }
    }
    if (
      this.destinationQueue.length !== 0 &&
      (this.me.x === this.nextMove[0] && this.me.y === this.nextMove[1])
    ) {
      // If the destination queue has coordinates and my current location is the
      // same as my next move's location, then pop next destination and set nextMove to it.
      this.nextMove = this.destinationQueue.pop();
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`);
      return this.move(moveX, moveY);
    }
  }
  // Sets pilgrims' initial mining job
  initializePilgrim() {
    this.log('> > > FINDING THINGS > > >');
    const visibleRobots = this.getVisibleRobotMap();
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    this.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(this)}`);
    this.resourceLocation =
      visiblePilgrims(this) % 2 === 0
        ? closestMiningLocation(
            [this.me.x, this.me.y],
            this.karbonite_map,
            visibleRobots,
          )
        : closestMiningLocation(
            [this.me.x, this.me.y],
            this.fuel_map,
            visibleRobots,
          );
    this.log(
      `VISPILGS < 1: ${visiblePilgrims(this) < 1} RESRC LOC: ${
        this.resourceLocation
      }, pilnum${visiblePilgrims(this)}`,
    );
  }
  findDiffMining() {
    // It's like initializePilgrim, but the opposite.
    const visibleRobots = this.getVisibleRobotMap();
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    this.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(this)}`);
    this.resourceLocation =
      (visiblePilgrims(this) + 1) % 2 === 0
        ? closestMiningLocation(
            [this.me.x, this.me.y],
            this.karbonite_map,
            visibleRobots,
          )
        : closestMiningLocation(
            [this.me.x, this.me.y],
            this.fuel_map,
            visibleRobots,
          );
  }
  handleProphet() {
    //const choice: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
    if (this.me.turn === 1) {
      this.log('> > PROPHET FIRST TURN > >');
      const visibleRobots = this.getVisibleRobots();
      const robotMap = this.getVisibleRobotMap();
      const listLength = visibleRobots.length;
      for (let i = 0; i < listLength; ++i) {
        const rob = visibleRobots[i];
        if (rob.unit === SPECS.CASTLE) {
          const horizontal = horizontalFlip(this);
          const enemyCastleLoc = enemyCastle(
            [rob.x, rob.y],
            this.map,
            horizontal,
          );
          this.enemyCastleLoc.push(enemyCastleLoc);
          this.destination = this.enemyCastleLoc[this.enemyCastleNum];
          this.destinationQueue = simplePathFinder(
            this.map,
            robotMap,
            [this.me.x, this.me.y],
            this.destination,
          );
          this.log(
            'CASTLE LOCATION - PROPHET' +
              this.enemyCastleLoc[this.enemyCastleNum][0] +
              ', ' +
              this.enemyCastleLoc[this.enemyCastleNum][1],
          );
        }
      }
    }
    // this.log(`Prophet health: ${this.me.health}`);
    const attackingCoordinates = attackFirst(this);
    if (attackingCoordinates) {
      return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
    }
    if (this.runPathAgain > 0) {
      const choice = availableLoc(
        this.me.x,
        this.me.y,
        this.getVisibleRobotMap(),
        this.map,
      );
      this.runPathAgain--;
      return this.move(choice[0], choice[1]);
    } else if (this.runPathAgain === 1) {
      this.destinationQueue = simplePathFinder(
        this.map,
        this.getVisibleRobotMap(),
        [this.me.x, this.me.y],
        this.destination,
      );
      this.runPathAgain = 0;
    }
    if (
      this.enemyCastleLoc !== null &&
      (this.destinationQueue !== undefined &&
        this.destinationQueue.length !== 0)
    ) {
      const toMove = rushCastle(this, this.destination, this.destinationQueue);
      if (toMove === null) {
        this.runPathAgain = 2;
      } else {
        return this.move(toMove[0], toMove[1]);
      }
    }
    if (this.destinationQueue.length === 0) {
      this.destinationQueue = simplePathFinder(
        this.map,
        this.getVisibleRobotMap(),
        [this.me.x, this.me.y],
        this.destination,
      );
    }
    const choice = availableLoc(
      this.me.x,
      this.me.y,
      this.getVisibleRobotMap(),
      this.map,
    );
    return this.move(choice[0], choice[1]);
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
