import React from "react";
import ReactDOMServer from 'react-dom/server';
import seedrandom from 'seedrandom';
import { scaleLinear } from 'd3-scale';
import { createImageFromUrl } from '../utils/imgUtils';
import { PINYOTTAS_API_URL, PINYOTTAS_UI_URL } from "../constants";
const { ethers } = require("ethers");

let rng;

const width = 500;
const height = 500;
const padding = 50;
const effectiveWidth = width - padding * 2;
const effectiveHeight = height - padding * 2;

const shapeCountTracker = {};

const CellShapes = {
  Circle: "Circle",
  Triangle: "Triangle",
  Square: "Square",
  Diamond: "Diamond",
  Pentagon: "Pentagon",
  Hexagon: "Hexagon",
  Heptagon: "Heptagon",
  Octogon: "Octogon",
  Star4: "Four-pointed star",
  Star5: "Five-pointed star",
  Star6: "Six-pointed star",
  Star7: "Seven-pointed star",
  Star8: "Eight-pointed star",
  Kite: "Kite",
  SlantedRect: "Slanted rect",
  CutDiamond: "Cut Diamond",
};
console.log("Cell shapes:", Object.keys(CellShapes).length);

const numSidesPerPolygon = {
  [CellShapes.Triangle]: 3,
  [CellShapes.Diamond]: 4,
  [CellShapes.Pentagon]: 5,
  [CellShapes.Hexagon]: 6,
  [CellShapes.Heptagon]: 7,
  [CellShapes.Octogon]: 8,
};
const polygons = Object.keys(numSidesPerPolygon);

const numPointsPerStar = {
  [CellShapes.Star4]: 4,
  [CellShapes.Star5]: 5,
  [CellShapes.Star6]: 6,
  [CellShapes.Star7]: 7,
  [CellShapes.Star8]: 8,
}
const stars = Object.keys(numPointsPerStar);

const irregularPolygonVertexRadii = {
  [CellShapes.Kite]: [
    -1 * Math.PI / 8,
    -4 * Math.PI / 8,
    -7 * Math.PI / 8,
    -12 * Math.PI / 8,
  ],
  [CellShapes.SlantedRect]: [
    4 * Math.PI / 8,
    7 * Math.PI / 8,
    12 * Math.PI / 8,
    15 * Math.PI / 8
  ],
  [CellShapes.CutDiamond]: [
    0,
    Math.PI/2,
    Math.PI,
    20 * Math.PI / 16,
    28 * Math.PI / 16,
  ]
};
const irregularPolygons = Object.keys(irregularPolygonVertexRadii);

// TODO Rename to shape count?
const GridSizes = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
};
console.log("Grid sizes:", Object.keys(GridSizes).length);

// TOOD check that each density works for Stacked
const Densities = {
  Sparse: "Sparse",
  Comfy: "Comfy",
  Cozy: "Cozy",
  Packed: "Packed",
  Overlapping: "Overlapping",
  Smothered: "Smothered",
};
console.log("Densities:", Object.keys(Densities).length);

const DrawOrders = {
  TOP_LEFT_ON_TOP: 'Top-left on top',
  BOTTOM_RIGHT_ON_TOP: 'Bottom-right on top',
  CENTER_ON_TOP: 'Center on top',
  CENTER_ON_BOTTOM: 'Center on bottom',
};
console.log("Draw orders:", Object.keys(DrawOrders).length);

const Layouts = {
  Grid: "Grid",
  Bricklayer: "Bricklayer",
  Radial: "Radial",
  Stacked: "Stacked",
  Pyramid: "Pyramid",
  InvertedPyramid: "InvertedPyramid",
};
console.log("Layouts:", Object.keys(Layouts).length);

const FillingTechnique = {
  Gradient: "Gradient",
  Alternating: "Alternating"
}
console.log("FillingTechnique:", Object.keys(FillingTechnique).length);

const BackgroundStyling = {
  Light: "White",
  Dark: "Black",
}
console.log("Background styling:", Object.keys(BackgroundStyling).length);

const StrokeStyling = {
  Light: "White",
  Dark: "Black",
  None: "None",
}
console.log("StrokeStyling:", Object.keys(BackgroundStyling).length);

let numPermutations = 1;
[CellShapes, GridSizes, Densities, DrawOrders, Layouts, FillingTechnique, BackgroundStyling, StrokeStyling].forEach(option => {
  numPermutations = numPermutations * Object.keys(option).length;
});
console.log("# of permutations:", numPermutations.toLocaleString(), "not counting thickness, etc. :)");

// The number of rows in a GRID or BRICKLAYER layout for a given gridSize
function getNumRows(gridSize) {
  const gridSizesToRowCount = {
    [GridSizes.XXS]: 2,
    [GridSizes.XS]: 4,
    [GridSizes.S]: 6,
    [GridSizes.M]: 8,
    [GridSizes.L]: 12,
    [GridSizes.XL]: 16,
    [GridSizes.XXL]: 20,
    [GridSizes.XXXL]: 35,
  };
  if(gridSize in gridSizesToRowCount) {
    return gridSizesToRowCount[gridSize];
  } else {
    throw new Error("Invalid gridSize");
  }
}

/**
 * Given a range of values, returns an array produced by choosing the smallest integer in that range,
 * followed by the largest, then the second smallest, then the second largest, and so on.
 * 
 * E.g. createStaggeredArray(0, 4) returns [0, 4, 1, 3, 2]
 * 
 * @param {number} start 
 * @param {number} end 
 * @returns 
 */
function createStaggeredArray(start, end) {
  const tempNumbers = [];
  const numbers = [];
  for (let i = start; i <= end; i++) {
    tempNumbers.push(i);
  }
  while(tempNumbers.length > 0) {
    numbers.push(tempNumbers.shift());
    if(tempNumbers.length > 0) {
      numbers.push(tempNumbers.pop());
    }
  }
  return numbers;
}

function countUniqueValues(array) {
  const map = {};
  array.forEach(v => map[v] = v);
  return Object.keys(map).length;
}

function getCellPadding(cellSize, density) {
  if(density === Densities.Sparse) { return cellSize / 2; }
  else if(density === Densities.Comfy) { return cellSize / 3; }
  else if(density === Densities.Cozy) { return cellSize / 4; }
  else if(density === Densities.Packed) { return 0; }
  else if(density === Densities.Overlapping) { return -cellSize / 4; }
  else if(density === Densities.Smothered) { return -cellSize / 3; }
  throw Error(`Invalid density ${density}`);
}

