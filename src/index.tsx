
import * as React from "react";
import * as ReactDOM from "react-dom";

type RGBColor = { r: number; g: number; b: number; };
type HSVColor = { h: number; s: number; v: number; };

// stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
function convertRGBToHSV(src: RGBColor): HSVColor {
  const min = Math.min(src.r, src.g, src.b);
  const max = Math.max(src.r, src.g, src.b);
  const v = max, delta = max - min;

  if (delta <= 1e-5)
    return { h: 0, s: 0, v };
  if (max <= 1e-5)
    return { h: 0, s: 0, v };

  const s = delta / max;

  let h = 0;
  if (src.r >= max)
    h = (src.g - src.b) / delta;
  else if (src.g >= max)
    h = (2 + (src.b - src.r) / delta);
  else
    h = (4 + (src.r - src.g) / delta);

  h /= 6;
  if (h < 0)
    h += 1;

  return { h, s, v };
}

function convertHSVToRGB(src: HSVColor): RGBColor {
  if (src.s <= 1e-6)
    return { r: src.v, b: src.v, g: src.v };
  const h = (src.h >= 1 ? 0 : src.h) * 6;
  const i = Math.trunc(h), f = h % 1;

  const p = src.v * (1 - src.s),
        q = src.v * (1 - (src.s * f)),
        t = src.v * (1 - (src.s * (1 - f)));

  switch (i) {
    case 0: return { r: src.v, g: t, b: p };
    case 1: return { r: q, g: src.v, b: p };
    case 2: return { r: p, g: src.v, b: t };
    case 3: return { r: p, g: q, b: src.v };
    case 4: return { r: t, g: p, b: src.v };
    case 5: default:
            return { r: src.v, g: p, b: q };
  }
}

type ColorSliderPropType = {
  label: string;
  value: number; // value is a float value
  maxIntValue: number;
  onChange: (value: number) => any;
}

type ColorSliderStateType = {
  tempValue: string;
  tempIntValue: string;
}

class ColorSlider extends React.Component<ColorSliderPropType, ColorSliderStateType> {

  constructor(props: ColorSliderPropType) {
    super(props);

    this.handleIntValueChange = this.handleIntValueChange.bind(this);
    this.handleSliderValueChange = this.handleSliderValueChange.bind(this);
    this.handleInputValueChange = this.handleInputValueChange.bind(this);
    this.handleIntInputValueChange = this.handleIntInputValueChange.bind(this);
    this.handleInputEnter = this.handleInputEnter.bind(this);
    this.handleIntInputEnter = this.handleIntInputEnter.bind(this);
    this.handleInputFocusOut = this.handleInputFocusOut.bind(this);
    this.handleIntInputFocusOut = this.handleIntInputFocusOut.bind(this);

    this.state = {
      tempValue: "0",
      tempIntValue: "0",
    };
  }

  componentDidUpdate(propProps: ColorSliderPropType) {
    if (propProps.value != this.props.value) {
      this.setState({ tempValue: this.props.value.toString() });
      const tempIntValue = Math.trunc(this.props.value * this.props.maxIntValue).toString();
      if (tempIntValue)
        this.setState({ tempIntValue });
    }
  }

  handleFloatValueChange(v: number) {
    this.props.onChange(v);
  }

  handleIntValueChange(v: number) {
    this.handleFloatValueChange(v / this.props.maxIntValue);
  }

  handleSliderValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.handleIntValueChange(parseInt(e.target.value));
  }

  handleInputValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ tempValue: e.target.value });
  }

  handleIntInputValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ tempIntValue: e.target.value });
  }

  handleInputEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode == 13) {
      e.preventDefault();
      const v = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(v))
        this.handleFloatValueChange(v);
    }
  }

  handleIntInputEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode == 13) {
      e.preventDefault();
      const v = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(v))
        this.handleFloatValueChange(v / this.props.maxIntValue);
    }
  }

  handleInputFocusOut(e: any) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(v))
      this.handleFloatValueChange(v);
  }

  handleIntInputFocusOut(e: any) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(v))
      this.handleFloatValueChange(v / this.props.maxIntValue);
  }

  render() {
    const { label, value, maxIntValue } = this.props;
    const { tempValue, tempIntValue } = this.state;

    return (
      <div className="yrhsv-clrslider">
        <span>{label}</span>
        <input className="yrhsv-slider" type="range" min={0} max={maxIntValue} value={value * maxIntValue} onChange={this.handleSliderValueChange} />
        <input className="yrhsv-txtbox" value={tempIntValue} onChange={this.handleIntInputValueChange} onKeyDown={this.handleIntInputEnter} onBlur={this.handleIntInputFocusOut} />
        <input className="yrhsv-txtbox" value={tempValue} onChange={this.handleInputValueChange} onKeyDown={this.handleInputEnter} onBlur={this.handleInputFocusOut} />
      </div>
    );
  }
}

type YRHSVStateType = {
  // should use HSV, not RGB
  // otherwise, weird slider bug awaits ...
  // though I never imagined there is such a devil in such kind of detail ...
  colorHSV: HSVColor;
}

class YRHSV extends React.Component<any, YRHSVStateType> {

  constructor(props: any) {
    super(props);
    this.state = {
      colorHSV: { h: 0, s: 0, v: 0, },
    };

    this.onChangeR = this.onChangeR.bind(this);
    this.onChangeG = this.onChangeG.bind(this);
    this.onChangeB = this.onChangeB.bind(this);

    this.onChangeH = this.onChangeH.bind(this);
    this.onChangeS = this.onChangeS.bind(this);
    this.onChangeV = this.onChangeV.bind(this);
  }

  onChangeH(v: number) {
    this.setState({ colorHSV: { ... this.state.colorHSV, h: v } });
  }

  onChangeS(v: number) {
    this.setState({ colorHSV: { ... this.state.colorHSV, s: v } });
  }

  onChangeV(v: number) {
    this.setState({ colorHSV: { ... this.state.colorHSV, v: v } });
  }

  onChangeR(v: number) {
    const colorRGB = convertHSVToRGB(this.state.colorHSV);
    this.setState({ colorHSV: convertRGBToHSV({ ... colorRGB, r: v }) });
  }

  onChangeG(v: number) {
    const colorRGB = convertHSVToRGB(this.state.colorHSV);
    this.setState({ colorHSV: convertRGBToHSV({ ... colorRGB, g: v }) });
  }

  onChangeB(v: number) {
    const colorRGB = convertHSVToRGB(this.state.colorHSV);
    this.setState({ colorHSV: convertRGBToHSV({ ... colorRGB, b: v }) });
  }

  render() {
    const { colorHSV } = this.state;
    const colorRGB = convertHSVToRGB(colorHSV);

    return (
      <div className="yrhsv-main">
        <div
          className="yrhsv-preview"
          style={{ backgroundColor: `rgb(${colorRGB.r * 256}, ${colorRGB.g * 256}, ${colorRGB.b * 256})` }}
        />

        <div className="yrhsv-sliders">
          <div>
            <ColorSlider label="Red" value={colorRGB.r} maxIntValue={255} onChange={this.onChangeR} />
            <ColorSlider label="Green" value={colorRGB.g} maxIntValue={255} onChange={this.onChangeG} />
            <ColorSlider label="Blue" value={colorRGB.b} maxIntValue={255} onChange={this.onChangeB} />
          </div>

          <hr />

          <div>
            <ColorSlider label="Hue" value={colorHSV.h} maxIntValue={255} onChange={this.onChangeH} />
            <ColorSlider label="Sat." value={colorHSV.s} maxIntValue={255} onChange={this.onChangeS} />
            <ColorSlider label="Value" value={colorHSV.v} maxIntValue={255} onChange={this.onChangeV} />
          </div>
        </div>

      </div>
    );
  }
}

ReactDOM.render(
  <YRHSV />,
  document.getElementById("main")
);
