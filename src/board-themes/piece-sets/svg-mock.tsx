import React from 'react';

export const Svg = (props: any) => React.createElement('svg', props, props.children);
export const Path = (props: any) => React.createElement('path', props);
export const Circle = (props: any) => React.createElement('circle', props);
export const Polygon = (props: any) => React.createElement('polygon', props);
export const Rect = (props: any) => React.createElement('rect', props);
export const Ellipse = (props: any) => React.createElement('ellipse', props);
export const G = (props: any) => React.createElement('g', props, props.children);
export const Defs = (props: any) => React.createElement('defs', props, props.children);
export const LinearGradient = (props: any) => React.createElement('linearGradient', props, props.children);
export const RadialGradient = (props: any) => React.createElement('radialGradient', props, props.children);
export const Stop = (props: any) => React.createElement('stop', props);

export default Svg;