function getBackgroundColor(backgroundStyle) {
  return backgroundStyle === BackgroundStyling.Dark ? "#000000" : "#ffffff";
}

// TODO setup distribution for cell shapes
function getRandomCellShape(shapesToExclude) {
  const r = rng() * 100;
  let shape;
  if(r < 6.25) { shape = CellShapes.Circle; }
  else if(r < 12.5) { shape = CellShapes.Triangle; }
  else if(r < 18.75) { shape = CellShapes.Square; }
  else if(r < 25) { shape = CellShapes.Diamond; }
  else if(r < 31.25) { shape = CellShapes.Pentagon; }
  else if(r < 37.5) { shape = CellShapes.Hexagon; }
  else if(r < 43.75) { shape = CellShapes.Heptagon; }
  else if(r < 50) { shape = CellShapes.Octogon; }
  else if(r < 56.25) { shape = CellShapes.Star4; }
  else if(r < 62.5) { shape = CellShapes.Star5; }
  else if(r < 68.75) { shape = CellShapes.Star6; }
  else if(r < 75) { shape = CellShapes.Star7; }
  else if(r < 81.25) { shape = CellShapes.Star8; }
  else if(r < 87.5) { shape = CellShapes.Kite; }
  else if(r < 93.75) { shape = CellShapes.SlantedRect; }
  else { shape = CellShapes.CutDiamond; }

  if(shapesToExclude.includes(shape)) {
    return null;
  } else {
    return shape;
  }
}

function getRandomCellShapes() {
  const shapes = [];

  let shape;
  do {
    shape = getRandomCellShape(shapes);
    if(shape) {
      shapes.push(shape);

      const r = rng() * 100;
      if(r < 50) {
        break;
      }
    }
  } while(shape && shapes.length < Object.values(CellShapes).length);
  return shapes;
}

function getRandomGridSize(cellShape) {
  const r = rng() * 100;
  if(r < 5) {
    return GridSizes.XXS;
  } else if(r < 20) {
    return GridSizes.XS;
  } else if(r < 35) {
    return GridSizes.S;
  } else if(r < 50) {
    return GridSizes.M;
  } else if(r < 65) {
    return GridSizes.L;
  } else if(r < 80) {
    return GridSizes.XL;
  } else if(r < 90) {
    return GridSizes.XXL;
  } else {
    return GridSizes.XXXL;
  }
}

// TODO setup distribution for density
function getRandomDensity(layout, gridSize) {
  if(layout === Layouts.Stacked) {
    return undefined;
  }
  
  if(gridSize === GridSizes.XXXL) {
    const r = rng() * 100;
    if(r < 5) { return Densities.Cozy; }
    else if(r < 30) { return Densities.Packed; }
    else if(r < 75) { return Densities.Overlapping; }
    else { return Densities.Smothered; } 
  }
  else {
    const r = rng() * 100;
    if(r < 17) { return Densities.Sparse; }
    else if(r < 34) { return Densities.Comfy; }
    else if(r < 51) { return Densities.Cozy; }
    else if(r < 68) { return Densities.Packed; }
    else if(r < 85) { return Densities.Overlapping; }
    else { return Densities.Smothered; } 
  }
}

// TODO setup distribution for filled
function getRandomFilled() {
  const r = rng() * 100;
  return r < 50;
}

// TODO setup distribution for thickness
function getRandomThickness(layout, gridSize, filled, numColors) {
  const r = rng() * 100;
  if(layout === Layouts.Stacked) {
    if(gridSize === GridSizes.XXL || gridSize === GridSizes.XXXL) {
      return .5;
    }
    else if(gridSize === GridSizes.XL) {
      if(r < 33) { return .5; }
      else if(r < 66) { return 1; }
      else { return 2; }
    }
    else if(gridSize === GridSizes.L) {
      if(r < 25) { return .5; }
      else if(r < 50) { return 1; }
      else if(r < 75) { return 2; }
      else { return 3; }
    }
  }

  if(gridSize === GridSizes.XXXL || gridSize === GridSizes.XXL) {
    if(filled && numColors > 1) {
      if(r < 50) { return 0; }
      else { return 1; }
    }
    else {
      return 1;
    }
  }
  else {
    if(filled && numColors > 1) {
      if(r < 20) { return 0; }
      else if(r < 40) { return .5; }
      else if(r < 60) { return 1; }
      else if(r < 80) { return 2; }
      else { return 3; }
    }
    else {
      if(r < 20) { return 1; }
      else if(r < 40) { return 2; }
      else if(r < 60) { return 3; }
      else if(r < 80) { return 4; }
      else { return 5; }
    }
  }
}

function getRandomDrawOrder(layout) {
  if(layout === Layouts.Stacked) {
    return DrawOrders.CENTER_ON_TOP;
  }
  else if(layout === Layouts.Radial) {
    const r = rng() * 100;
    if(r < 50) { return DrawOrders.CENTER_ON_TOP; }
    else { return DrawOrders.CENTER_ON_BOTTOM; } 
  }
  else {
    const r = rng() * 100;
    if(r < 33) { return DrawOrders.TOP_LEFT_ON_TOP; }
    else if(r < 66) { return DrawOrders.BOTTOM_RIGHT_ON_TOP; }
    else { return DrawOrders.CENTER_ON_TOP; }
  }
}

function getRandomLayout() {
  const r = rng() * 100;
  if(r < 17) { return Layouts.Grid; }
  else if(r < 34) { return Layouts.Bricklayer; }
  else if(r < 51) { return Layouts.Radial; }
  else if(r < 68) { return Layouts.Stacked; }
  else if(r < 85) { return Layouts.Pyramid; }
  else { return Layouts.InvertedPyramid; }
}

function getRandomFillingTechnique() {
  const r = rng() * 100;
  if(r < 40) {
    return FillingTechnique.Gradient;
  } else {
    return FillingTechnique.Alternating;
  }
}

function getRandomBackgroundStyle() {
  const r = rng() * 100;
  if(r < 45) {
    return BackgroundStyling.Dark;
  } else {
    return BackgroundStyling.Light;
  }
}

function getRandomFilledShapeStrokeStyling(layout) {
  const r = rng() * 100;
  if(r < 45) { return StrokeStyling.Dark; }
  else { return StrokeStyling.Light; }
}

