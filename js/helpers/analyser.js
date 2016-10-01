//The averaging function removes spikes. Needs to be replaced with something.
//Heavily modified from https://github.com/caseif/vis.js/blob/gh-pages/js/analysis/spectrum_algorithms.js


var barWidth = (SpectrumBarCount + Bar1080pSeperation) / SpectrumBarCount - Bar1080pSeperation;
var spectrumDimensionScalar = 4.5
var spectrumMaxExponent = 5
var spectrumMinExponent = 3
var spectrumExponentScale = 2

var SpectrumStart = 4
var SpectrumEnd = 1200
var SpectrumLogScale = 2.6

var resRatio = (window.innerWidth/window.innerHeight)
var spectrumWidth = 1568 * resRatio;
spectrumSpacing = 7 * resRatio;
spectrumWidth = (Bar1080pWidth + Bar1080pSeperation) * SpectrumBarCount - Bar1080pSeperation;

var spectrumHeight = 255

function SpectrumEase(Value) {
  return Math.pow(Value, SpectrumLogScale)
}

function GetVisualBins(Array) {
  var SamplePoints = []
  var NewArray = []
  var LastSpot = 0
  for (var i = 0; i < SpectrumBarCount; i++) {
    var Bin = Math.round(SpectrumEase(i / SpectrumBarCount) * (SpectrumEnd - SpectrumStart) + SpectrumStart)
    if (Bin <= LastSpot) {
      Bin = LastSpot + 1
    }
    LastSpot = Bin
    SamplePoints[i] = Bin
  }

  for (var i = 0; i < SpectrumBarCount; i++) {
    var CurSpot = SamplePoints[i]
    var NextSpot = SamplePoints[i + 2]
    if (NextSpot == null) {
      NextSpot = SpectrumEnd
    }

    var CurMax = Array[CurSpot]
    var Dif = NextSpot - CurSpot
    for (var j = 1; j < Dif; j++) {
      CurMax = Math.max(Array[CurSpot + j],CurMax)
    }
    NewArray[i] = CurMax
  }

  UpdateParticleAttributes(NewArray)
  return NewArray
}

function TransformToVisualBins(Array) {
  Array = AverageTransform(Array)
  Array = exponentialTransform(Array)

  return Array;
}

function AverageTransform(Array) {
    var Length = Array.length


    /*var Values = []
    for (var i = 0; i < Length; i++) {
        var Value = 0
        if (i == 0) {
            Value = Array[i];
        } else {
            var PrevValue = Array[i - 1]
            var CurValue = Array[i]

            Value = (CurValue + PrevValue)/2
        }
        Value = Math.min(Value + 1, spectrumHeight)

        Values[i] = Value;
    }

    return Values*/

    var SamplePoints = []
    for (var i = 0; i < Length; i = i + 2) {
      SamplePoints[SamplePoints.length] = i //+ 1
    }

    function Interpolate(S,E,A) {
      return S + (E-S)*A
    }

    for (var i = 0; i < SamplePoints.length; i++) {
      var CurSamplePoint = SamplePoints[i]
      var NextSamplePoint = SamplePoints[i + 1]
      if (NextSamplePoint) {
        var Dif = NextSamplePoint - CurSamplePoint
        for (var j = 1; j < Dif; j++) {
          Array[CurSamplePoint + j] = Interpolate(Array[CurSamplePoint],Array[NextSamplePoint],j/Dif)
        }
      }
    }

    return Array
}

function exponentialTransform(array) {
    var newArr = [];
    for (var i = 0; i < array.length; i++) {
        var exp = spectrumMaxExponent + (spectrumMinExponent - spectrumMaxExponent) * (i/array.length)
        newArr[i] = Math.max(Math.pow(array[i] / spectrumHeight, exp) * spectrumHeight, 1);
    }
    return newArr;
}
