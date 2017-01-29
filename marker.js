// 本当は非同期でやりたいけどデモなのでこのまま
function getJSON(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
  if(req.readyState == 4 && req.status == 200){
    var data = JSON.parse(req.responseText);
    return data;
  }
}

function convertCoordinate(longitude, latitude) {
  return ol.proj.transform([longitude, latitude], "EPSG:4326","EPSG:900913");
}

// デフォルトのスタイル
var markerStyleDefault = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.75,
    src: 'http://maps.gstatic.com/intl/ja_jp/mapfiles/ms/micons/flag.png'
  })
});

var markerStyleMark = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.75,
    src: 'http://maps.gstatic.com/intl/ja_jp/mapfiles/ms/micons/info.png'
  })
});

var foods = getJSON("data/food.json");
var datas = getJSON("data/test.json");

var features = [];
for(var key in foods) {
  var food = foods[key];
  var data = datas[key];
  var markerFeature = new ol.Feature({
    geometry: new ol.geom.Point(convertCoordinate(food["lon"], food["lat"])),
    name: food["name"],
    like: data["like"],
    time: data["time"],
    img: food["img"],
    href: food["href"]
  });
  if (data["mark"]) {
    markerFeature.setStyle(markerStyleMark);
  }
  features.push(markerFeature);
}

// Feature 一覧 を Source にセット
var markerSource = new ol.source.Vector({
  features: features
});

// Source を Layer にセット
var markerLayer = new ol.layer.Vector({
  source: markerSource,
  style: markerStyleDefault
});