function getRandomAnimated(cellShapes) {
  const illegalShapes = [CellShapes.Circle, CellShapes.Square].concat(irregularPolygons);
  const isAnyShapeIllegal = cellShapes.some(cellShape => illegalShapes.includes(cellShape));
  if(isAnyShapeIllegal) {
    return false;
  }
  const r = rng() * 100;
  return r < 1;
}

function getRandomApplyRotation(cellShapes) {
  const illegalShapes = [CellShapes.Circle, CellShapes.Square];
  const isEveryShapeIllegal = cellShapes.every(cellShape => illegalShapes.includes(cellShape));
  if(isEveryShapeIllegal) {
    return false;
  }
  const r = rng() * 100;
  return r < 55;
}

/**
 * Returns a suitable set of color to use to represent a list of tokens. From index 0-3 the colors represent the
 * top left, top right, bottom left, and bottom right colors to use in the generated art.
 * 
 * @param {*} addressesOfTokensToInclude An array of token addresses. E.g. ["0x5FbDB2315678afecb367f032d93F642f64180aa3"]
 * @param {*} availableTokens An array of token definitions. See utils/tokens.js
 * @returns An array of four colors. E.g. ["#ff0000", "#ffff00", "#00ff00", "#0000ff"]
 */
function getColorsForTokens(addressesOfTokensToInclude, availableTokens) {
  if(addressesOfTokensToInclude.length === 0) {
    return [];
  }

  // Loop over the tokens first adding the first color for the token (if it exists) to the colors array,
  // and then the second (if it exists), and so on until we either have 4 colors or we are out of colors.
  let colors = [];
  let foundColor = false;
  let index = 0;
  do {
    foundColor = false;
    addressesOfTokensToInclude.forEach(address => {
      const token = availableTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      const tokenColors = token.colors;
      if(index < tokenColors.length) {
        colors.push(tokenColors[index]);
        foundColor = true;
      }
    });
    index++;
  } while(colors.length < 4 && foundColor);

  // Trim the colors down to 4 if needed
  if(colors.length > 4) {
    colors = colors.slice(0, 3);
  }

  // Inflate the colors array by pushing the first color onto the end,
  // and then the second, and then the third as needed until we have four colors.
  if(colors.length < 4) {
    colors.push(colors[0]);
  }
  if(colors.length < 4) {
    colors.push(colors[1]);
  }
  if(colors.length < 4) {
    colors.push(colors[2]);
  }
  return colors;
}

async function uploadBlob(tokenId, blob) {
  
}

async function uploadMetadata(tokenId, metadata) {
  
}

function createMetadata(params) {
  console.log("createMetadata", params);
  const {
    tokenId,
    emptyTokenNumber,
    addressesToBalances,
    availableTokens,
    cellShapes,
    gridSize,
    //colors,
    density,
    filled,
    filledShapeStrokeStyling,
    thickness,
    drawOrder,
    layout,
    fillingTechnique,
    backgroundStyle,
    applyRotation,
    animated,
    imgURL,
  } = params;

  const gridSizesToNumShapes = {
    [GridSizes.XXS]: "A pinch",
    [GridSizes.XS]: "A few",
    [GridSizes.S]: "A handful",
    [GridSizes.M]: "A bunch",
    [GridSizes.L]: "A good amouunt",
    [GridSizes.XL]: "A bucketful",
    [GridSizes.XXL]: "A boatload",
    [GridSizes.XXXL]: "An obscene amount",
  }

  // TODO add tokens
  // TODO attributes use their keys instead of their values
  const metadata = {
    description: "Pinyottas are generative art NFTs that hold collections of ERC-20 tokens",
    image: imgURL,
    external_url: `${PINYOTTAS_UI_URL}/pinyottas/${tokenId}`,
    name: `Pinyotta #${tokenId}`,
    properties: []
  };

  if(cellShapes !== undefined) {
    metadata.properties.push({
      name: "Shapes",
      value: cellShapes,
    });
  }

  if(gridSize !== undefined) {
    metadata.properties.push({
      name: "Shape count",
      value: gridSize,
    });
  }

  if(density !== undefined) {
    metadata.properties.push({
      name: "Density",
      value: density,
    });
  }
  
  if(filled !== undefined) {
    metadata.properties.push({
      name: "Filled",
      value: filled ? "Yes" : "No",
    });

    if(filled && thickness > 0) {
      metadata.properties.push({
        name: "Stroke styling",
        value: filledShapeStrokeStyling,
      });
    }
  }
  
  if(thickness !== undefined) {
    metadata.properties.push({
      name: "Stroke thickness",
      value: thickness,
    });
  }
  
  if(drawOrder !== undefined) {
    metadata.properties.push({
      name: "Draw order",
      value: drawOrder,
    });
  }
  
  if(layout !== undefined) {
    metadata.properties.push({
      name: "Layout",
      value: layout,
    });
  }
  
  if(fillingTechnique !== undefined) {
    metadata.properties.push({
      name: "Coloring technique",
      value: fillingTechnique,
    });
  }
  
  if(backgroundStyle !== undefined) {
    metadata.properties.push({
      name: "Background",
      value: backgroundStyle,
    });
  }
  
  if(applyRotation !== undefined) {
    metadata.properties.push({
      name: "Shape rotation",
      value: applyRotation ? "Yes" : "No",
    });
  }
  
  if(animated !== undefined) {
    metadata.properties.push({
      name: "Animated",
      value: animated ? "Yes" : "No",
    });
  }

  metadata.properties.push({
    name: "Minted empty",
    value: emptyTokenNumber === undefined ? "No" : "Yes",
  });
  
  if(addressesToBalances) {
    Object.entries(addressesToBalances).forEach(([address, balance]) => {
      const token = availableTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      metadata.properties.push({
        name: `Token - ${token.symbol}`,
        value: parseFloat(ethers.utils.formatUnits(balance, token.decimals)),
      });
    });
  }
  
  console.log({metadata});
  return metadata;
};

function drawEmptySVG(params) {
  const { emptyTokenNumber } = params;
  const cx = width/2;
  const cy = height/2;
  const x1 = cx - 100;
  const x2 = cx + 100;
  const y1 = cy + 100;
  const y2 = cy - 100;
  const backgroundColor = "black";
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={"0 0 " + width + " " + height}
      style={{ backgroundColor }}
    >
      <circle cx={cx} cy={cy} r={100} fill="gray" />
      <circle cx={cx} cy={cy} fill={backgroundColor}>
        <animate attributeName="r" values="75;101;100;75;75" dur="5s" repeatCount="indefinite" />
      </circle>
      <line stroke="gray">
        <animate attributeName="stroke-width" values="25;0;0;25;25" dur="5s" repeatCount="indefinite" />
        <animate attributeName="x1" values={[x1,cx,cx,x1,x1+1].join(";")} dur="5s" repeatCount="indefinite" />
        <animate attributeName="x2" values={[x2,cx,cx,x2,x2+1].join(";")} dur="5s" repeatCount="indefinite" />
        <animate attributeName="y1" values={[y1,cy,cy,y1,y1+1].join(";")} dur="5s" repeatCount="indefinite" />
        <animate attributeName="y2" values={[y2,cy,cy,y2,y2+1].join(";")} dur="5s" repeatCount="indefinite" />
      </line>
      <text
        fill="gray"
        x={width/2}
        y={height/2 - 150}
        textAnchor="middle"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14px"
      >
        Empty Pinyotta #{emptyTokenNumber}
      </text>
    </svg>
  );
}

function drawShape(shape, cx, cy, r, rotation, styleProps, animated, animateClockwise) {

  let animation = null;
  if(animated) {
    const from = animateClockwise ? `0 ${cx} ${cy}` : `360 ${cx} ${cy}`;
    const to = animateClockwise ? `360 ${cx} ${cy}` : `0 ${cx} ${cy}`;
    animation = (
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from={from}
        to={to}
        dur="5s"
        repeatCount="indefinite"
      />
    )
  }

  if(polygons.includes(shape)) {
    const sides = numSidesPerPolygon[shape];
    const step = 2 * Math.PI / sides;
  
    const points = [];
    for(let i = 0; i < sides; i++) {
      const x = cx + Math.cos(rotation) * r;
      const y = cy + Math.sin(rotation) * r;
      points.push(x + "," + y);

      rotation += step;
    }
    
    return (
      <polygon points={points.join(" ")} {...styleProps}>
        { animation }
      </polygon>
    );
  }
  else if(stars.includes(shape)) {
    const spikes = numPointsPerStar[shape];
    const step = Math.PI/spikes;
    const outerRadius = r;
    const innerRadius = r / 2;

    const points = [];
    for(let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rotation) * outerRadius;
      let y = cy + Math.sin(rotation) * outerRadius;
      points.push(x + "," + y);

      rotation += step;

      x = cx + Math.cos(rotation) * innerRadius;
      y = cy + Math.sin(rotation) * innerRadius;
      points.push(x + "," + y);

      rotation += step;
    }

    return (
      <polygon points={points.join(" ")} {...styleProps}>
        { animation }
      </polygon>
    );
  }
  else if(irregularPolygons.includes(shape)) {
    const points = [];
    const angles = irregularPolygonVertexRadii[shape];
    for(let i = 0; i < angles.length; i++) {
      let x = Math.cos(angles[i]) * r;
      let y = Math.sin(angles[i]) * r;
      points.push(x + "," + y);
    }
    return (
      <g transform={`translate(${cx},${cy}) rotate(${rotation * 180/Math.PI})`}>
        <polygon points={points.join(" ")} {...styleProps}/>
      </g>
    ); 
  }
  else if(shape === CellShapes.Circle) {
    return (
      <circle cx={cx} cy={cy} r={r} {...styleProps} />
    );
  }
  else if(shape === CellShapes.Square) {
    return (
      <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} {...styleProps} />
    );
  }
  else {
    console.error("Invalid shape:", shape)
    throw new Error("Invalid shape:", shape)
  }
}

function getStyleProps({ color, filled, thickness, filledShapeStrokeStyling }) {
  let stroke = color;
  if(filled && thickness > 0) {
    if(filledShapeStrokeStyling === StrokeStyling.Dark) {
      stroke = "#000000";
    }
    else if(filledShapeStrokeStyling === StrokeStyling.Light) {
      stroke = "#ffffff";
    }
  }
  return {
    fill: filled ? color : "none",
    stroke,
    strokeWidth: thickness,
  };
}

function getRotationForShape(cellShape, i, applyRotation) {
  let rotation = 0;
  if(polygons.includes(cellShape)) {
    rotation = -Math.PI / 2;
    if(cellShape === CellShapes.Octogon) {
      rotation = Math.PI / 8;
    }
    if(applyRotation) {
      if(i % 2 === 1) {
        const step = 2 * Math.PI / numSidesPerPolygon[cellShape];
        rotation += step / 2;
      }
    }
  }
  else if(stars.includes(cellShape)) {
    rotation = Math.PI / 2 * 3;
    if(applyRotation) {
      if(i % 2 === 1) {
        const spikes = numPointsPerStar[cellShape];
        rotation += Math.PI / spikes;            
      }
    }
  }
  else if(irregularPolygons.includes(cellShape)) {
    if(applyRotation) {
      if(cellShape === CellShapes.Kite || cellShape === CellShapes.CutDiamond) {
        if(i % 2 === 1) {
          rotation = Math.PI;
        }
      }
      else if(cellShape === CellShapes.SlantedRect) {
        if(i % 2 === 1) {
          rotation = Math.PI / 2;
        }
      }
    }
  }
  return rotation;
}

function getShapesForGrid(params) {
  const {
    colors,
    applyRotation,
    cellShapes,
    gridSize,
    filled,
    filledShapeStrokeStyling,
    thickness,
    fillingTechnique,
    density,
    drawOrder,
    animated,
    //backgroundStyle,
    //layout,
    //emptyTokenNumber,
  } = params;

  let rowCount = getNumRows(gridSize);
  let columnCount = rowCount;
  let cellWidth = effectiveWidth / columnCount;
  let cellHeight = effectiveHeight / rowCount;
  let cellPadding = getCellPadding(cellWidth, density);

  const rowStart = 0;
  const rowEnd = rowCount;
  const totalCells = rowCount * rowCount;
  
  let rowNumbers = [];
  if(drawOrder === DrawOrders.CENTER_ON_TOP) {
    rowNumbers = createStaggeredArray(0, rowEnd - 1);
  } else if(drawOrder === DrawOrders.TOP_LEFT_ON_TOP) {
    for(let i = rowEnd - 1; i >= rowStart; i--) {
      rowNumbers.push(i);
    }
  } else if(drawOrder === DrawOrders.BOTTOM_RIGHT_ON_TOP) {
    for(let i = rowStart; i < rowEnd; i++) {
      rowNumbers.push(i);
    }
  } else {
    throw new Error(`Invalid drawOrder for stacked layout: ${drawOrder}`);
  }

  const shapes = [];
  rowNumbers.forEach(i => {
    const rowScale1 = scaleLinear().domain([0, rowCount - 1]).range([colors[0], colors[2]]);
    const rowScale2 = scaleLinear().domain([0, rowCount - 1]).range([colors[1], colors[3]]);

    let columnStart = 0;
    let columnEnd = columnCount;

    let columnNumbers = [];
    if(drawOrder === DrawOrders.CENTER_ON_TOP) {
      columnNumbers = createStaggeredArray(columnStart, columnEnd - 1);
    } else if(drawOrder === DrawOrders.TOP_LEFT_ON_TOP) {
      for(let i = columnEnd - 1; i >= columnStart; i--) {
        columnNumbers.push(i);
      }
    } else if(drawOrder === DrawOrders.BOTTOM_RIGHT_ON_TOP) {
      for(let i = columnStart; i < columnEnd; i++) {
        columnNumbers.push(i);
      }
    }

    columnNumbers.forEach(j => {
      const columnScale = scaleLinear().domain([0, columnCount - 1]).range([rowScale1(i), rowScale2(i)]);
      
      let color = "#000000";
      if(fillingTechnique === FillingTechnique.Gradient) {
        color = columnScale(j);
      } else {
        color = colors[Math.ceil(i * rowCount + j) % colors.length];
      }
      
      const cellNumber = i * Math.sqrt(totalCells) + j;
      const row = Math.floor(cellNumber / Math.sqrt(totalCells));
      const col = cellNumber - Math.sqrt(totalCells) * row;
      
      const cx = padding + col * cellWidth + cellWidth / 2;
      const cy = padding + row * cellHeight + cellHeight / 2;
      const r = (cellWidth - cellPadding) / 2;
    
      // Draw grid
      const drawGridCell = (cx, cy, cellWidth, cellHeight) => {
        const x = cx - cellWidth/2;
        const y = cy - cellHeight/2;
        shapes.push(
          <rect x={x} y={y} width={cellWidth} height={cellHeight} fill="none" stroke="white" strokeWidth={1} />
        );
      }
      //drawGridCell(cx, cy, cellWidth, cellHeight);
      
      const cellShapeIndex = Math.ceil(i * rowCount + j) % cellShapes.length;
      const cellShape = cellShapes[cellShapeIndex];
      const rotation = getRotationForShape(cellShape, cellNumber, applyRotation);

      const styleProps = getStyleProps({ color, filled, thickness, filledShapeStrokeStyling });
      const animateClockwise = i % 2 === 0;
      const shape = drawShape(cellShape, cx, cy, r, rotation, styleProps, animated, animateClockwise);
      shapes.push(shape);
    });
  });

  return shapes;
}

function getShapesForBricklayer(params) {
  const {
    colors,
    applyRotation,
    cellShapes,
    gridSize,
    filled,
    filledShapeStrokeStyling,
    thickness,
    fillingTechnique,
    density,
    drawOrder,
    animated,
    //backgroundStyle,
    //layout,
    //emptyTokenNumber,
  } = params;

  let rowCount = getNumRows(gridSize);
  let columnCount = rowCount;
  let cellWidth = effectiveWidth / columnCount;
  let cellHeight = effectiveHeight / rowCount;
  let cellPadding = getCellPadding(cellWidth, density);

  const rowStart = 0;
  const rowEnd = rowCount;
  const totalCells = rowCount * rowCount;
  
  let rowNumbers = [];
  if(drawOrder === DrawOrders.CENTER_ON_TOP) {
    rowNumbers = createStaggeredArray(0, rowEnd - 1);
  } else if(drawOrder === DrawOrders.TOP_LEFT_ON_TOP) {
    for(let i = rowEnd - 1; i >= rowStart; i--) {
      rowNumbers.push(i);
    }
  } else if(drawOrder === DrawOrders.BOTTOM_RIGHT_ON_TOP) {
    for(let i = rowStart; i < rowEnd; i++) {
      rowNumbers.push(i);
    }
  } else {
    throw new Error(`Invalid drawOrder for stacked layout: ${drawOrder}`);
  }

  const shapes = [];
  rowNumbers.forEach(i => {
    const rowScale1 = scaleLinear().domain([0, rowCount - 1]).range([colors[0], colors[2]]);
    const rowScale2 = scaleLinear().domain([0, rowCount - 1]).range([colors[1], colors[3]]);

    let columnStart = 0;
    let columnEnd = columnCount;
    if(i % 2 === 1) {
      columnStart = 0.5;
      columnEnd = columnCount - 0.5;
    }

    let columnNumbers = [];
    if(drawOrder === DrawOrders.CENTER_ON_TOP) {
      columnNumbers = createStaggeredArray(columnStart, columnEnd - 1);
    } else if(drawOrder === DrawOrders.TOP_LEFT_ON_TOP) {
      for(let i = columnEnd - 1; i >= columnStart; i--) {
        columnNumbers.push(i);
      }
    } else if(drawOrder === DrawOrders.BOTTOM_RIGHT_ON_TOP) {
      for(let i = columnStart; i < columnEnd; i++) {
        columnNumbers.push(i);
      }
    }

    columnNumbers.forEach(j => {
      const columnScale = scaleLinear().domain([0, columnCount - 1]).range([rowScale1(i), rowScale2(i)]);
      
      let color = "#000000";
      if(fillingTechnique === FillingTechnique.Gradient) {
        color = columnScale(j);
      } else {
        color = colors[Math.ceil(i * rowCount + j) % colors.length];
      }
      
      const cellNumber = i * Math.sqrt(totalCells) + j;
      const row = Math.floor(cellNumber / Math.sqrt(totalCells));
      const col = cellNumber - Math.sqrt(totalCells) * row;
      
      const cx = padding + col * cellWidth + cellWidth / 2;
      const cy = padding + row * cellHeight + cellHeight / 2;
      const r = (cellWidth - cellPadding) / 2;
      
      const cellShapeIndex = Math.ceil(i * rowCount + j) % cellShapes.length;
      const cellShape = cellShapes[cellShapeIndex];
      const rotation = getRotationForShape(cellShape, Math.floor(cellNumber), applyRotation);

      const styleProps = getStyleProps({ color, filled, thickness, filledShapeStrokeStyling });
      const animateClockwise = i % 2 === 0;
      const shape = drawShape(cellShape, cx, cy, r, rotation, styleProps, animated, animateClockwise);
      shapes.push(shape);
    });
  });

  return shapes;
}

function getShapesForRadial(params) {
  const {
    colors,
    applyRotation,
    cellShapes,
    gridSize,
    filled,
    filledShapeStrokeStyling,
    thickness,
    fillingTechnique,
    density,
    drawOrder,
    animated,
    //backgroundStyle,
    //layout,
    //emptyTokenNumber,
  } = params;

  function getNumRings(gridSize) {
    const gridSizesToRingCount = {
      [GridSizes.XXS]: 2,
      [GridSizes.XS]: 3,
      [GridSizes.S]: 4,
      [GridSizes.M]: 5,
      [GridSizes.L]: 6,
      [GridSizes.XL]: 7,
      [GridSizes.XXL]: 8,
      [GridSizes.XXXL]: 12,
    };
    if(gridSize in gridSizesToRingCount) {
      return gridSizesToRingCount[gridSize];
    } else {
      throw new Error("Invalid gridSize");
    }
  }

  // The number of cells in a given ring in a radial layout
  function getNumCellsinRing(ringNumber) {
    if(ringNumber === 0) {
      return 1;
    } else if(ringNumber === 1) {
      return 6;
    }
    return getNumCellsinRing(ringNumber - 1) + 6;
  };

  // The total number of cells in a radial layout with a given number of rings
  function getTotalCellsInRadialLayout(numRings) {
    let total = 0;
    let currRing = 0;
    do {
      total += getNumCellsinRing(currRing);
      currRing++;
    } while(currRing < numRings);
    return total;
  }

  function getRingNumberAndRemainderForCell(cellNumber) {
    let currRing = 0;
    let currAvailableCells = getNumCellsinRing(0);
    while(currAvailableCells <= cellNumber) {
      currRing++;
      currAvailableCells += getNumCellsinRing(currRing);
    }
    
    let ringNumber = currRing;
    let remainder = cellNumber - getTotalCellsInRadialLayout(ringNumber);
  
    return {
      ringNumber, remainder,
    };
  }

  const ringCount = getNumRings(gridSize);
  const totalCells = getTotalCellsInRadialLayout(ringCount);
  const cellRadius = effectiveWidth / (ringCount * 4 - 2);
  const cellPadding = getCellPadding(cellRadius * 2, density);

  const cells = [];
  for(let i = 0; i < totalCells; i++) {
    cells.push(i);
  }

  if(drawOrder === DrawOrders.CENTER_ON_TOP) {
    cells.reverse();
  } else if(drawOrder === DrawOrders.CENTER_ON_BOTTOM) {
    // Cells already in the right order
  } else {
    throw new Error(`Invalid drawOrder for radial layout: ${drawOrder}`);
  }

  const shapes = [];
  cells.forEach(i => {
    let color = "#0000ff";
    if(fillingTechnique === FillingTechnique.Gradient) {
      const numRings = getNumRings(gridSize);
      
      const uniqueColorMap = {};
      colors.forEach(color => uniqueColorMap[color] = color);
      const uniqueColors = Object.values(uniqueColorMap);

      const numSteps = Math.min(numRings, uniqueColors.length)
      const lastRingIndex = numRings - 1;
      let domain = [];
      let range = [];
      if(numSteps === 1) {
        domain = [0, lastRingIndex];
        range = [uniqueColors[0], uniqueColors[0]];
      }
      else if(numSteps === 2) {
        domain = [0, lastRingIndex];
        range = [uniqueColors[0], uniqueColors[1]];
      }
      else if(numSteps === 3) {
        domain = [0, numRings/2, lastRingIndex];
        range = [uniqueColors[0], uniqueColors[1], uniqueColors[2]];
      }
      else {
        domain = [0, numRings/3, 2 * numRings/3, lastRingIndex];
        range = [uniqueColors[0], uniqueColors[1], uniqueColors[2], uniqueColors[3]];
      }

      const colorScale = scaleLinear().domain(domain).range(range);
      
      const { ringNumber } = getRingNumberAndRemainderForCell(i);
      color = colorScale(ringNumber);
    } else {
      const { ringNumber } = getRingNumberAndRemainderForCell(i);
      color = colors[ringNumber % colors.length];
    }

    const {
      ringNumber,
      remainder,
    } = getRingNumberAndRemainderForCell(i);

    const numCellsInRing = getNumCellsinRing(ringNumber);
    const start = cellShapes.length === 1 ? numCellsInRing * Math.PI / 6 : numCellsInRing * Math.PI / 5;
    const step = 2 * Math.PI / (numCellsInRing);
    const cx = (padding + effectiveWidth / 2) + Math.cos(start + step * remainder) * ringNumber * cellRadius * 2;
    const cy = (padding + effectiveHeight / 2) + Math.sin(start + step * remainder) * ringNumber * cellRadius * 2;
    const r = cellRadius - cellPadding / 2;

    const cellShapeIndex = shapes.length % cellShapes.length;
    const cellShape = cellShapes[cellShapeIndex];
    const rotation = getRotationForShape(cellShape, i, applyRotation);

    const drawGridCell = (cx, cy, r) => {
      shapes.push(<circle cx={x} cy={y} r={r} fill="none" stroke="white" strokeWidth={1} />);
    }
    //drawGridCell(cx, cy, cellRadius);
    //drawGridCell(cx, cy, r);

    const styleProps = getStyleProps({ color, filled, thickness, filledShapeStrokeStyling });
    const animateClockwise = i % 2 === 0;
    const shape = drawShape(cellShape, cx, cy, r, rotation, styleProps, animated, animateClockwise);
    shapes.push(shape);
  });
  //shapes.push(<rect x={padding} y={padding} width={effectiveWidth} height={effectiveHeight} stroke="white" strokeWidth={1} fill="none" />);
  return shapes;
}

function getShapesForStacked(params) {
  const {
    colors,
    applyRotation,
    cellShapes,
    gridSize,
    filled,
    filledShapeStrokeStyling,
    thickness,
    fillingTechnique,
    drawOrder,
    animated,
    //density,
    //backgroundStyle,
    //layout,
    //emptyTokenNumber,
  } = params;

  if(drawOrder !== DrawOrders.CENTER_ON_TOP) {
    throw new Error(`Invalid drawOrder for stacked layout: ${drawOrder}`);
  }

  function getStackDepth(gridSize)  {
    const gridSizesToStackDepth = {
      [GridSizes.XXS]: 4,
      [GridSizes.XS]: 6,
      [GridSizes.S]: 8,
      [GridSizes.M]: 10,
      [GridSizes.L]: 15,
      [GridSizes.XL]: 20,
      [GridSizes.XXL]: 30,
      [GridSizes.XXXL]: 40,
    };
    if(gridSize in gridSizesToStackDepth) {
      return gridSizesToStackDepth[gridSize];
    } else {
      throw new Error("Invalid gridSize");
    }
  }

  const totalCells = getStackDepth(gridSize);
  
  const cells = [];
  for(let i = 0; i < totalCells; i++) {
    cells.push(i);
  }

  const shapes = [];
  cells.forEach(i => {
    let color = "#0000ff";
    if(fillingTechnique === FillingTechnique.Alternating) {
      color = colors[i % colors.length];
    }
    else if(fillingTechnique === FillingTechnique.Gradient) {
      const uniqueColorMap = {};
      colors.forEach(color => uniqueColorMap[color] = color);
      let range = Object.values(uniqueColorMap);
      if(range.length === 1) {
        range.push(range[0]);
      }
      let domain = [];
      if(range.length === 2) {
        domain = [0, totalCells];
      }
      if(range.length === 3) {
        domain = [0, totalCells/2, totalCells];
      }
      if(range.length === 4) {
        domain = [0, totalCells/3, 2*totalCells/3, totalCells];
      }
      const colorScale = scaleLinear().domain(domain).range(range);
      color = colorScale(i);
    }

    const sizeScale = scaleLinear().domain([0, totalCells]).range([effectiveWidth, effectiveWidth * .1]);
    const cx = width / 2;
    const cy = height / 2;
    const r = sizeScale(i) / 2;
    
    const cellShapeIndex = shapes.length % cellShapes.length;
    const cellShape = cellShapes[cellShapeIndex];
    const rotation = getRotationForShape(cellShape, i, applyRotation);
    
    const styleProps = getStyleProps({ color, filled, thickness, filledShapeStrokeStyling });
    const animateClockwise = i % 2 === 0;
    const shape = drawShape(cellShape, cx, cy, r, rotation, styleProps, animated, animateClockwise);
    shapes.push(shape);
  });

  return shapes;
}

function getShapesForPyramid(params, inverted) {
  const {
    colors,
    applyRotation,
    cellShapes,
    gridSize,
    filled,
    filledShapeStrokeStyling,
    thickness,
    fillingTechnique,
    density,
    drawOrder,
    animated,
    //backgroundStyle,
    //layout,
    //emptyTokenNumber,
  } = params;

  function getNumLayers(gridSize) {
    const gridSizesToLayerCount = {
      [GridSizes.XXS]: 3,
      [GridSizes.XS]: 4,
      [GridSizes.S]: 5,
      [GridSizes.M]: 7,
      [GridSizes.L]: 10,
      [GridSizes.XL]: 15,
      [GridSizes.XXL]: 20,
      [GridSizes.XXXL]: 25,
    };
    if(gridSize in gridSizesToLayerCount) {
      return gridSizesToLayerCount[gridSize];
    } else {
      throw new Error(`Invalid gridSize: ${gridSize}`);
    }
  }

  // The number of cells in a given layer
  function getNumCellsinLayer(layerNumber) {
    return layerNumber + 1;
  };

  // The total number of cells in a radial layout with a given number of rings
  function getTotalCellsInPyramidLayout(numLayers) {
    let count = 0;
    for(let i = 0; i < numLayers; i++) {
      count += getNumCellsinLayer(i);
    }
    return count;
  }

  function getLayerNumberAndRemainderForCell(cellNumber) {
    let currLayer = 0;
    let currAvailableCells = getNumCellsinLayer(0);
    while(currAvailableCells <= cellNumber) {
      currLayer++;
      currAvailableCells += getNumCellsinLayer(currLayer);
    }
    
    let layerNumber = currLayer;
    let remainder = cellNumber - getTotalCellsInPyramidLayout(layerNumber);
    return {
      layerNumber, remainder,
    };
  }
  
  const layerCount = getNumLayers(gridSize);
  const totalCells = getTotalCellsInPyramidLayout(layerCount);

  const cellRadius = effectiveWidth / (layerCount) / 2;
  const cellPadding = getCellPadding(cellRadius * 2, density);

  const cells = [];
  for(let i = 0; i < totalCells; i++) {
    cells.push(i);
  }

  const shapes = [];
  cells.forEach(i => {
    let color = "#0000ff";
    
    if(fillingTechnique === FillingTechnique.Gradient) {
      const uniqueColorMap = {};
      colors.forEach(color => uniqueColorMap[color] = color);
      const uniqueColors = Object.values(uniqueColorMap);

      const numSteps = Math.min(layerCount, uniqueColors.length)
      const lastLayerIndex = layerCount - 1;
      let domain = [];
      let range = [];
      if(numSteps === 1) {
        domain = [0, lastLayerIndex];
        range = [uniqueColors[0], uniqueColors[0]];
      }
      else if(numSteps === 2) {
        domain = [0, lastLayerIndex];
        range = [uniqueColors[0], uniqueColors[1]];
      }
      else if(numSteps === 3) {
        domain = [0, numSteps/2, lastLayerIndex];
        range = [uniqueColors[0], uniqueColors[1], uniqueColors[2]];
      }
      else {
        domain = [0, numSteps/3, 2 * numSteps/3, lastLayerIndex];
        range = [uniqueColors[0], uniqueColors[1], uniqueColors[2], uniqueColors[3]];
      }

      const colorScale = scaleLinear().domain(domain).range(range);
      
      const { layerNumber } = getLayerNumberAndRemainderForCell(i);
      color = colorScale(layerNumber);
    } else {
      const { layerNumber } = getLayerNumberAndRemainderForCell(i);
      color = colors[layerNumber % colors.length];
    }

    const {
      layerNumber,
      remainder,
    } = getLayerNumberAndRemainderForCell(i);

    const numCellsInLayer = getNumCellsinLayer(layerNumber);

    const cellWidth = cellRadius * 2;
    const cx = (effectiveWidth / 2) - remainder * cellWidth + padding + ((numCellsInLayer - 1) * cellRadius);
    let cy = (layerNumber / layerCount) * effectiveHeight + padding + cellRadius;
    if(inverted) {
      cy = height - cy;
    }
    const r = cellRadius - cellPadding / 2;

    const drawGridCell = (cx, cy, cellWidth, cellHeight) => {
      shapes.push(
        <rect x={cx - cellWidth/2} y={cy - cellHeight/2} width={cellWidth} height={cellHeight} fill="none" stroke="white" strokeWidth={1} />
      );
    }
    //drawGridCell(cx, cy, cellWidth, cellWidth);

    const cellShapeIndex = shapes.length % cellShapes.length;
    const cellShape = cellShapes[cellShapeIndex];
    const rotation = getRotationForShape(cellShape, i, applyRotation);

    const styleProps = getStyleProps({ color, filled, thickness, filledShapeStrokeStyling });
    const animateClockwise = i % 2 === 0;
    const shape = drawShape(cellShape, cx, cy, r, rotation, styleProps, animated, animateClockwise);
    shapes.push(shape);
  });

  //shapes.push(<rect x={padding} y={padding} width={effectiveWidth} height={effectiveHeight} stroke="white" strokeWidth={1} fill="none" />);
  return shapes;
}

function drawToSVG(params) {
  console.log("params", params);
  const {
    emptyTokenNumber,
    layout,
    backgroundStyle,
  } = params;

  if(emptyTokenNumber) {
    return drawEmptySVG(params);
  }

  let shapes = [];
  if(layout === Layouts.Grid) {
    shapes = getShapesForGrid(params);
  }
  else if(layout === Layouts.Bricklayer) {
    shapes = getShapesForBricklayer(params);
  }
  else if(layout === Layouts.Radial) {
    shapes = getShapesForRadial(params);
  }
  else if(layout === Layouts.Stacked) {
    shapes = getShapesForStacked(params);
  }
  else if(layout === Layouts.Pyramid) {
    shapes = getShapesForPyramid(params, false);
  }
  else if(layout === Layouts.InvertedPyramid) {
    shapes = getShapesForPyramid(params, true);
  }
  else {
    throw new Error(`Invalid layout "${layout}"`);
  }

  const backgroundColor = getBackgroundColor(backgroundStyle);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={"0 0 " + width + " " + height}
      style={{
        backgroundColor: backgroundColor
      }}
    >
      {shapes}
      {/*
      <style>{"text { display: none; } g.overlay:hover text { display: block; }"}</style>
      <g>{ shapes }</g>
      <g className="overlay">
        <rect x={0} y={0} width={width} height={height} opacity={0}></rect>
        <text x={width/2} y={height/2} stroke="red">Label</text>
      </g>
    */}
    </svg>
  );
}

class ArtGen extends React.Component {

  constructor(props) {
    super(props);
    this.artGenRef = React.createRef();
  }

  componentDidMount() {
    this.redraw();
  }

  componentDidUpdate(prevProps) {
    if(this.props.addressesToBalances) {
      if(prevProps.tokenId !== this.props.tokenId) {
        this.redraw();
      }
      if(!prevProps.addressesToBalances || prevProps.addressesToBalances.toString() !== this.props.addressesToBalances.toString()) {
        this.redraw();
      }
    }
  }

  async redraw() {
    const {
      tokenId,
      addressesToBalances,
      availableTokens,
      emptyTokenNumber,
      uploadResults,
      onUploadComplete,
    } = this.props;


    if(!addressesToBalances && emptyTokenNumber === undefined) {
      return;
    }

    console.log("---")
    console.log("ArtGen for Pinyotta #" + tokenId);
    
    let args = {};
    if(addressesToBalances) {
      console.log("Contents:")
      Object.entries(addressesToBalances).forEach(([address, amount]) => {
        const token = availableTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
        //availableTokens.forEach(t => console.log(t.address, address, t.address === address));
        //console.log({address});
        //console.log(ethers.utils.formatUnits(amount, token.decimals), token.symbol);
      });

      //rng = seedrandom(tokenId + " dev");
      rng = seedrandom(tokenId + " rinkeby");

      const colors = getColorsForTokens(Object.keys(addressesToBalances), availableTokens);
      const numUniqueColors = countUniqueValues(colors);
      const cellShapes = getRandomCellShapes();
      const gridSize = getRandomGridSize();
      const layout = getRandomLayout();
      const density = getRandomDensity(layout, gridSize);
      const filled = getRandomFilled();
      const thickness = getRandomThickness(layout, gridSize, filled, numUniqueColors);
      const drawOrder = getRandomDrawOrder(layout);
      const fillingTechnique = getRandomFillingTechnique();
      const backgroundStyle = getRandomBackgroundStyle();
      const filledShapeStrokeStyling = getRandomFilledShapeStrokeStyling(layout);
      const applyRotation = getRandomApplyRotation(cellShapes);
      const animated = getRandomAnimated(cellShapes);

      args = {
        tokenId,
        availableTokens,
        addressesToBalances,
        colors,
        cellShapes, //: [CellShapes.CutDiamond],//: [CellShapes.SlantedRect], //: [CellShapes.Circle],
        density,//: Densities.Packed, //: Object.values(Densities)[tokenId], //: DENSITIES.Sparse,
        gridSize, //: Object.values(GridSizes)[tokenId - 1],
        filled, //: false,
        filledShapeStrokeStyling,
        thickness, //: 1,
        drawOrder, //: DRAW_ORDERS.BOTTOM_RIGHT_ON_TOP,
        layout,
        fillingTechnique, //: COLORING_STYLE.Alternating,
        backgroundStyle, //: tokenId % 2 === 0 ? Theme.Dark : Theme.Light,
        applyRotation,//: true, //applyRotation,
        animated,
      }
    }
    else {
      args = {
        tokenId,
        emptyTokenNumber,
        animated: true,
      };
    }

    const svg = drawToSVG(args);
    const component = this.artGenRef.current;
    component.innerHTML = ReactDOMServer.renderToStaticMarkup(svg);

    if(uploadResults) {
      // Upload the blob and create an img from URL returned by the server
      const imgURL = await uploadBlob(tokenId, ReactDOMServer.renderToString(svg));
      const img = createImageFromUrl(imgURL);
      component.appendChild(img);

      const metadata = createMetadata({
        ...args,
        imgURL
      });
      await uploadMetadata(tokenId, JSON.stringify(metadata));
      
      if(onUploadComplete) {
        onUploadComplete();
      }
    }
  }

  render() {
    return (
      <div className="ArtGen"
        ref={this.artGenRef}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          width: '500px',
        }}
      />
    );
  }
}

ArtGen.defaultProps = {
  uploadResults: false,
};

export default ArtGen;